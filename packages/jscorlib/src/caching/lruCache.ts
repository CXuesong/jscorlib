import { LinkedList, LinkedListNode } from "../collections/linkedList";
import { assert } from "../diagnostics";
import { ArgumentRangeError } from "../errors";

/**
 * An [LRU cache](https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU))
 * implementing {@link !Map} interface.
 */
export class LruCache<TKey, TValue> implements Map<TKey, TValue> {
  private readonly _map = new Map<TKey, LinkedListNode<[TKey, TValue]>>();
  private readonly _sequence = new LinkedList<[TKey, TValue]>();
  public readonly capacity: number;
  public constructor(capacity: number) {
    capacity = Math.trunc(capacity);
    if (capacity <= 0) throw ArgumentRangeError.create(0, "capacity", "Capacity should be a positive integer.");
    this.capacity = capacity;
  }
  public clear(): void {
    this._map.clear();
    this._sequence.clear();
  }
  /** Removes an element from the LRU cache. */
  public delete(key: TKey): boolean {
    const node = this._map.get(key);
    if (!node) return false;
    this._sequence.removeNode(node);
    assert(this._map.delete(key));
    return true;
  }
  public forEach(callbackfn: (value: TValue, key: TKey, map: LruCache<TKey, TValue>) => void, thisArg?: unknown): void {
    for (const [k, v] of this._sequence) {
      callbackfn.apply(thisArg ?? this, [v, k, this]);
    }
  }
  public get(key: TKey): TValue | undefined {
    const node = this._map.get(key);
    if (!node) return undefined;
    this._moveToFirst(node);
    return node.value[1];
  }
  public getOrInsert(key: TKey, defaultValue: TValue): TValue {
    const node = this._map.get(key);
    if (node) {
      this._moveToFirst(node);
      return node.value[1];
    }
    this.set(key, defaultValue);
    return defaultValue;
  }
  public getOrInsertComputed(key: TKey, callback: (key: TKey) => TValue): TValue {
    const node = this._map.get(key);
    if (node) {
      this._moveToFirst(node);
      return node.value[1];
    }
    const value = callback(key);
    this.set(key, value);
    return value;
  }
  public has(key: TKey): boolean {
    return this._map.has(key);
  }
  public set(key: TKey, value: TValue): this {
    let node = this._map.get(key);
    if (node) {
      this._moveToFirst(node);
      node.value[1] = value;
    } else {
      // new node
      while (this._sequence.length >= this.capacity) {
        const lastNode = this._sequence.lastNode;
        assert(lastNode);
        this._sequence.removeNode(lastNode);
        assert(this._map.delete(lastNode.value[0]));
      }
      node = this._sequence.addFirst([key, value]);
      this._map.set(key, node);
      assert(this._sequence.length === this._map.size);
    }
    return this;
  }
  private _moveToFirst(node: LinkedListNode<[TKey, TValue]>): void {
    if (this._sequence.firstNode === node) return;
    this._sequence.removeNode(node);
    this._sequence.addFirstNode(node);
  }
  public get size(): number {
    return this._map.size;
  }
  public *entries(): MapIterator<[TKey, TValue]> {
    for (const [k, v] of this._sequence) {
      yield [k, v];
    }
  }
  public *keys(): MapIterator<TKey> {
    for (const [k] of this._sequence) {
      yield k;
    }
  }
  public *values(): MapIterator<TValue> {
    for (const [, v] of this._sequence) {
      yield v;
    }
  }
  public *[Symbol.iterator](): MapIterator<[TKey, TValue]> {
    for (const [k, v] of this._sequence) {
      yield [k, v];
    }
  }
  public readonly [Symbol.toStringTag] = "[LruCache]";
}
