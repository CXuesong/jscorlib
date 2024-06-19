import { bench, describe } from "vitest";
import { range } from "../iterators";
import * as _Collections from "../linkedList";

describe("add last", () => {
  bench("baseline: Array.push", () => {
    const arr: number[] = [];
    for (let i = 0; i < 10_000; i++) arr.push(i);
  });
  bench("LinkedList.addLast", () => {
    const list = new _Collections.LinkedList<number>();
    for (let i = 0; i < 10_000; i++) list.addLast(i);
  });
});

describe("add first", () => {
  bench("baseline: Array.unshift", () => {
    const arr: number[] = [];
    for (let i = 0; i < 10_000; i++) arr.unshift(i);
  });
  bench("LinkedList.addFirst", () => {
    const list = new _Collections.LinkedList<number>();
    for (let i = 0; i < 10_000; i++) list.addFirst(i);
  });
});

describe("interleaved insertion", () => {
  const sequenceCount = 5_000;
  let arr: number[] = undefined!;
  let list: _Collections.LinkedList<number> = undefined!;
  bench("baseline: Array.splice", () => {
    for (let i = 0; i < sequenceCount; i++) arr.splice(i * 2 + 1, 0, i);
  }, {
    setup: () => {
      arr = [...range(0, sequenceCount)];
    },
    teardown: () => {
      arr = undefined!;
    },
  });
  bench("LinkedList.insertAfter", () => {
    let currentNode = list.firstNode!;
    for (let i = 0; i < sequenceCount; i++) {
      currentNode = list.insertAfter(currentNode, i);
      currentNode = currentNode.next!;
    }
  }, {
    setup: () => {
      list = _Collections.LinkedList.from(range(0, sequenceCount));
    },
    teardown: () => {
      list = undefined!;
    },
  });
});

describe.skip("interleaved removal (broken right now)", () => {
  const sequenceCount = 10_000;
  let arr: number[] = undefined!;
  let list: _Collections.LinkedList<number> = undefined!;
  bench("baseline: Array.splice", () => {
    for (let i = 0; i < arr.length; i++)
      arr.splice(i, 1);
  }, {
    setup: () => {
      arr = [...range(0, sequenceCount)];
    },
    teardown: () => {
      arr = undefined!;
    },
  });
  bench("LinkedList.remove", () => {
    let currentNode = list.firstNode;
    while (currentNode) {
      const { next } = currentNode;
      list.removeNode(currentNode);
      // Skip one node, and remove the next one
      currentNode = next?.next;
    }
  }, {
    setup: () => {
      list = _Collections.LinkedList.from(range(0, sequenceCount));
    },
    teardown: () => {
      list = undefined!;
    },
  });
});
