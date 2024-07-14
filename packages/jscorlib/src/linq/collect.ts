import type { LinqWrapper } from "./linqWrapper";
import { IndexedSequenceElementSelector } from "./typing";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> {
    toArray(): T[];
    toMap<TKey>(keySelector: IndexedSequenceElementSelector<T, TKey>): Map<TKey, T>;
    toMap<TKey, TValue>(keySelector: IndexedSequenceElementSelector<T, TKey>, valueSelector: IndexedSequenceElementSelector<T, TValue>): Map<TKey, TValue>;
    toMultiMap<TKey, TValue>(keySelector: IndexedSequenceElementSelector<T, TKey>): Map<TKey, TValue[]>;
    toMultiMap<TKey, TValue>(keySelector: IndexedSequenceElementSelector<T, TKey>, valueSelector: IndexedSequenceElementSelector<T, TValue>): Map<TKey, TValue[]>;
    toSet(): Set<T>;
    toSet<TValue>(valueSelector: IndexedSequenceElementSelector<T, TValue>): Set<TValue>;
  }
}

export function Linq$toArray<T>(this: LinqWrapper<T>): T[] {
  const arr: T[] = [];
  for (const e of this.unwrap()) arr.push(e);
  return arr;
}

export function Linq$toMap<T, TKey, TValue>(
  this: LinqWrapper<T>,
  keySelector: IndexedSequenceElementSelector<T, TKey>,
  valueSelector?: IndexedSequenceElementSelector<T, TValue>,
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

export function Linq$toMultiMap<T, TKey, TValue>(
  this: LinqWrapper<T>,
  keySelector: IndexedSequenceElementSelector<T, TKey>,
  valueSelector?: IndexedSequenceElementSelector<T, TValue>,
): Map<TKey, TValue[]> {
  const map = new Map<TKey, TValue[]>();
  let i = 0;
  if (valueSelector) {
    for (const e of this.unwrap()) {
      const key = keySelector(e, i);
      let values = map.get(key);
      if (!values) {
        values = [];
        map.set(key, values);
      }
      values.push(valueSelector(e, i));
      i++;
    }
  } else {
    for (const e of this.unwrap()) {
      const key = keySelector(e, i);
      let values = map.get(key);
      if (!values) {
        values = [];
        map.set(key, values);
      }
      values.push(e as unknown as TValue);
      i++;
    }
  }
  return map;
}

export function Linq$toSet<T, TValue = T>(
  this: LinqWrapper<T>,
  valueSelector?: IndexedSequenceElementSelector<T, TValue>,
): Set<TValue> {
  const set = new Set<TValue>();
  if (valueSelector) {
    let i = 0;
    for (const e of this.unwrap()) {
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
