import { assert } from "../diagnostics";
import { tryGetCountDirect } from "./count";
import { asLinq, LinqWrapper } from "./linqWrapper";
import { IntermediateLinqWrapper } from "./linqWrapper.internal";
import { BuiltInLinqTraits, TryGetCountDirectSymbol } from "./traits";
import { PipeBody, PipeFunction } from "../pipables";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ZippedSequenceElementSelector<Ts extends any[], TResult> = (...elements: Ts) => TResult;

/**
 * Infrastructure. Do not use this member in your own code.
 */
export type TypeArrayToIterableArray<Ts extends any[]> = { [i in keyof Ts]: Iterable<Ts[i]> };

export function zip<T, T2>(sequence2: Iterable<T2>): PipeBody<LinqWrapper<T>, LinqWrapper<[T, T2]>>;
export function zip<T, T2, TResult>(sequence2: Iterable<T2>, selector?: ZippedSequenceElementSelector<[T, T2], TResult>): PipeBody<LinqWrapper<T>, LinqWrapper<TResult>>;
export function zip<T, T2, T3>(sequence2: Iterable<T2>, sequence3: Iterable<T3>): PipeBody<LinqWrapper<T>, LinqWrapper<[T, T2, T3]>>;
export function zip<T, T2, T3, TResult>(sequence2: Iterable<T2>, sequence3: Iterable<T3>, selector?: ZippedSequenceElementSelector<[T, T2, T3], TResult>): PipeBody<LinqWrapper<T>, LinqWrapper<TResult>>;
export function zip<T, Ts extends any[]>(...sequences: TypeArrayToIterableArray<Ts>): PipeBody<LinqWrapper<T>, LinqWrapper<[T, ...Ts]>>;
export function zip<T, Ts extends any[], TResult>(...args: [...TypeArrayToIterableArray<Ts>, selector?: ZippedSequenceElementSelector<[T, ...Ts], TResult>]): PipeBody<LinqWrapper<T>, LinqWrapper<TResult>>;
export function zip<T, Ts extends any[], TResult>(
  ...args: [...TypeArrayToIterableArray<Ts>, selector?: ZippedSequenceElementSelector<[T, ...Ts], TResult>]
): PipeBody<LinqWrapper<T>, LinqWrapper<TResult>> {
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return target => {
    let iterables: TypeArrayToIterableArray<[T, ...Ts]>;
    let selector: ZippedSequenceElementSelector<[T, ...Ts], TResult> | undefined;
    if (typeof args.at(-1) === "function" || args.at(-1) == null) {
      iterables = [target.unwrap(), ...args.slice(0, -1)] as typeof iterables;
      selector = args[args.length - 1] as typeof selector ?? undefined;
    } else {
      iterables = [target.unwrap(), ...args] as typeof iterables;
      selector = undefined;
    }
    return new ZipLinqWrapper<[T, ...Ts], TResult>({
      iterables,
      selector,
    });
  };
}
zip satisfies PipeFunction;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ZipIteratorState<Ts extends any[], TResult> {
  readonly iterables: Array<Iterable<Ts[number]>>;
  selector?: ZippedSequenceElementSelector<Ts, TResult>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class ZipLinqWrapper<Ts extends any[], TResult = Ts>
  extends IntermediateLinqWrapper<TResult, ZipIteratorState<Ts, TResult>>
  implements BuiltInLinqTraits<TResult> {
  public override *[Symbol.iterator](): Iterator<TResult> {
    const { iterables, selector } = this.__state;
    const iterators = iterables.map(it => it[Symbol.iterator]());
    while (true) {
      const currentItem = [] as unknown as Ts;
      for (const it of iterators) {
        const next = it.next();
        if (next.done) return;
        currentItem.push(next.value);
      }
      if (selector)
        yield selector(...currentItem);
      else
        yield currentItem as unknown as TResult;
    }
  }
  public [TryGetCountDirectSymbol](): number | undefined {
    const { iterables } = this.__state;
    assert(iterables.length > 0);
    let cur = asLinq(iterables[0]).$(tryGetCountDirect());
    if (cur == null) return undefined;
    for (let i = 1; i < iterables.length; i++) {
      const count = asLinq(iterables[i]).$(tryGetCountDirect());
      if (count == null) return undefined;
      if (cur > count) cur = count;
    }
    return cur;
  }
}
