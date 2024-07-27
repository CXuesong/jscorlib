import { describe, expect, it } from "vitest";
import { asLinq } from "../linqWrapper";
import * as _Linq from "../where";

describe("where", () => {
  it("where", () => {
    const arr = [0, 1, 2, 3, 4, 5, "a", "b", "c", "d"];
    // ordinary
    expect([...asLinq(arr).$_(_Linq.where(x => x >= "c"))]).toStrictEqual(["c", "d"]);
    // index
    expect([...asLinq(arr).$_(_Linq.where((_void, i) => i > 7))]).toStrictEqual(["c", "d"]);
    // type assertion
    expect([...asLinq(arr)
      .$_(_Linq.where((x): x is string => typeof x === "string"))
      // x is string now.
      .$_(_Linq.where(x => x.match(/c|d/g))),
    ]).toStrictEqual(["c", "d"]);
    // constant
    expect([...asLinq(arr).$_(_Linq.where(() => true))]).toStrictEqual(arr);
    expect([...asLinq(arr).$_(_Linq.where(() => false))]).toStrictEqual([]);
  });
});
