import { describe, expect, it } from "vitest";
import { InvalidOperationError } from "../../../errors";
import * as _Linq from "../aggregate";
import { asLinq } from "../../linqWrapper";

describe("aggregate", () => {
  it("with seed", () => {
    expect(asLinq([1, 2, 3, 4, 5]).$(_Linq.aggregate(10, (a, e) => a + e))).toBe(25);
  });
  it("without seed", () => {
    expect(asLinq([1, 2, 3, 4, 5]).$(_Linq.aggregate((a, e) => a + e))).toBe(15);
    expect(() => asLinq<number>([]).$(_Linq.aggregate((a, e) => a + e))).toThrowError(InvalidOperationError);
  });
});
