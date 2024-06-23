import type { LinqWrapper } from "./linqWrapper";
import { SequenceElementSelector } from "./typing";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> extends LinqWrapperBase<T> {
    toArray(): T[];
    toMap<TKey>(keySelector: SequenceElementSelector<T, TKey>): Map<TKey, T>;
    toMap<TKey, TValue>(keySelector: SequenceElementSelector<T, TKey>, valueSelector: SequenceElementSelector<T, TValue>): Map<TKey, TValue>;
    toSet(): Set<T>;
    toSet<TValue>(valueSelector: SequenceElementSelector<T, TValue>): Set<TValue>;
  }
}

export function Linq$toArray<T>(this: LinqWrapper<T>): T[] {
  const arr: T[] = [];
  for (const e of this.unwrap()) arr.push(e);
  return arr;
}

export function Linq$toMap<T, TKey, TValue>(
  this: LinqWrapper<T>,
  keySelector: SequenceElementSelector<T, TKey>,
  valueSelector?: SequenceElementSelector<T, TValue>,
): Map<TKey, TValue> {
  const map = new Map<TKey, TValue>();
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

export function Linq$toSet<T, TValue>(
  this: LinqWrapper<T>,
  valueSelector?: SequenceElementSelector<T, TValue>,
): Set<TValue> {
  const set = new Set<TValue>();
  let i = 0;
  if (valueSelector) {
    for (const e of this.unwrap()) {
      set.add(valueSelector(e, i));
      i++;
    }
  } else {
    for (const e of this.unwrap()) {
      set.add(e as unknown as TValue);
      i++;
    }
  }
  return set;
}
