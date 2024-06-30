import { describe, expect, it } from "vitest";
import * as Collect from "../collect";
import { asLinq, registerLinqModule } from "../linqWrapper";

registerLinqModule(Collect);

describe("collect", () => {
  it("toArray", () => {
    const arr = [1, 2, 3, "a", "b", "c"];
    expect(asLinq(arr).toArray()).toStrictEqual(arr);
  });
  it("toMap", () => {
    const arr = [1, 2, 3, "a", "b", "c"];
    expect(asLinq(arr).toMap(x => typeof x)).toStrictEqual(new Map<string, string | number>([
      ["number", 3],
      ["string", "c"],
    ]));
    expect(asLinq(arr).toMap(x => x, x => typeof x)).toStrictEqual(new Map<string | number, string>([
      [1, "number"],
      [2, "number"],
      [3, "number"],
      ["a", "string"],
      ["b", "string"],
      ["c", "string"],
    ]));
  });
  it("toSet", () => {
    const arr = [1, 2, 3, "a", "b", "c"];
    expect(asLinq(arr).toSet()).toStrictEqual(new Set(arr));
    expect(asLinq([1, 2, 2, 3, "a"]).toSet()).toStrictEqual(new Set([1, 2, 3, "a"]));
  });
});
