// perf consideration
/* eslint-disable @typescript-eslint/prefer-for-of */
import { assert } from "../diagnostics";
import { SafeInteger } from "../numbers";
import { AnyValueEqualityComparer, EqualityComparer } from "./equalityComparison";

export class HashSet<T> implements Set<T> {
  private _hashSet = new Map<SafeInteger, T[]>();
  private _size = 0;
  public readonly comparer: EqualityComparer<T>;
  public constructor(comparer?: EqualityComparer<T>) {
    this.comparer = comparer ?? AnyValueEqualityComparer.instance;
  }
  public static from<T>(values?: Iterable<T> | ReadonlySetLike<T>, comparer?: EqualityComparer<T>): HashSet<T> {
    const inst = new HashSet(comparer);
    if (!values) return inst;
    if (values instanceof HashSet && values.comparer === inst.comparer) {
      // clone
      inst._hashSet = structuredClone((values as HashSet<T>)._hashSet);
      inst._size = values._size;
      return inst;
    }
    // creation
    for (const v of iterateReadonlySetLike(values)) {
      inst.add(v);
    }
    return inst;
  }
  public add(value: T): this {
    const valueHash = this.comparer.getHashCode(value);
    let entries = this._hashSet.get(valueHash);
    if (!entries) {
      entries = [];
      this._hashSet.set(valueHash, entries);
    }
    for (let i = 0; i < entries.length; i++) {
      if (this.comparer.equals(entries[i], value)) {
        return this;
      }
    }
    entries.push(value);
    this._size++;
    return this;
  }

  public clear(): void {
    this._hashSet.clear();
    this._size = 0;
  }

  public delete(value: T): boolean {
    const valueHash = this.comparer.getHashCode(value);
    const entries = this._hashSet.get(valueHash);
    if (!entries) return false;
    for (let i = 0; i < entries.length; i++) {
      if (this.comparer.equals(entries[i], value)) {
        entries.splice(i, 1);
        this._size--;
        assert(this._size >= 0);
        return true;
      }
    }
    return false;
  }

  public forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: unknown): void {
    for (const entries of this._hashSet.values()) {
      for (const entry of entries) {
        callbackfn.call(thisArg, entry, entry, this);
      }
    }
  }

  public has(value: T): boolean {
    const valueHash = this.comparer.getHashCode(value);
    const entries = this._hashSet.get(valueHash);
    if (!entries) return false;
    for (let i = 0; i < entries.length; i++) {
      if (this.comparer.equals(entries[i], value)) {
        return true;
      }
    }
    return false;
  }

  public get size(): number {
    return this._size;
  }

  public *entries(): IterableIterator<[T, T]> {
    for (const entries of this._hashSet.values()) {
      for (const entry of entries) {
        yield [entry, entry];
      }
    }
  }

  public *keys(): IterableIterator<T> {
    for (const entries of this._hashSet.values()) {
      for (const entry of entries) {
        yield entry;
      }
    }
  }

  public *values(): IterableIterator<T> {
    for (const entries of this._hashSet.values()) {
      for (const entry of entries) {
        yield entry;
      }
    }
  }

  public union<U>(other: ReadonlySetLike<U> | Iterable<U>): Set<T | U> {
    const result = HashSet.from<T | U>(this, this.comparer);
    for (const value of iterateReadonlySetLike(other)) {
      result.add(value);
    }
    return result;
  }

  public intersection<U>(other: ReadonlySetLike<U>): Set<T & U> {
    const result = new HashSet<T & U>(this.comparer);
    for (const value of this) {
      if (other.has(value as (T & U))) {
        result.add(value as (T & U));
      }
    }
    return result;
  }

  public difference<U>(other: ReadonlySetLike<U>): Set<T> {
    const result = new HashSet<T>(this.comparer);
    for (const value of this) {
      if (!other.has(value as (T & U))) {
        result.add(value);
      }
    }
    return result;
  }

  public symmetricDifference<U>(other: ReadonlySetLike<U> | Iterable<U>): Set<T | U> {
    const result = HashSet.from<T | U>(this, this.comparer);
    for (const value of iterateReadonlySetLike(other)) {
      if (!this.has(value as (T & U))) {
        result.add(value);
      }
    }
    return result;
  }

  public isSubsetOf(other: ReadonlySetLike<unknown>): boolean {
    for (const value of this) {
      if (!other.has(value)) return false;
    }
    return true;
  }

  public isSupersetOf(other: ReadonlySetLike<unknown> | Iterable<unknown>): boolean {
    for (const value of iterateReadonlySetLike(other)) {
      if (!this.has(value as T)) return false;
    }
    return true;
  }

  public isDisjointFrom(other: ReadonlySetLike<unknown> | Iterable<unknown>): boolean {
    for (const value of iterateReadonlySetLike(other)) {
      if (this.has(value as T)) return false;
    }
    return true;
  }

  public [Symbol.iterator](): IterableIterator<T> {
    return this.values();
  }

  public readonly [Symbol.toStringTag] = "HashSet";
}

function iterateReadonlySetLike<T>(obj: ReadonlySetLike<T> | Iterable<T>): Iterable<T> {
  if ("keys" in obj) return { [Symbol.iterator]: () => obj.keys() };
  return obj;
}
