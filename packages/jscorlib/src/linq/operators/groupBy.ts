import { HashMap } from "../../collections";
import { EqualityComparer } from "../../collections/equalityComparison";
import { LinqWrapper } from "../linqWrapper";
import { IntermediateLinqWrapper, IterableLinqWrapper } from "../internal";
import { SequenceElementSelector } from "./typing";
import { PipeBody, PipeFunction } from "../../pipables";

/**
 * Represents basic traits of a group after grouping the input sequence.
 * 
 * @template TKey type of the group key.
 * @template TValue type of the element from the input sequence.
*/
export interface LinqGrouping<TKey, TValue> {
  /** The grouping key. */
  key: TKey;
  /** The abstracted representation of value sequence. */
  values: LinqWrapper<TValue>;
}

export function groupBy<T, TKey>(
  keySelector: SequenceElementSelector<T, TKey>,
  comparer?: EqualityComparer<TKey>,
): PipeBody<LinqWrapper<T>, LinqWrapper<LinqGrouping<TKey, T>>> {
  return target => {
    const unwrapped = target.unwrap();
    return new GroupingLinqWrapper({
      iterable: unwrapped,
      keySelector,
      comparer,
    });
  };
}
groupBy satisfies PipeFunction;

interface GroupingIteratorInfo<T, TKey> {
  readonly iterable: Iterable<T>;
  keySelector: SequenceElementSelector<T, TKey>,
  comparer?: EqualityComparer<TKey>,
}

class GroupingLinqWrapper<T, TKey> extends IntermediateLinqWrapper<LinqGrouping<TKey, T>, GroupingIteratorInfo<T, TKey>> {
  public override *[Symbol.iterator](): Iterator<LinqGrouping<TKey, T>> {
    const { iterable, keySelector, comparer } = this.__state;
    const map = comparer ? new HashMap<TKey, T[]>(comparer) : new Map<TKey, T[]>();
    for (const e of iterable) {
      const key = keySelector(e);
      let values = map.get(key);
      if (!values) {
        values = [];
        map.set(key, values);
      }
      values.push(e);
    }
    // n.b. iterable iterators cannot rewind by themselves.
    for (const [key, values] of map) {
      yield {
        key,
        values: new IterableLinqWrapper(values),
      };
    }
  }
}
