import { HashSet } from "../collections";
import { EqualityComparer } from "../collections/equalityComparison";
import type { LinqWrapper } from "./linqWrapper";
import { SequenceElementSelector } from "./typing";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> {
    toHashSet(comparer?: EqualityComparer<T>): HashSet<T>;
    toHashSet<TValue>(valueSelector: SequenceElementSelector<T, TValue>, comparer?: EqualityComparer<TValue>): HashSet<TValue>;
  }
}

export function Linq$toHashSet<T, TValue = T>(
  this: LinqWrapper<T>,
  valueSelector?: SequenceElementSelector<T, TValue> | EqualityComparer<TValue>,
  comparer?: EqualityComparer<TValue>,
): HashSet<TValue> {
  if (typeof valueSelector === "object") {
    comparer = valueSelector;
    valueSelector = undefined;
  }

  const set = new HashSet<TValue>(comparer);
  if (valueSelector) {
    let i = 0;
    for (const e of this.unwrap()) {
      // We are not checking for key conflict -- natually JS is not throwing error for key conflicts like Java/Python.
      set.add(valueSelector(e, i));
      i++;
    }
  } else {
    for (const e of this.unwrap()) {
      set.add(e as unknown as TValue);
    }
  }
  return set;
}
