import { EqualityComparer } from "../collections/equalityComparison";
import { HashSet } from "../collections/hashSet";
import { PipeBody, PipeFunction } from "../pipables";
import type { LinqWrapper } from "./linqWrapper";
import { IntermediateLinqWrapper } from "./linqWrapper.internal";
import { SequenceElementSelector } from "./typing";

export function distinct<T>(comparer?: EqualityComparer<T>): PipeBody<LinqWrapper<T>, LinqWrapper<T>> {
  return target => {
    if (target instanceof DistinctLinqWrapper) {
      const state = target.__state;
      // Trivial: distinct gets chained multiple times.
      if (state.keySelector == null) return target;
    }
    return new DistinctLinqWrapper({
      iterable: target.unwrap(),
      comparer,
    });
  };
}
distinct satisfies PipeFunction;

export function distinctBy<T, TKey>(keySelector: SequenceElementSelector<T, TKey>, comparer?: EqualityComparer<TKey>): PipeBody<LinqWrapper<T>, LinqWrapper<T>> {
  return target => {
    if (target instanceof DistinctLinqWrapper) {
      const state = target.__state;
      // Trivial: distinct gets chained multiple times with the same keySelector (while almost impossible)
      if (state.keySelector == keySelector) return target;
    }
    return new DistinctLinqWrapper({
      iterable: target.unwrap(),
      keySelector,
      comparer,
    });
  };
}
distinctBy satisfies PipeFunction;

interface DistinctIteratorInfo<T, TKey> {
  readonly iterable: Iterable<T>;
  keySelector?: SequenceElementSelector<T, TKey>;
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
