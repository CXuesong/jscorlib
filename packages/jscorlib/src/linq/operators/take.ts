import { assert } from "../../diagnostics";
import { ArgumentRangeError } from "../../errors";
import { asSafeInteger, SafeInteger } from "../../numbers";
import { PipeBody, PipeFunction } from "../../pipables";
import { tryGetCountDirect } from "./count";
import { asLinq, LinqWrapper } from "../linqWrapper";
import { AbstractLinqWrapper, IntermediateLinqWrapper } from "../internal";
import { BuiltInLinqTraits, TryGetCountDirectSymbol } from "../traits";

export function skip<T>(count: SafeInteger): PipeBody<LinqWrapper<T>, LinqWrapper<T>> {
  return target => {
    count = asSafeInteger(count);
    if (count < 0) throw ArgumentRangeError.create(0, "count", "Expect value to be non-negative.");
    if (count === 0) return target;
    if (target instanceof SkipTakeLinqWrapper) {
      const state = target.__state;
      if (state.take == null) {
        return new SkipTakeLinqWrapper<T>({
          ...state,
          skip: state.skip + count,
        });
      }
      // has take limitation
      if (state.take > count) {
        return new SkipTakeLinqWrapper<T>({
          ...state,
          skip: state.skip + count,
          take: state.take - count,
        });
      }
      // skipped too far
      return EmptyLinqWrapper.instance;
    }
    return new SkipTakeLinqWrapper({
      iterable: target.unwrap(),
      skip: count,
      take: undefined,
    });
  };
}
skip satisfies PipeFunction;

export function take<T>(count: SafeInteger): PipeBody<LinqWrapper<T>, LinqWrapper<T>> {
  return target => {
    count = asSafeInteger(count);
    if (count < 0) throw ArgumentRangeError.create(0, "count", "Expect value to be non-negative.");
    if (count === 0) return EmptyLinqWrapper.instance;
    if (target instanceof SkipTakeLinqWrapper) {
      const state = target.__state;
      return new SkipTakeLinqWrapper<T>({
        ...state,
        take: state.take == null ? count : Math.min(state.take, count),
      });
    }
    return new SkipTakeLinqWrapper({
      iterable: target.unwrap(),
      skip: 0,
      take: count,
    });
  };
}
take satisfies PipeFunction;

// takeWhile(predicate: IndexedSequenceElementPredicate<T>): LinqWrapper<T>;
// takeWhile<TResult extends T>(predicate: SequenceElementTypeAssertionPredicate<T, TResult>): LinqWrapper<TResult>;


interface SkipTakeIteratorInfo<T> {
  readonly iterable: Iterable<T>;
  readonly skip: number;
  // >= 0: take x items; undefined: take all items.
  readonly take: number | undefined;
}

class SkipTakeLinqWrapper<T> extends IntermediateLinqWrapper<T, SkipTakeIteratorInfo<T>> implements BuiltInLinqTraits<T> {
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
    let count = asLinq(this.__state.iterable).$(tryGetCountDirect());
    if (count == null) return undefined;
    count -= this.__state.skip;
    // All the items have been skipped.
    if (count < 0) return 0;
    if (this.__state.take != null) count = Math.min(count, this.__state.take);
    return count;
  }
}

class EmptyLinqWrapper extends AbstractLinqWrapper<never> implements BuiltInLinqTraits<never> {
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
