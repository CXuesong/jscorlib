import { describe, expect, it } from "vitest";
import { asLinq, registerLinqModule } from "../linqWrapper";
import * as MinMax from "../minmax";

registerLinqModule(MinMax);

describe("minmax", () => {
  it("min & max", () => {
    const arr = [-5, -4, -3, 0, 1, 2, 3, 4];
    expect(asLinq(arr).min()).toBe(-5);
    expect(asLinq(arr).max()).toBe(4);
  });
  it("minBy & maxBy", () => {
    const arr = [-5, -4, -3, 0, 1, 2, 3, 4];
    expect(asLinq(arr).minBy(e => Math.abs(e))).toBe(0);
    expect(asLinq(arr).maxBy(e => Math.abs(e))).toBe(-5);
  });
});
