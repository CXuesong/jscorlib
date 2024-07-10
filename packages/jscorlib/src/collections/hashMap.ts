// perf consideration
/* eslint-disable @typescript-eslint/prefer-for-of */
import * as Arrays from "../arrays";
import { assert } from "../diagnostics";
import { SafeInteger } from "../numbers";
import { AnyValueEqualityComparer, EqualityComparer } from "./equalityComparison";

export class HashMap<TKey, TValue> implements Map<TKey, TValue> {
  // For now, we just delegate load factors etc. into the built-in one.
  private _hashMap = new Map<SafeInteger, Array<[TKey, TValue]>>();
  private _size = 0;
  public readonly comparer: EqualityComparer<TKey>;
  public constructor(comparer?: EqualityComparer<TKey>) {
    this.comparer = comparer ?? AnyValueEqualityComparer.instance;
  }
  public clear(): void {
    this._hashMap.clear();
    this._size = 0;
  }
  public delete(key: TKey): boolean {
    const keyHash = this.comparer.getHashCode(key);
    const entries = this._hashMap.get(keyHash);
    if (!entries) return false;
    for (let i = 0; i < entries.length; i++) {
      if (this.comparer.equals(entries[i][0], key)) {
        if (entries.length > 1) {
          // Remove 1 entry from entry list
          Arrays.removeAt(entries, i);
        } else {
          // Remove the only one entry
          this._hashMap.delete(keyHash);
        }
        this._size--;
        assert(this._size >= 0);
        return true;
      }
    }
    return false;
  }

  public forEach(callbackfn: (value: TValue, key: TKey, map: this) => void, thisArg?: unknown): void {
    for (const entries of this._hashMap.values()) {
      for (const [k, v] of entries) {
        callbackfn.call(thisArg, v, k, this);
      }
    }
  }

  public get(key: TKey): TValue | undefined {
    const keyHash = this.comparer.getHashCode(key);
    const entries = this._hashMap.get(keyHash);
    if (!entries) return undefined;
    for (let i = 0; i < entries.length; i++) {
      if (this.comparer.equals(entries[i][0], key)) {
        return entries[i][1];
      }
    }
    return undefined;
  }

  public has(key: TKey): boolean {
    const keyHash = this.comparer.getHashCode(key);
    const entries = this._hashMap.get(keyHash);
    if (!entries) return false;
    for (let i = 0; i < entries.length; i++) {
      if (this.comparer.equals(entries[i][0], key)) {
        return true;
      }
    }
    return false;
  }

  public set(key: TKey, value: TValue): this {
    const keyHash = this.comparer.getHashCode(key);
    let entries = this._hashMap.get(keyHash);
    if (!entries) {
      entries = [];
      this._hashMap.set(keyHash, entries);
    }
    for (let i = 0; i < entries.length; i++) {
      if (this.comparer.equals(entries[i][0], key)) {
        entries[i][1] = value;
        return this;
      }
    }
    entries.push([key, value]);
    this._size++;
    return this;
  }

  public get size(): number {
    return this._size;
  }

  public *entries(): IterableIterator<[TKey, TValue]> {
    for (const entries of this._hashMap.values()) {
      for (const entry of entries) {
        yield [...entry];
      }
    }
  }

  public *keys(): IterableIterator<TKey> {
    for (const entries of this._hashMap.values()) {
      for (const entry of entries) {
        yield entry[0];
      }
    }
  }

  public *values(): IterableIterator<TValue> {
    for (const entries of this._hashMap.values()) {
      for (const entry of entries) {
        yield entry[1];
      }
    }
  }

  public [Symbol.iterator](): IterableIterator<[TKey, TValue]> {
    return this.entries();
  }

  public readonly [Symbol.toStringTag] = "HashMap";
}
