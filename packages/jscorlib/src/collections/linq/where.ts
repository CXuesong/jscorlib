import type { LinqWrapper } from "./linqWrapper";
import { LinqWrapperImpl } from "./linqWrapper.internal";
import { SequenceElementPredicate, SequenceElementTypeAssertionPredicate } from "./typing";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> extends LinqWrapperBase<T> {
    where<TReturn extends T>(predicate: SequenceElementTypeAssertionPredicate<T, TReturn>): LinqWrapper<TReturn>;
    where(predicate: SequenceElementPredicate<T>): LinqWrapper<T>;
  }
}

export function Linq$where<T>(this: LinqWrapper<T>, predicate: SequenceElementPredicate<T>): LinqWrapper<T> {
  // n.b. Even if `this` is empty upon the time of invocation of this function,
  // `this` may have items when iterator gets enumerated later.
  return LinqWrapperImpl.create(whereIterable(this.unwrap(), predicate));
}

function* whereIterable<T>(iterable: Iterable<T>, predicate: SequenceElementPredicate<T>): Iterable<T> {
  let index = 0;
  for (const e of iterable) {
    if (predicate(e, index)) yield e;
    index++;
  }
}
