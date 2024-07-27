import { describe, expect, it } from "vitest";
import { asLinq } from "../linqWrapper";
import * as _Linq from "../reverse";

describe("reverse", () => {
  it("array", () => {
    const arr = [1, 2, 3, null, undefined, 4, 5];
    expect([...asLinq(arr).$_(_Linq.reverse())]).toStrictEqual([5, 4, undefined, null, 3, 2, 1]);
    expect([...asLinq(arr).$_(_Linq.reverse()).$_(_Linq.reverse())]).toStrictEqual(arr);
  });
  it("TypedArray", () => {
    const arr = new Int32Array([1, 2, 3, 4, 5]);
    expect([...asLinq(arr).$_(_Linq.reverse())]).toStrictEqual([5, 4, 3, 2, 1]);
    expect([...asLinq(arr).$_(_Linq.reverse()).$_(_Linq.reverse())]).toStrictEqual([...arr]);
  });
  it("map", () => {
    // Map: entry orders are persisted
    const map = new Map<number, number>();
    map.set(1, 1);
    map.set(2, 2);
    map.set(3, 3);
    map.set(4, 4);
    map.set(5, 5);
    expect([...asLinq(map).$_(_Linq.reverse())]).toStrictEqual([
      [5, 5],
      [4, 4],
      [3, 3],
      [2, 2],
      [1, 1],
    ]);
    expect([...asLinq(map).$_(_Linq.reverse()).$_(_Linq.reverse())]).toStrictEqual([...map]);
  });
  it("iterable", () => {
    function* myIterable(): Iterable<number | string> {
      yield 1;
      yield 2;
      yield "a";
      yield "b";
    }
    expect([...asLinq(myIterable()).$_(_Linq.reverse())]).toStrictEqual(["b", "a", 2, 1]);
  });
});
