import { describe, expect, it } from "vitest";
import * as Count from "../count";
import { asLinq, registerLinqModule } from "../linqWrapper";
import * as Take from "../take";

registerLinqModule(Take);
registerLinqModule(Count);

describe("take", () => {
  const arr1 = [1, 2, 3, 4, 5, "a", "b", "c", "d"];
  it("skip", () => {
    expect([...asLinq(arr1).skip(5)]).toStrictEqual(["a", "b", "c", "d"]);
    expect([...asLinq(arr1).skip(5).skip(3)]).toStrictEqual(["d"]);
    expect([...asLinq(arr1).skip(100)]).toStrictEqual([]);
  });
  it("take", () => {
    expect([...asLinq(arr1).take(5)]).toStrictEqual([1, 2, 3, 4, 5]);
    expect([...asLinq(arr1).take(5).take(10)]).toStrictEqual([1, 2, 3, 4, 5]);
    expect([...asLinq(arr1).take(5).take(3)]).toStrictEqual([1, 2, 3]);
  });
  it("skip + take", () => {
    expect([...asLinq(arr1).skip(5).take(3)]).toStrictEqual(["a", "b", "c"]);
    expect([...asLinq(arr1).skip(5).take(3).skip(2)]).toStrictEqual(["c"]);
    expect([...asLinq(arr1).take(3).skip(2).skip(1)]).toStrictEqual([]);
  });
  it("count", () => {
    const arr = new Array<number>(100).fill(0);
    expect(asLinq(arr).skip(20).count()).toBe(80);
    expect(asLinq(arr).skip(20).tryGetCountDirect()).toBe(80);
    expect(asLinq(arr).skip(20).take(10).tryGetCountDirect()).toBe(10);
    expect(asLinq(arr).skip(120).take(10).tryGetCountDirect()).toBe(0);
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
    expect([...asLinq(myIterable()).skip(5)]).toStrictEqual(["a", "b", "c", "d"]);
    expect([...asLinq(myIterable()).take(5).take(10)]).toStrictEqual([1, 2, 3, 4, 5]);
    expect(asLinq(myIterable()).skip(5).count()).toBe(4);
    expect(asLinq(myIterable()).skip(5).tryGetCountDirect()).toBeUndefined();
  });
});
