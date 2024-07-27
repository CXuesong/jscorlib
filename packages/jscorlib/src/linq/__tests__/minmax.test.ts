import { describe, expect, it } from "vitest";
import { asLinq } from "../linqWrapper";
import * as _MinMax from "../minmax";

describe("minmax", () => {
  it("min & max", () => {
    const arr = [-5, -4, -3, 0, 1, 2, 3, 4];
    expect(asLinq(arr).$(_MinMax.min())).toBe(-5);
    expect(asLinq(arr).$(_MinMax.max())).toBe(4);
  });
  it("minBy & maxBy", () => {
    const arr = [-5, -4, -3, 0, 1, 2, 3, 4];
    expect(asLinq(arr).$(_MinMax.minBy(e => Math.abs(e)))).toBe(0);
    expect(asLinq(arr).$(_MinMax.maxBy(e => Math.abs(e)))).toBe(-5);
  });
});
