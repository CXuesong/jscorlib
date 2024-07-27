import { PipeBody, PipeFunction } from "../pipables";
import type { LinqWrapper } from "./linqWrapper";
import { IndexedSequenceElementSelector } from "./typing";

export function toArray<T>(): PipeBody<LinqWrapper<T>, T[]> {
  return target => {
    const arr: T[] = [];
    for (const e of target.unwrap()) arr.push(e);
    return arr;
  };
}
toArray satisfies PipeFunction;

export function toMap<T, TKey>(keySelector: IndexedSequenceElementSelector<T, TKey>): PipeBody<LinqWrapper<T>, Map<TKey, T>>;
export function toMap<T, TKey, TValue>(
  keySelector: IndexedSequenceElementSelector<T, TKey>,
  valueSelector: IndexedSequenceElementSelector<T, TValue>
): PipeBody<LinqWrapper<T>, Map<TKey, TValue>>;
export function toMap<T, TKey, TValue>(
  keySelector: IndexedSequenceElementSelector<T, TKey>,
  valueSelector?: IndexedSequenceElementSelector<T, TValue>,
): PipeBody<LinqWrapper<T>, Map<TKey, TValue>> {
  return target => {
    const map = new Map<TKey, TValue>();
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
toMap satisfies PipeFunction;

export function toMultiMap<T, TKey, TValue>(keySelector: IndexedSequenceElementSelector<T, TKey>): PipeBody<LinqWrapper<T>, Map<TKey, TValue[]>>;
export function toMultiMap<T, TKey, TValue>(
  keySelector: IndexedSequenceElementSelector<T, TKey>,
  valueSelector: IndexedSequenceElementSelector<T, TValue>
): PipeBody<LinqWrapper<T>, Map<TKey, TValue[]>>;
export function toMultiMap<T, TKey, TValue>(
  keySelector: IndexedSequenceElementSelector<T, TKey>,
  valueSelector?: IndexedSequenceElementSelector<T, TValue>,
): PipeBody<LinqWrapper<T>, Map<TKey, TValue[]>> {
  return target => {
    const map = new Map<TKey, TValue[]>();
    let i = 0;
    if (valueSelector) {
      for (const e of target.unwrap()) {
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
      for (const e of target.unwrap()) {
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
  };
}
toMultiMap satisfies PipeFunction;

export function toSet<T>(): PipeBody<LinqWrapper<T>, Set<T>>;
export function toSet<T, TValue>(valueSelector: IndexedSequenceElementSelector<T, TValue>): PipeBody<LinqWrapper<T>, Set<TValue>>;
export function toSet<T, TValue = T>(
  valueSelector?: IndexedSequenceElementSelector<T, TValue>,
): PipeBody<LinqWrapper<T>, Set<TValue>> {
  return target => {
    const set = new Set<TValue>();
    if (valueSelector) {
      let i = 0;
      for (const e of target.unwrap()) {
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
toSet satisfies PipeFunction;
