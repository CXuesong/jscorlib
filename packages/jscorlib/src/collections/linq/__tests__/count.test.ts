import { describe, expect, it } from "vitest";
import * as Count from "../count";
import { asLinq, registerLinqModule } from "../linqWrapper";

registerLinqModule(Count);

describe("count", () => {
  it("array", () => {
    expect(asLinq([1, 2, 3, 4, 5]).count()).toBe(5);
    expect(asLinq([1, 2, 3, 4, 5]).tryGetCountDirect()).toBe(5);
  });
  it("TypedArray", () => {
    const arr = new Int32Array(100);
    expect(asLinq(arr).count()).toBe(100);
    expect(asLinq(arr).tryGetCountDirect()).toBe(100);
  });
  it("map", () => {
    const map = new Map<number, number>();
    map.set(1, 1);
    map.set(2, 2);
    map.set(3, 3);
    map.set(4, 4);
    map.set(5, 5);
    expect(asLinq(map).count()).toBe(5);
    expect(asLinq(map).tryGetCountDirect()).toBe(5);
  });
  it("iterable", () => {
    function* myIterable(): Iterable<number> {
      yield 1;
      yield 2;
      yield 3;
      yield 4;
      yield 5;
    }
    expect(asLinq(myIterable()).count()).toBe(5);
    expect(asLinq(myIterable()).tryGetCountDirect()).toBeUndefined();
  });
});
