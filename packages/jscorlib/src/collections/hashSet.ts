// perf consideration
/* eslint-disable @typescript-eslint/prefer-for-of */
import { assert } from "../diagnostics";
import { SafeInteger } from "../numbers";
import { AnyValueEqualityComparer, EqualityComparer } from "./equalityComparison";
import { referenceTypeEquals } from "./equalityComparison/equals";
import { SetEqualsSymbol, SetEquatable } from "./sets/typing";

export class HashSet<T> implements Set<T>, SetEquatable {
  private _buckets = new Map<SafeInteger, T[]>();
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
      inst._buckets = structuredClone((values as HashSet<T>)._buckets);
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
    let entries = this._buckets.get(valueHash);
    if (!entries) {
      entries = [];
      this._buckets.set(valueHash, entries);
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
    this._buckets.clear();
    this._size = 0;
  }

  public delete(value: T): boolean {
    const valueHash = this.comparer.getHashCode(value);
    const entries = this._buckets.get(valueHash);
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
    for (const entries of this._buckets.values()) {
      for (const entry of entries) {
        callbackfn.call(thisArg, entry, entry, this);
      }
    }
  }

  public has(value: T): boolean {
    const valueHash = this.comparer.getHashCode(value);
    const entries = this._buckets.get(valueHash);
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
    for (const entries of this._buckets.values()) {
      for (const entry of entries) {
        yield [entry, entry];
      }
    }
  }

  public keys(): IterableIterator<T> {
    return this.values();
  }

  public *values(): IterableIterator<T> {
    for (const entries of this._buckets.values()) {
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
    const result = new HashSet<T & U>(this.comparer as EqualityComparer<T & U>);
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

  public setEquals(other: Iterable<T>): boolean {
    return this[SetEqualsSymbol](other);
  }

  public [SetEqualsSymbol](other: Iterable<unknown>): boolean {
    if (other instanceof HashSet && referenceTypeEquals(this.comparer, other.comparer)) {
      if (this.size !== other.size) return false;
      for (const v of this.values()) {
        if (!other.has(v)) return false;
      }
      return true;
    }
    // just populate the marker map without having to evaluate hash code once more
    // TODO use BitArray
    const markerMap = new Map<SafeInteger, boolean[]>();
    for (const value of other) {
      if (!this.comparer.isSupported(value)) return false;
      const hash = this.comparer.getHashCode(value);
      const myBucket = this._buckets.get(hash);
      if (!myBucket) return false;

      let markerBucket = markerMap.get(hash);
      if (!markerBucket) {
        markerBucket = new Array(myBucket.length).fill(false);
        markerMap.set(hash, markerBucket);
      }
      const bucketIndex = myBucket.indexOf(value);
      if (bucketIndex < 0) return false;
      markerBucket[bucketIndex] = true;
    }
    // Check whether there is any item not existing in `other`.
    assert(markerMap.size <= this._buckets.size);
    if (markerMap.size < this._buckets.size) return false;
    for (const bucket of markerMap.values()) {
      if (bucket.includes(false)) return false;
    }
    return true;
  }

  public [Symbol.iterator](): IterableIterator<T> {
    return this.values();
  }

  public readonly [Symbol.toStringTag] = "HashSet";
}

function iterateReadonlySetLike<T>(obj: ReadonlySetLike<T> | Iterable<T>): Iterable<T> {
  if (Symbol.iterator in obj) return obj;
  return { [Symbol.iterator]: () => obj.keys() };
}
