import { describe, expect, it } from "vitest";
import { InvalidOperationError } from "../../errors";
import * as _Arrays from "../sorting";

describe("sort", () => {
  function sortHelper<T>(array: T[]): T[] {
    _Arrays.sort(array);
    return array;
  }

  it("trivial cases", () => {
    expect(sortHelper([])).toStrictEqual([]);
    expect(sortHelper([1])).toStrictEqual([1]);
  });

  it("same type", () => {
    expect(sortHelper([3, 1, 2])).toStrictEqual([1, 2, 3]);
    expect(sortHelper(["Abc", "abc", "DEF"])).toStrictEqual(["abc", "Abc", "DEF"]);
  });

  it("different types", () => {
    expect(sortHelper([0, null, "", undefined]))
      .toStrictEqual([undefined, null, +0, ""]);
    expect(sortHelper([3, 5, -1, "1", true, null, undefined]))
      .toStrictEqual([undefined, null, true, -1, 3, 5, "1"]);
  });

  it("throws error on unsupported type", () => {
    const arr = [3, "1", true, null, undefined, Symbol()];
    expect(() => sortHelper(arr)).toThrow(InvalidOperationError);
  });
});

describe("defaultArrayComparer", () => {
  function testComparer(x: unknown, y: unknown, expectedResult: -1 | 0 | 1): void {
    const result = _Arrays.defaultArrayComparer(x, y);
    expect(Math.sign(result)).toBeCloseTo(expectedResult, 10);
    const result1 = _Arrays.defaultArrayComparer(y, x);
    expect(Math.sign(result1)).toBeCloseTo(-expectedResult, 10);
  }

  it("undefined values", () => {
    testComparer(undefined, undefined, 0);
    testComparer(undefined, null, -1);
    testComparer(undefined, 1, -1);
  });

  it("null values", () => {
    testComparer(null, undefined, 1);
    testComparer(null, null, 0);
    testComparer(null, 1, -1);
  });

  it("boolean values", () => {
    testComparer(false, true, -1);
    testComparer(true, false, 1);
    testComparer(true, true, 0);
  });

  it("number values", () => {
    testComparer(1, 2, -1);
    testComparer(2, 1, 1);
    testComparer(1, 1, 0);
  });

  it("string values", () => {
    testComparer("a", "b", -1);
    testComparer("b", "a", 1);
    testComparer("a", "a", 0);
  });

  it("throws error on unsupported type", () => {
    expect(() => _Arrays.defaultArrayComparer(Symbol(), Symbol())).toThrow(InvalidOperationError);
  });
});
