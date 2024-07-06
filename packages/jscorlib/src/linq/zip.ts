import { assert } from "../diagnostics";
import { Linq$tryGetCountDirect } from "./count";
import { asLinq, LinqWrapper } from "./linqWrapper";
import { IntermediateLinqWrapper } from "./linqWrapper.internal";
import { BuiltInLinqTraits, TryGetCountDirectSymbol } from "./traits";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ZippedSequenceElementSelector<Ts extends any[], TResult> = (...elements: Ts) => TResult;

/**
 * Infrastructure. Do not use this member in your own code.
 */
export type TypeArrayToIterableArray<Ts extends any[]> = { [i in keyof Ts]: Iterable<Ts[i]> };

declare module "./linqWrapper" {
  export interface LinqWrapper<T> {
    zip<T2>(sequence2: Iterable<T2>): LinqWrapper<[T, T2]>;
    zip<T2, TResult>(sequence2: Iterable<T2>, selector?: ZippedSequenceElementSelector<[T, T2], TResult>): LinqWrapper<TResult>;
    zip<T2, T3>(sequence2: Iterable<T2>, sequence3: Iterable<T3>): LinqWrapper<[T, T2]>;
    zip<T2, T3, TResult>(sequence2: Iterable<T2>, sequence3: Iterable<T3>, selector?: ZippedSequenceElementSelector<[T, T2, T3], TResult>): LinqWrapper<TResult>;
    zip<Ts extends any[]>(...sequences: TypeArrayToIterableArray<Ts>): LinqWrapper<[T, ...Ts]>;
    zip<Ts extends any[], TResult>(...args: [...TypeArrayToIterableArray<Ts>, selector?: ZippedSequenceElementSelector<[T, ...Ts], TResult>]): LinqWrapper<TResult>;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Linq$zip<T, Ts extends any[], TResult>(
  this: LinqWrapper<T>,
  ...args: [...TypeArrayToIterableArray<Ts>, selector?: ZippedSequenceElementSelector<[T, ...Ts], TResult>]
): LinqWrapper<TResult> {
  let iterables: TypeArrayToIterableArray<[T, ...Ts]>;
  let selector: ZippedSequenceElementSelector<[T, ...Ts], TResult> | undefined;
  if (typeof args.at(-1) === "function" || args.at(-1) == null) {
    iterables = [this.unwrap(), ...args.slice(0, -1)] as typeof iterables;
    selector = args[args.length - 1] as typeof selector ?? undefined;
  } else {
    iterables = [this.unwrap(), ...args] as typeof iterables;
    selector = undefined;
  }
  return new ZipLinqWrapper<[T, ...Ts], TResult>({
    iterables,
    selector,
  }).asLinq();
}

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
    let cur = Linq$tryGetCountDirect.call(asLinq(iterables[0]));
    if (cur == null) return undefined;
    for (let i = 1; i < iterables.length; i++) {
      const count = Linq$tryGetCountDirect.call(asLinq(iterables[i]));
      if (count == null) return undefined;
      if (cur > count) cur = count;
    }
    return cur;
  }
}
