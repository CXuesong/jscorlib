import { HashMap } from "../../collections";
import { HashableEqualityComparer } from "../../collections/equalityComparison";
import type { LinqWrapper } from "../linqWrapper";
import { IndexedSequenceElementSelector } from "./typing";
import { PipeBody, PipeFunction } from "../../pipables";

export function toHashMap<T, TKey>(keySelector: IndexedSequenceElementSelector<T, TKey>, comparer?: HashableEqualityComparer<TKey>): PipeBody<LinqWrapper<T>, HashMap<TKey, T>>;
export function toHashMap<T, TKey, TValue>(keySelector: IndexedSequenceElementSelector<T, TKey>, valueSelector: IndexedSequenceElementSelector<T, TValue>, comparer?: HashableEqualityComparer<TKey>): PipeBody<LinqWrapper<T>, HashMap<TKey, TValue>>;
export function toHashMap<T, TKey, TValue>(
  keySelector: IndexedSequenceElementSelector<T, TKey>,
  valueSelector?: IndexedSequenceElementSelector<T, TValue> | HashableEqualityComparer<TKey>,
  comparer?: HashableEqualityComparer<TKey>,
): PipeBody<LinqWrapper<T>, HashMap<TKey, TValue>> {
  return target => {
    if (typeof valueSelector === "object") {
      comparer = valueSelector;
      valueSelector = undefined;
    }

    const map = new HashMap<TKey, TValue>(comparer);
    let i = 0;
    if (valueSelector) {
      for (const e of target.unwrap()) {
        // We are not checking for key conflict -- natually JS is not throwing error for key conflicts like Java/Python.
        map.set(keySelector(e, i), valueSelector(e, i));
        i++;
      }
    } else {
      for (const e of target.unwrap()) {
        map.set(keySelector(e, i), e as unknown as TValue);
        i++;
      }
    }
    return map;
  };
}
toHashMap satisfies PipeFunction;
