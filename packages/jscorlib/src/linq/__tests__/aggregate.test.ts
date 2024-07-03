import { describe, expect, it } from "vitest";
import { InvalidOperationError } from "../../errors";
import * as Aggregate from "../aggregate";
import { asLinq, registerLinqModule } from "../linqWrapper";

registerLinqModule(Aggregate);

describe("aggregate", () => {
  it("with seed", () => {
    expect(asLinq([1, 2, 3, 4, 5]).aggregate(10, (a, e) => a + e)).toBe(25);
  });
  it("without seed", () => {
    expect(asLinq([1, 2, 3, 4, 5]).aggregate((a, e) => a + e)).toBe(15);
    expect(() => asLinq<number>([]).aggregate((a, e) => a + e)).toThrowError(InvalidOperationError);
  });
});
