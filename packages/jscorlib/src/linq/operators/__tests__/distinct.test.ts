import { describe, it, expect } from "vitest";
import * as _Distinct from "../distinct";
import { asLinq } from "../../linqWrapper";

describe("distinct", () => {
  it("distinct", () => {
    expect(new Set(asLinq([2, 2, 3, 4, 5, 2, 2, 1, 3, 1]).$(_Distinct.distinct())))
      .toStrictEqual(new Set([2, 3, 4, 5, 1]));
  });
  it("distinct with null / undefined", () => {
    expect(new Set(asLinq([2, 3, 2, null, 1, undefined, 4]).$(_Distinct.distinct())))
      .toStrictEqual(new Set([2, 3, null, 1, undefined, 4]));
  });
  it("distinctBy", () => {
    expect(new Set(asLinq(["aa", "b", "c", "ddd"]).$(_Distinct.distinctBy(s => s.length))))
      .toStrictEqual(new Set(["aa", "b", "ddd"]));
  });
});
