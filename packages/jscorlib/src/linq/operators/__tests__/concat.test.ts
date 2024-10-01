import { describe, it, expect } from "vitest";
import * as _Concat from "../concat";
import * as _Count from "../count";
import { asLinq } from "../../linqWrapper";

describe("concat", () => {
  it("concat", () => {
    expect([...asLinq([1, 2, 3, 4, 5])
      .$(_Concat.concat([6, 7, 8, 9]))]).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect([...asLinq([1, 2, 3, 4, 5])
      .$(_Concat.concat([]))]).toStrictEqual([1, 2, 3, 4, 5]);
  });
  it("count", () => {
    expect(asLinq([1, 2, 3, 4, 5])
      .$(_Concat.concat([6, 7, 8, 9]))
      .$(_Count.tryGetCountDirect())).toStrictEqual(9);
    expect(asLinq([1, 2, 3, 4, 5])
      .$(_Concat.concat([]))
      .$(_Count.tryGetCountDirect())).toStrictEqual(5);
  });
});
