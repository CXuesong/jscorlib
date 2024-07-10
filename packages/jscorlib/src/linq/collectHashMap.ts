import { HashMap } from "../collections";
import { EqualityComparer } from "../collections/equalityComparison";
import type { LinqWrapper } from "./linqWrapper";
import { SequenceElementSelector } from "./typing";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> {
    toHashMap<TKey>(keySelector: SequenceElementSelector<T, TKey>, comparer?: EqualityComparer<TKey>): HashMap<TKey, T>;
    toHashMap<TKey, TValue>(keySelector: SequenceElementSelector<T, TKey>, valueSelector: SequenceElementSelector<T, TValue>, comparer?: EqualityComparer<TKey>): HashMap<TKey, TValue>;
  }
}

export function Linq$toHashMap<T, TKey, TValue>(
  this: LinqWrapper<T>,
  keySelector: SequenceElementSelector<T, TKey>,
  valueSelector?: SequenceElementSelector<T, TValue> | EqualityComparer<TKey>,
  comparer?: EqualityComparer<TKey>,
): HashMap<TKey, TValue> {
  if (typeof valueSelector === "object") {
    comparer = valueSelector;
    valueSelector = undefined;
  }

  const map = new HashMap<TKey, TValue>(comparer);
  let i = 0;
  if (valueSelector) {
    for (const e of this.unwrap()) {
      // We are not checking for key conflict -- natually JS is not throwing error for key conflicts like Java/Python.
      map.set(keySelector(e, i), valueSelector(e, i));
      i++;
    }
  } else {
    for (const e of this.unwrap()) {
      map.set(keySelector(e, i), e as unknown as TValue);
      i++;
    }
  }
  return map;
}
