import { describe, expect, it } from "vitest";
import * as _Count from "../count";
import { asLinq } from "../linqWrapper";
import * as _Take from "../take";

describe("take", () => {
  const arr1 = [1, 2, 3, 4, 5, "a", "b", "c", "d"];
  it("skip", () => {
    expect([...asLinq(arr1).$_(_Take.skip(5))]).toStrictEqual(["a", "b", "c", "d"]);
    expect([...asLinq(arr1).$_(_Take.skip(5)).$_(_Take.skip(3))]).toStrictEqual(["d"]);
    expect([...asLinq(arr1).$_(_Take.skip(100))]).toStrictEqual([]);
  });
  it("take", () => {
    expect([...asLinq(arr1).$_(_Take.take(5))]).toStrictEqual([1, 2, 3, 4, 5]);
    expect([...asLinq(arr1).$_(_Take.take(5)).$_(_Take.take(10))]).toStrictEqual([1, 2, 3, 4, 5]);
    expect([...asLinq(arr1).$_(_Take.take(5)).$_(_Take.take(3))]).toStrictEqual([1, 2, 3]);
  });
  it("skip + take", () => {
    expect([...asLinq(arr1).$_(_Take.skip(5)).$_(_Take.take(3))]).toStrictEqual(["a", "b", "c"]);
    expect([...asLinq(arr1).$_(_Take.skip(5)).$_(_Take.take(3)).$_(_Take.skip(2))]).toStrictEqual(["c"]);
    expect([...asLinq(arr1).$_(_Take.take(3)).$_(_Take.skip(2)).$_(_Take.skip(1))]).toStrictEqual([]);
  });
  it("count", () => {
    const arr = new Array<number>(100).fill(0);
    expect(asLinq(arr).$_(_Take.skip(20)).$_(_Count.count())).toBe(80);
    expect(asLinq(arr).$_(_Take.skip(20)).$_(_Count.tryGetCountDirect())).toBe(80);
    expect(asLinq(arr).$_(_Take.skip(20)).$_(_Take.take(10)).$_(_Count.tryGetCountDirect())).toBe(10);
    expect(asLinq(arr).$_(_Take.skip(120)).$_(_Take.take(10)).$_(_Count.tryGetCountDirect())).toBe(0);
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
    expect([...asLinq(myIterable()).$_(_Take.skip(5))]).toStrictEqual(["a", "b", "c", "d"]);
    expect([...asLinq(myIterable()).$_(_Take.take(5)).$_(_Take.take(10))]).toStrictEqual([1, 2, 3, 4, 5]);
    expect(asLinq(myIterable()).$_(_Take.skip(5)).$_(_Count.count())).toBe(4);
    expect(asLinq(myIterable()).$_(_Take.skip(5)).$_(_Count.tryGetCountDirect())).toBeUndefined();
  });
});
