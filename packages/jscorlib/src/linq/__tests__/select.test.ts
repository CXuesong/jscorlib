import { describe, expect, it, vitest } from "vitest";
import * as Count from "../count";
import { asLinq, registerLinqModule } from "../linqWrapper";
import * as Select from "../select";
import { BuiltInLinqTraits, TryGetCountDirectSymbol } from "../traits";

registerLinqModule(Select);
registerLinqModule(Count);

describe("select", () => {
  it("select", () => {
    const arr = [1, 2, 3, "a", "b", "c"];
    expect([...asLinq(arr).select(x => `Item: ${x}`)]).toStrictEqual([
      "Item: 1",
      "Item: 2",
      "Item: 3",
      "Item: a",
      "Item: b",
      "Item: c",
    ]);
    const linq = asLinq(arr).select(x => x + "test");
    expect(linq.tryGetCountDirect()).toBe(6);

    // Linq$count should be calling [[TryGetCountDirectSymbol]] first
    vitest.spyOn(linq as BuiltInLinqTraits<string>, TryGetCountDirectSymbol).mockReturnValue(123);
    expect(linq.count()).toBe(123);
  });
  it("selectMany", () => {
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];
    expect([...asLinq(arr1).selectMany(x => asLinq(arr2).select(y => [x, y] as const))]).toStrictEqual([
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
