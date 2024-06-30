import { assert } from "../../diagnostics";
import { ArgumentRangeError } from "../../errors";
import { asSafeInteger, SafeInteger } from "../../numbers";
import { asLinq, LinqWrapper } from "./linqWrapper";
import { AbstractLinqWrapper, IntermediateLinqWrapper } from "./linqWrapper.internal";
import { BuiltInLinqTraits, TryGetCountDirectSymbol } from "./traits";
import { SequenceElementPredicate, SequenceElementTypeAssertionPredicate } from "./typing";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> {
    skip(count: SafeInteger): LinqWrapper<T>;
    take(count: SafeInteger): LinqWrapper<T>;
    takeWhile(predicate: SequenceElementPredicate<T>): LinqWrapper<T>;
    takeWhile<TResult extends T>(predicate: SequenceElementTypeAssertionPredicate<T, TResult>): LinqWrapper<TResult>;
  }
}

export function Linq$skip<T>(this: LinqWrapper<T>, count: SafeInteger): LinqWrapper<T> {
  count = asSafeInteger(count);
  if (count < 0) throw ArgumentRangeError.create(0, "count", "Expect value to be non-negative.");
  if (count === 0) return this;
  if (this instanceof SkipTakeLinqWrapper) {
    const state = this.__state;
    if (state.take == null) {
      return new SkipTakeLinqWrapper<T>({
        ...state,
        skip: state.skip + count,
      }).asLinq();
    }
    // has take limitation
    if (state.take > count) {
      return new SkipTakeLinqWrapper<T>({
        ...state,
        skip: state.skip + count,
        take: state.take - count,
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
    const state = this.__state;
    return new SkipTakeLinqWrapper<T>({
      ...state,
      take: state.take == null ? count : Math.min(state.take, count),
    }).asLinq();
  }
  return new SkipTakeLinqWrapper({
    iterable: this.unwrap(),
    skip: 0,
    take: count,
  }).asLinq();
}

interface SkipTakeIteratorInfo<T> {
  readonly iterable: Iterable<T>;
  readonly skip: number;
  // >= 0: take x items; undefined: take all items.
  readonly take: number | undefined;
}

class SkipTakeLinqWrapper<T> extends IntermediateLinqWrapper<T, SkipTakeIteratorInfo<T>> implements BuiltInLinqTraits {
  public override *[Symbol.iterator](): Iterator<T> {
    // e.g. skip = 1, take = 2
    // 0 1 2 3 4 5
    //   x x
    const state = this.__state;
    assert(state.skip >= 0);
    assert(state.take == null || state.take >= 0);
    let index = 0;
    if (state.take == null) {
      for (const e of state.iterable) {
        if (index >= state.skip) yield e;
        index++;
      }
    } else {
      for (const e of state.iterable) {
        if (index >= state.skip + state.take) return;
        if (index >= state.skip) yield e;
        index++;
      }
    }
  }
  public override[TryGetCountDirectSymbol](): number | undefined {
    let count = asLinq(this.__state.iterable).tryGetCountDirect();
    if (count == null) return undefined;
    count -= this.__state.skip;
    // All the items have been skipped.
    if (count < 0) return 0;
    if (this.__state.take != null) count = Math.min(count, this.__state.take);
    return count;
  }
}

class EmptyLinqWrapper extends AbstractLinqWrapper<never> implements BuiltInLinqTraits {
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
  public override[TryGetCountDirectSymbol](): number | undefined {
    return 0;
  }
}
