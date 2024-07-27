import { describe, expect, it } from "vitest";
import { asLinq } from "../linqWrapper";
import * as _Linq from "../pick";

describe("pick", () => {
  it("array", () => {
    const arr = [1, 2, 3, 4, 5, "a", "b", "c", "d"];
    expect(asLinq(arr).$(_Linq.first())).toBe(1);
    expect(asLinq(arr).$(_Linq.last())).toBe("d");
    expect(asLinq(arr).$(_Linq.elementAt(5))).toBe("a");
  });
  it("TypedArray", () => {
    const arr = new Int32Array(100);
    arr.fill(1, 0, 25);
    arr.fill(5, 25, 75);
    arr.fill(10, 75, 100);
    expect(asLinq(arr).$(_Linq.first())).toBe(1);
    expect(asLinq(arr).$(_Linq.last())).toBe(10);
    expect(asLinq(arr).$(_Linq.elementAt(50))).toBe(5);
  });
  it("map", () => {
    // Map: entry orders are persisted
    const map = new Map<number, number>();
    map.set(1, 1);
    map.set(2, 2);
    map.set(3, 3);
    map.set(4, 4);
    map.set(5, 5);
    expect(asLinq(map).$(_Linq.first())).toStrictEqual([1, 1]);
    expect(asLinq(map).$(_Linq.last())).toStrictEqual([5, 5]);
    expect(asLinq(map).$(_Linq.elementAt(2))).toStrictEqual([3, 3]);
  });
  it("iterable", () => {
    function* myIterable(): Iterable<number | string> {
      yield 1;
      yield 2;
      yield 3;
      yield 4;
      yield 5;
      yield "a";
      yield "b";
      yield "c";
      yield "d";
    }
    expect(asLinq(myIterable()).$(_Linq.first())).toBe(1);
    expect(asLinq(myIterable()).$(_Linq.last())).toBe("d");
    expect(asLinq(myIterable()).$(_Linq.elementAt(5))).toBe("a");
  });
});
