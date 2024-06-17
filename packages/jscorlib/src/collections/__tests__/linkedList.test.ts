import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ChaiInspectSymbol, CustomInspectable, NodeJSInspectCustomSymbol, getObjectId } from "../../diagnostics";
import * as _Collections from "../linkedList";

describe("LinkedList", () => {
  const prototype = _Collections.LinkedListNode.prototype as CustomInspectable<_Collections.LinkedListNode<unknown>>;
  beforeAll(() => {
    prototype[NodeJSInspectCustomSymbol] = prototype[ChaiInspectSymbol] = function () {
      return `[LinkedListNode #${getObjectId(this)}](${this.value})`;
    };
  });
  afterAll(() => {
    prototype[NodeJSInspectCustomSymbol] = prototype[ChaiInspectSymbol] = undefined;
  });
  it("addFirst / addLast", () => {
    const list = _Collections.LinkedList.from([1, 2, 3, 4, 5]);
    const firstNode = list.addFirst(0);
    const lastNode = list.addLast(6);

    expect(list.firstNode).toBe(firstNode);
    expect(list.lastNode).toBe(lastNode);
    expect([...list]).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it("insertBefore, insertAfter", () => {
    const list = _Collections.LinkedList.from([1, 2, 4]);
    const firstNode = list.firstNode!;
    const lastNode = list.lastNode!;
    const middleNode = list.insertBefore(lastNode, 3);

    expect([...list]).toEqual([1, 2, 3, 4]);

    expect(firstNode.next?.next).toBe(middleNode);
    expect(middleNode.prev?.prev).toBe(firstNode);
    expect(middleNode.next).toBe(lastNode);
    expect(lastNode.prev).toBe(middleNode);
  });

  it("delete / removeNode", () => {
    const list = _Collections.LinkedList.from([1, 2, 3, 4, 5]);

    expect(list.delete(1)).toBe(true);
    list.removeNode(list.find(3)!);

    expect([...list]).toEqual([2, 4, 5]);
  });

  it("removeFirst / removeLast", () => {
    const list = _Collections.LinkedList.from([1, 2, 3, 4, 5]);

    expect(list.removeFirst()).toBe(true);
    expect(list.removeLast()).toBe(true);

    expect([...list]).toEqual([2, 3, 4]);
  });

  it("clear", () => {
    const list = _Collections.LinkedList.from([1, 2, 3, 4, 5]);

    list.clear();

    expect(list.firstNode).toBeUndefined();
    expect(list.lastNode).toBeUndefined();
    expect([...list]).toEqual([]);
  });

  it("find / findLast", () => {
    const list = _Collections.LinkedList.from([1, 2, 3, 2, 1]);

    expect(list.find(2)).toBe(list.firstNode!.next);
    expect(list.findLast(2)).toBe(list.lastNode!.prev);
  });

  it("includes", () => {
    const list = _Collections.LinkedList.from([1, 2, 3, 4, 5]);

    expect(list.includes(3)).toBe(true);
    expect(list.includes(6)).toBe(false);
  });
});
