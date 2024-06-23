import type { LinqWrapper } from "./linqWrapper";
import { LinqWrapperImpl } from "./linqWrapper.internal";
import { SequenceElementSelector } from "./typing";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> extends LinqWrapperBase<T> {
    select<TResult>(selector: SequenceElementSelector<T, TResult>): LinqWrapper<TResult>;
    selectMany<TResult>(selector: SequenceElementSelector<T, Iterable<TResult>>): LinqWrapper<TResult>;
  }
}

export function Linq$select<T, TResult>(this: LinqWrapper<T>, selector: SequenceElementSelector<T, TResult>): LinqWrapper<TResult> {
  const wrapper = LinqWrapperImpl.create(selectIterable(this.unwrap(), selector));
  // projection does not change item count.
  wrapper.tryGetCountDirect = () => this.tryGetCountDirect();
  return wrapper;
}

export function Linq$selectMany<T, TResult>(this: LinqWrapper<T>, selector: SequenceElementSelector<T, Iterable<TResult>>): LinqWrapper<TResult> {
  return LinqWrapperImpl.create(selectManyIterable(this.unwrap(), selector));
}

function* selectIterable<T, TResult>(iterable: Iterable<T>, selector: SequenceElementSelector<T, TResult>): Iterable<TResult> {
  let index = 0;
  for (const e of iterable) {
    yield selector(e, index);
    index++;
  }
}

function* selectManyIterable<T, TResult>(iterable: Iterable<T>, selector: SequenceElementSelector<T, Iterable<TResult>>): Iterable<TResult> {
  let index = 0;
  for (const e of iterable) {
    yield* selector(e, index);
    index++;
  }
}
