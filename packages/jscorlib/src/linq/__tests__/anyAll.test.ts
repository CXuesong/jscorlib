import { describe, expect, it } from "vitest";
import { asLinq, registerLinqModule } from "../linqWrapper";
import * as AnyAll from "../anyAll";

registerLinqModule(AnyAll);

describe("anyAll", () => {
  it("any", () => {
    expect(asLinq([]).any()).toBe(false);
    expect(asLinq([1]).any()).toBe(true);
    expect(asLinq([1]).any(x => x > 3)).toBe(false);
    expect(asLinq([1, 3, 5]).any(x => x > 3)).toBe(true);
  });

  it("all", () => {
    expect(asLinq([]).all(() => false)).toBe(true);
    expect(asLinq([1]).all(x => x > 0)).toBe(true);
    expect(asLinq([1]).all(x => x > 3)).toBe(false);
    expect(asLinq([1, 3, 5]).all(x => x > 0)).toBe(true);
    expect(asLinq([1, 3, 5]).all(x => x > 3)).toBe(false);
  });
});
