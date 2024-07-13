import { HashMap } from "../collections";
import { EqualityComparer } from "../collections/equalityComparison";
import { LinqWrapper } from "./linqWrapper";
import { IterableFactoryLinqWrapper } from "./linqWrapper.internal";
import { SequenceElementSimpleSelector } from "./typing";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> {
    groupBy<TKey>(keySelector: SequenceElementSimpleSelector<T, TKey>, comparer?: EqualityComparer<T>): LinqWrapper<LinqGrouping<TKey, T>>;
  }
}

/**
 * Represents basic traits of a group after grouping the input sequence.
 * 
 * @template TKey type of the group key.
 * @template TValue type of the element from the input sequence.
*/
export interface LinqGrouping<TKey, TValue> {
  key: TKey;
  values: Iterable<TValue>;
}

export function Linq$groupBy<T, TKey>(
  this: LinqWrapper<T>,
  keySelector: SequenceElementSimpleSelector<T, TKey>,
  comparer?: EqualityComparer<TKey>,
): LinqWrapper<LinqGrouping<TKey, T>> {
  const unwrapped = this.unwrap();
  return new IterableFactoryLinqWrapper(() => groupingIterable(unwrapped, keySelector, comparer)).asLinq();
}

function groupingIterable<T, TKey>(
  iterable: Iterable<T>,
  keySelector: SequenceElementSimpleSelector<T, TKey>,
  comparer?: EqualityComparer<TKey>,
): Iterable<LinqGrouping<TKey, T>> {
  interface ArrayLinqGrouping extends LinqGrouping<TKey, T> {
    values: T[];
  }
  const map = comparer ? new HashMap<TKey, ArrayLinqGrouping>(comparer) : new Map<TKey, ArrayLinqGrouping>();
  for (const e of iterable) {
    const key = keySelector(e);
    let group = map.get(key);
    if (!group) {
      group = {
        key,
        values: [],
      };
      map.set(key, group);
    }
    group.values.push(e);
  }
  return map.values();
}
