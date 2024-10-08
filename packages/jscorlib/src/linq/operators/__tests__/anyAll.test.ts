import { describe, expect, it } from "vitest";
import { asLinq } from "../../linqWrapper";
import * as _Linq from "../anyAll";

describe("anyAll", () => {
  it("any", () => {
    expect(asLinq([]).$(_Linq.any())).toBe(false);
    expect(asLinq([1]).$(_Linq.any())).toBe(true);
    expect(asLinq([1]).$(_Linq.any(x => x > 3))).toBe(false);
    expect(asLinq([1, 3, 5]).$(_Linq.any(x => x > 3))).toBe(true);
  });

  it("all", () => {
    expect(asLinq([]).$(_Linq.all(() => false))).toBe(true);
    expect(asLinq([1]).$(_Linq.all(x => x > 0))).toBe(true);
    expect(asLinq([1]).$(_Linq.all(x => x > 3))).toBe(false);
    expect(asLinq([1, 3, 5]).$(_Linq.all(x => x > 0))).toBe(true);
    expect(asLinq([1, 3, 5]).$(_Linq.all(x => x > 3))).toBe(false);
  });
});
