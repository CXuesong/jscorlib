import { HashSet } from "../collections/hashSet";
import { EqualityComparer } from "../collections/equalityComparison";
import type { LinqWrapper } from "./linqWrapper";
import { IntermediateLinqWrapper } from "./linqWrapper.internal";
import { SequenceElementSimpleSelector } from "./typing";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> {
    distinct(comparer?: EqualityComparer<T>): LinqWrapper<T>;
    distinctBy<TKey>(keySelector: SequenceElementSimpleSelector<T, TKey>, comparer?: EqualityComparer<TKey>): LinqWrapper<T>;
  }
}

export function Linq$distinct<T>(this: LinqWrapper<T>, comparer?: EqualityComparer<T>): LinqWrapper<T> {
  if (this instanceof DistinctLinqWrapper) {
    const state = this.__state;
    // Trivial: distinct gets chained multiple times.
    if (state.keySelector == null) return this;
  }
  return new DistinctLinqWrapper({
    iterable: this.unwrap(),
    comparer,
  }).asLinq();
}

export function Linq$distinctBy<T, TKey>(this: LinqWrapper<T>, keySelector: SequenceElementSimpleSelector<T, TKey>, comparer?: EqualityComparer<TKey>): LinqWrapper<T> {
  if (this instanceof DistinctLinqWrapper) {
    const state = this.__state;
    // Trivial: distinct gets chained multiple times with the same keySelector (while almost impossible)
    if (state.keySelector == keySelector) return this;
  }
  return new DistinctLinqWrapper({
    iterable: this.unwrap(),
    keySelector,
    comparer,
  }).asLinq();
}

interface DistinctIteratorInfo<T, TKey> {
  readonly iterable: Iterable<T>;
  keySelector?: SequenceElementSimpleSelector<T, TKey>;
  comparer?: EqualityComparer<TKey>
}

class DistinctLinqWrapper<T, TKey> extends IntermediateLinqWrapper<T, DistinctIteratorInfo<T, TKey>> {
  public override *[Symbol.iterator](): Iterator<T> {
    const { iterable, keySelector, comparer } = this.__state;
    const seenKeys = comparer ? new HashSet<unknown>(comparer) : new Set<unknown>();
    if (keySelector) {
      for (const e of iterable) {
        const key = keySelector(e);
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        yield e;
      }
    } else {
      for (const e of iterable) {
        if (seenKeys.has(e)) continue;
        seenKeys.add(e);
        yield e;
      }
    }
  }
}
