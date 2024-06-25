import { assert } from "../../diagnostics";
import { ArgumentRangeError } from "../../errors";
import { asSafeInteger, SafeInteger } from "../../numbers";
import type { LinqWrapper } from "./linqWrapper";
import { AbstractLinqWrapper } from "./linqWrapper.internal";
import { SequenceElementPredicate, SequenceElementTypeAssertionPredicate } from "./typing";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> extends LinqWrapperBase<T> {
    skip(count: SafeInteger): LinqWrapper<T>;
    take(count: SafeInteger): LinqWrapper<T>;
    takeWhile(predicate: SequenceElementPredicate<T>): LinqWrapper<T>;
    takeWhile<TResult extends T>(predicate: SequenceElementTypeAssertionPredicate<T, TResult>): LinqWrapper<TResult>;
  }
}

const SkipTakeIteratorInfoSymbol = Symbol("SkipTakeIteratorInfo");

interface SkipTakeIteratorInfo<T> {
  readonly iterable: Iterable<T>;
  readonly skip: number;
  // >= 0: take x items; undefined: take all items.
  readonly take: number | undefined;
}

export function Linq$skip<T>(this: LinqWrapper<T>, count: SafeInteger): LinqWrapper<T> {
  count = asSafeInteger(count);
  if (count < 0) throw ArgumentRangeError.create(0, "count", "Expect value to be non-negative.");
  if (count === 0) return this;
  if (this instanceof SkipTakeLinqWrapper) {
    const thisInfo = this[SkipTakeIteratorInfoSymbol];
    if (thisInfo.take == null) {
      return new SkipTakeLinqWrapper<T>({
        ...thisInfo,
        skip: thisInfo.skip + count,
      }).asLinq();
    }
    // has take limitation
    if (thisInfo.take > count) {
      return new SkipTakeLinqWrapper<T>({
        ...thisInfo,
        skip: thisInfo.skip + count,
        take: thisInfo.take - count,
      }).asLinq();
    }
    // skipped too far
    return EmptyLinqWrapper.instance.asLinq();
  }
  return new SkipTakeLinqWrapper({
    iterable: this.unwrap(),
    skip: count,
    take: undefined,
  }).asLinq();
}

export function Linq$take<T>(this: LinqWrapper<T>, count: SafeInteger): LinqWrapper<T> {
  count = asSafeInteger(count);
  if (count < 0) throw ArgumentRangeError.create(0, "count", "Expect value to be non-negative.");
  if (count === 0) return EmptyLinqWrapper.instance.asLinq();
  if (this instanceof SkipTakeLinqWrapper) {
    const thisInfo = this[SkipTakeIteratorInfoSymbol];
    return new SkipTakeLinqWrapper<T>({
      ...thisInfo,
      take: thisInfo.take == null ? count : Math.min(thisInfo.take, count),
    }).asLinq();
  }
  return new SkipTakeLinqWrapper({
    iterable: this.unwrap(),
    skip: 0,
    take: count,
  }).asLinq();
}

class SkipTakeLinqWrapper<T> extends AbstractLinqWrapper<T> {
  public [SkipTakeIteratorInfoSymbol]: SkipTakeIteratorInfo<T>;
  public constructor(info: SkipTakeIteratorInfo<T>) {
    super();
    this[SkipTakeIteratorInfoSymbol] = info;
  }
  public override *[Symbol.iterator](): Iterator<T> {
    // e.g. skip = 1, take = 2
    // 0 1 2 3 4 5
    //   x x
    const info = this[SkipTakeIteratorInfoSymbol];
    assert(info.skip >= 0);
    assert(info.take == null || info.take >= 0);
    let index = 0;
    if (info.take == null) {
      for (const e of info.iterable) {
        if (index < info.skip) continue;
        yield e;
        index++;
      }
    } else {
      for (const e of info.iterable) {
        if (index < info.skip) continue;
        if (index >= info.skip + info.take) return;
        yield e;
        index++;
      }
    }
  }
}

class EmptyLinqWrapper extends AbstractLinqWrapper<never> {
  private static _instance: EmptyLinqWrapper | undefined;
  public constructor() {
    super();
  }
  public static get instance(): EmptyLinqWrapper {
    return this._instance ??= new EmptyLinqWrapper();
  }
  public override *[Symbol.iterator](): Iterator<never> {
    // Nothing to enumerate
  }
}
