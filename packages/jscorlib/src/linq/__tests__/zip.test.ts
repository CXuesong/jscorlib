import { describe, expect, it } from "vitest";
import { asLinq, registerLinqModule } from "../linqWrapper";
import * as Zip from "../zip";

registerLinqModule(Zip);

describe("zip", () => {
  it("simple", () => {
    const arr1 = [1, 2, 3];
    const arr2 = ["a", "b", "c"];
    const arr3 = ["A", "B", "C"];
    expect([...asLinq(arr1).zip(arr2)]).toStrictEqual([
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ]);
    expect([...asLinq(arr1).zip(arr2, arr3)]).toStrictEqual([
      [1, "a", "A"],
      [2, "b", "B"],
      [3, "c", "C"],
    ]);
    expect([...asLinq(arr1).zip(arr1, arr1, arr1)]).toStrictEqual([
      [1, 1, 1, 1],
      [2, 2, 2, 2],
      [3, 3, 3, 3],
    ]);
  });
  it("withSelector", () => {
    const arr1 = [1, 2, 3];
    const arr2 = ["+", "-", "."];
    const arr3 = ["apple", "banana", "cabbage"];
    expect([...asLinq(arr1).zip(arr2, arr2, arr3, (e1, e2, e3, e4) => e1 + e2 + e3 + e4)]).toStrictEqual([
      "1++apple",
      "2--banana",
      "3..cabbage",
    ]);
  });
});
