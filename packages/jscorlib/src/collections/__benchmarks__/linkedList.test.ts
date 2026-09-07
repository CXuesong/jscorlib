import { test } from "vitest";
import { range } from "../iterators";
import * as _Collections from "../linkedList";

test("add last", async ({ bench }) => {
  await bench.compare(
    bench("baseline: Array.push", () => {
      const arr: number[] = [];
      for (let i = 0; i < 10_000; i++) arr.push(i);
    }),
    bench("LinkedList.addLast", () => {
      const list = new _Collections.LinkedList<number>();
      for (let i = 0; i < 10_000; i++) list.addLast(i);
    }),
  );
});

test("add first", async ({ bench }) => {
  await bench.compare(
    bench("baseline: Array.unshift", () => {
      const arr: number[] = [];
      for (let i = 0; i < 10_000; i++) arr.unshift(i);
    }),
    bench("LinkedList.addFirst", () => {
      const list = new _Collections.LinkedList<number>();
      for (let i = 0; i < 10_000; i++) list.addFirst(i);
    }),
  );
});

test("interleaved insertion", async ({ bench }) => {
  const sequenceCount = 5_000;
  let arr: number[] = undefined!;
  let list: _Collections.LinkedList<number> = undefined!;
  await bench.compare(
    bench("baseline: Array.splice", {
      beforeAll: () => {
        arr = [...range(0, sequenceCount)];
      },
      afterAll: () => {
        arr = undefined!;
      },
    }, () => {
      for (let i = 0; i < sequenceCount; i++) arr.splice(i * 2 + 1, 0, i);
    }),
    bench("LinkedList.insertAfter", {
      beforeAll: () => {
        list = _Collections.LinkedList.from(range(0, sequenceCount));
      },
      afterAll: () => {
        list = undefined!;
      },
    }, () => {
      let currentNode = list.firstNode!;
      for (let i = 0; i < sequenceCount; i++) {
        currentNode = list.insertAfter(currentNode, i);
        currentNode = currentNode.next!;
      }
    }),
  );
});

test.skip("interleaved removal (broken right now)", async ({ bench }) => {
  const sequenceCount = 10_000;
  let arr: number[] = undefined!;
  let list: _Collections.LinkedList<number> = undefined!;
  await bench.compare(
    bench("baseline: Array.splice", {
      beforeAll: () => {
        arr = [...range(0, sequenceCount)];
      },
      afterAll: () => {
        arr = undefined!;
      },
    }, () => {
      for (let i = 0; i < arr.length; i++)
        arr.splice(i, 1);
    }),
    bench("LinkedList.remove", {
      beforeAll: () => {
        list = _Collections.LinkedList.from(range(0, sequenceCount));
      },
      afterAll: () => {
        list = undefined!;
      },
    }, () => {
      let currentNode = list.firstNode;
      while (currentNode) {
        const { next } = currentNode;
        list.removeNode(currentNode);
        // Skip one node, and remove the next one
        currentNode = next?.next;
      }
    }),
  );
});
