import { HashSet } from "../collections";
import { EqualityComparer } from "../collections/equalityComparison";
import type { LinqWrapper } from "./linqWrapper";
import { IndexedSequenceElementSelector } from "./typing";
import { PipeBody, PipeFunction } from "../pipables";

export function toHashSet<T, TValue = T>(
  valueSelector?: IndexedSequenceElementSelector<T, TValue> | EqualityComparer<TValue>,
  comparer?: EqualityComparer<TValue>,
): PipeBody<LinqWrapper<T>, HashSet<TValue>> {
  return target => {
    if (typeof valueSelector === "object") {
      comparer = valueSelector;
      valueSelector = undefined;
    }

    const set = new HashSet<TValue>(comparer);
    if (valueSelector) {
      let i = 0;
      for (const e of target.unwrap()) {
        // We are not checking for key conflict -- natually JS is not throwing error for key conflicts like Java/Python.
        set.add(valueSelector(e, i));
        i++;
      }
    } else {
      for (const e of target.unwrap()) {
        set.add(e as unknown as TValue);
      }
    }
    return set;
  };
}
toHashSet satisfies PipeFunction;
