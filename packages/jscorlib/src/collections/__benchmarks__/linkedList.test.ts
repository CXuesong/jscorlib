import { bench, describe } from "vitest";
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
  const sequenceCount = 10_000;
  const baseSequence: readonly number[] = new Array<number>(sequenceCount).fill(-1);
  let arr: number[] = undefined!;
  let list: _Collections.LinkedList<number> = undefined!;
  bench("baseline: Array.unshift", () => {
    for (let i = 0; i < sequenceCount; i++) arr.splice(i * 2 + 1, 0, i);
  }, {
    setup: () => {
      arr = [...baseSequence];
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
      list = _Collections.LinkedList.from(baseSequence);
    },
    teardown: () => {
      list = undefined!;
    },
  });
});
