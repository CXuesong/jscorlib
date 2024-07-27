import { describe, expect, it, vitest } from "vitest";
import * as _Count from "../count";
import { asLinq } from "../linqWrapper";
import * as _Select from "../select";
import { BuiltInLinqTraits, TryGetCountDirectSymbol } from "../traits";

describe("select", () => {
  it("select", () => {
    const arr = [1, 2, 3, "a", "b", "c"];
    expect([...asLinq(arr).$_(_Select.select(x => `Item: ${x}`))]).toStrictEqual([
      "Item: 1",
      "Item: 2",
      "Item: 3",
      "Item: a",
      "Item: b",
      "Item: c",
    ]);
    const linq = asLinq(arr).$_(_Select.select(x => x + "test"));
    expect(linq.$_(_Count.tryGetCountDirect())).toBe(6);

    // Linq$count should be calling [[TryGetCountDirectSymbol]] first
    vitest.spyOn(linq as BuiltInLinqTraits<string>, TryGetCountDirectSymbol).mockReturnValue(123);
    expect(linq.$_(_Count.count())).toBe(123);
  });
  it("selectMany", () => {
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];
    expect([
      ...asLinq(arr1)
        .$_(_Select.selectMany(x => asLinq(arr2).$_(_Select.select(y => [x, y] as const)))),
    ]).toStrictEqual([
      [1, 4],
      [1, 5],
      [1, 6],
      [2, 4],
      [2, 5],
      [2, 6],
      [3, 4],
      [3, 5],
      [3, 6],
    ]);
  });
});
