import { assert } from "../diagnostics";
import { ArgumentNullError, ArgumentTypeError, InvalidOperationError } from "../errors";

/**
 * Represents a doubly linked list.
 */
export class LinkedList<T> implements Iterable<T> {
  private _head?: LinkedListNode<T>;
  private _tail?: LinkedListNode<T>;
  private _length: number = 0;
  // Insertion
  public addFirst(value: T): LinkedListNode<T> {
    const node = new LinkedListNode(value);
    if (this._head)
      this._insertBefore(this._head, node);
    else
      this._insertEmpty(node);
    return node;
  }
  public addFirstNode(node: LinkedListNode<T>): void {
    this._checkNewNode(node);
    if (this._head)
      this._insertBefore(this._head, node);
    else
      this._insertEmpty(node);
  }
  public addLast(value: T): LinkedListNode<T> {
    const node = new LinkedListNode(value);
    if (this._tail)
      this._insertAfter(this._tail, node);
    else
      this._insertEmpty(node);
    return node;
  }
  public addLastNode(node: LinkedListNode<T>): void {
    this._checkNewNode(node);
    if (this._tail)
      this._insertAfter(this._tail, node);
    else
      this._insertEmpty(node);
  }
  public insertBefore(targetNode: LinkedListNode<T>, value: T): LinkedListNode<T> {
    this._checkAttachedNode(targetNode);
    const node = new LinkedListNode(value);
    this._insertBefore(targetNode, node);
    return node;
  }
  public insertBeforeNode(targetNode: LinkedListNode<T>, newNode: LinkedListNode<T>): void {
    this._checkAttachedNode(targetNode);
    this._checkNewNode(newNode);
    this._insertBefore(targetNode, newNode);
  }
  public insertAfter(targetNode: LinkedListNode<T>, value: T): LinkedListNode<T> {
    this._checkAttachedNode(targetNode);
    const node = new LinkedListNode(value);
    this._insertAfter(targetNode, node);
    return node;
  }
  public insertAfterNode(targetNode: LinkedListNode<T>, newNode: LinkedListNode<T>): void {
    this._checkAttachedNode(targetNode);
    this._checkNewNode(newNode);
    this._insertAfter(targetNode, newNode);
  }
  private _checkAttachedNode(node: LinkedListNode<T>): void {
    if (node == null) throw ArgumentNullError.create(0, "node");
    if (!(node instanceof LinkedListNode)) throw new ArgumentTypeError("Specified node prototype is invalid.");
    if (node.list !== this) throw new InvalidOperationError("Specified node does not belong to current linked list.");
  }
  private _checkNewNode(newNode: LinkedListNode<T>): void {
    if (newNode == null) throw ArgumentNullError.create(0, "newNode");
    if (!(newNode instanceof LinkedListNode)) throw new ArgumentTypeError("Specified node prototype is invalid.");
    if (newNode.list) throw new InvalidOperationError("Specified node already belongs to a linked list.");
  }
  private _insertEmpty(node: LinkedListNode<T>): void {
    assert(!this._head && !this._tail);
    assert(!this._length);
    this._head = this._tail = node;

    if (node[NodeStorageSymbol])
      node[NodeStorageSymbol].list = this;
    else
      node[NodeStorageSymbol] = { list: this };

    this._length = 1;
  }
  private _insertBefore(beforeNode: LinkedListNode<T>, node: LinkedListNode<T>): void {
    node[NodeStorageSymbol] = {
      prev: beforeNode.prev,
      next: beforeNode,
      list: this,
    };

    if (!beforeNode.prev) {
      assert(this._head === beforeNode);
      this._head = node;
    } else {
      assert(this._head !== beforeNode);
    }

    assert(beforeNode[NodeStorageSymbol]);
    beforeNode[NodeStorageSymbol].prev = node;
    this._length++;
  }
  private _insertAfter(afterNode: LinkedListNode<T>, node: LinkedListNode<T>): void {
    node[NodeStorageSymbol] = {
      prev: afterNode,
      next: afterNode.next,
      list: this,
    };

    if (!afterNode.next) {
      assert(this._tail === afterNode);
      this._tail = node;
    } else {
      assert(this._tail !== afterNode);
    }

    assert(afterNode[NodeStorageSymbol]);
    afterNode[NodeStorageSymbol].next = node;
    this._length++;
  }
  // Removal
  public delete(value: T): boolean {
    const node = this.find(value);
    if (!node) return false;
    this._remove(node);
    return true;
  }
  public removeNode(node: LinkedListNode<T>): void {
    this._checkAttachedNode(node);
    this._remove(node);
  }
  public removeFirst(): boolean {
    if (this._head) {
      this._remove(this._head);
      return true;
    }
    return false;
  }
  public removeLast(): boolean {
    if (this._tail) {
      this._remove(this._tail);
      return true;
    }
    return false;
  }
  public clear(): void {
    let current = this._head;
    this._head = undefined;
    this._tail = undefined;
    this._length = 0;
    // Cleanup
    while (current) {
      const c = current;
      current = current.next;
      c[NodeStorageSymbol] = undefined;
    }
  }
  private _remove(node: LinkedListNode<T>): void {
    const prev = node.prev;
    const next = node.next;
    if (prev) {
      assert(prev[NodeStorageSymbol]);
      prev[NodeStorageSymbol].next = next;
    } else {
      assert(this._head === node);
      this._head = node.next;
    }
    if (next) {
      assert(next[NodeStorageSymbol]);
      next[NodeStorageSymbol].prev = prev;
    } else {
      assert(this._tail === node);
      this._tail = node.prev;
    }
    node[NodeStorageSymbol] = undefined;
    this._length--;
    assert(this.length >= 0);
  }
  // Querying
  public get firstNode(): LinkedListNode<T> | undefined {
    return this._head;
  }
  public get lastNode(): LinkedListNode<T> | undefined {
    return this._tail;
  }
  public get length(): number {
    return this.length;
  }
  public find(value: T): LinkedListNode<T> | undefined {
    let current = this._head;
    while (current) {
      if (current.value === value) return current;
      current = current.next;
    }
    return undefined;
  }
  public findLast(value: T): LinkedListNode<T> | undefined {
    let current = this._tail;
    while (current) {
      if (current.value === value) return current;
      current = current.prev;
    }
    return undefined;
  }
  public includes(value: T): boolean {
    let current = this._head;
    while (current) {
      if (current.value === value) return true;
      current = current.next;
    }
    return false;
  }
  public *nodes(): Iterator<LinkedListNode<T>, void, unknown> {
    let current = this._head;
    while (current) {
      yield current;
      current = current.next;
    }
  }
  public *[Symbol.iterator](): Iterator<T, void, unknown> {
    let current = this._head;
    while (current) {
      yield current.value;
      current = current.next;
    }
  }
}

const NodeStorageSymbol = Symbol("LinkedListNodeStorage");

interface LinkedListNodeStorage<T> {
  list: LinkedList<T>;
  prev?: LinkedListNode<T>;
  next?: LinkedListNode<T>;
}

export class LinkedListNode<T> {
  /** @internal */
  public [NodeStorageSymbol]?: LinkedListNodeStorage<T>;
  public constructor(public value: T) {
  }
  public get list(): LinkedList<T> | undefined {
    return this[NodeStorageSymbol]?.list;
  }
  public get prev(): LinkedListNode<T> | undefined {
    return this[NodeStorageSymbol]?.prev;
  }
  public get next(): LinkedListNode<T> | undefined {
    return this[NodeStorageSymbol]?.next;
  }
}
