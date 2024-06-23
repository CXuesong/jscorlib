import { describe, expect, it } from "vitest";
import { asLinq, registerLinqModule } from "../linqWrapper";
import * as Where from "../where";

registerLinqModule(Where);

describe("where", () => {
  it("where", () => {
    const arr = [0, 1, 2, 3, 4, 5, "a", "b", "c", "d"];
    // ordinary
    expect([...asLinq(arr).where(x => x >= "c")]).toStrictEqual(["c", "d"]);
    // index
    expect([...asLinq(arr).where((_void, i) => i > 7)]).toStrictEqual(["c", "d"]);
    // type assertion
    expect([...asLinq(arr)
      .where((x): x is string => typeof x === "string")
      // x is string now.
      .where(x => x.match(/c|d/g)),
    ]).toStrictEqual(["c", "d"]);
    // constant
    expect([...asLinq(arr).where(() => true)]).toStrictEqual(arr);
    expect([...asLinq(arr).where(() => false)]).toStrictEqual([]);
  });
});
