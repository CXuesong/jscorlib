import { describe, expect, it } from "vitest";
import { asLinq, registerLinqModule } from "../linqWrapper";
import * as Reverse from "../reverse";

registerLinqModule(Reverse);

describe("reverse", () => {
  it("array", () => {
    const arr = [1, 2, 3, null, undefined, 4, 5];
    expect([...asLinq(arr).reverse()]).toStrictEqual([5, 4, undefined, null, 3, 2, 1]);
    expect([...asLinq(arr).reverse().reverse()]).toStrictEqual(arr);
  });
  it("TypedArray", () => {
    const arr = new Int32Array([1, 2, 3, 4, 5]);
    expect([...asLinq(arr).reverse()]).toStrictEqual([5, 4, 3, 2, 1]);
    expect([...asLinq(arr).reverse().reverse()]).toStrictEqual([...arr]);
  });
  it("map", () => {
    // Map: entry orders are persisted
    const map = new Map<number, number>();
    map.set(1, 1);
    map.set(2, 2);
    map.set(3, 3);
    map.set(4, 4);
    map.set(5, 5);
    expect([...asLinq(map).reverse()]).toStrictEqual([
      [5, 5],
      [4, 4],
      [3, 3],
      [2, 2],
      [1, 1],
    ]);
    expect([...asLinq(map).reverse().reverse()]).toStrictEqual([...map]);
  });
  it("iterable", () => {
    function* myIterable(): Iterable<number | string> {
      yield 1;
      yield 2;
      yield "a";
      yield "b";
    }
    expect([...asLinq(myIterable()).reverse()]).toStrictEqual(["b", "a", 2, 1]);
  });
});
