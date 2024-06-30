import { describe, expect, it } from "vitest";
import * as Buffer from "../buffer";
import * as Count from "../count";
import { asLinq, registerLinqModule } from "../linqWrapper";

registerLinqModule(Buffer);
registerLinqModule(Count);

describe("buffer", () => {
  it("sequence", () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7];
    expect([...asLinq(arr).buffer(1)]).toStrictEqual([[0], [1], [2], [3], [4], [5], [6], [7]]);
    expect([...asLinq(arr).buffer(2)]).toStrictEqual([[0, 1], [2, 3], [4, 5], [6, 7]]);
    expect([...asLinq(arr).buffer(3)]).toStrictEqual([[0, 1, 2], [3, 4, 5], [6, 7]]);
    expect([...asLinq(arr).buffer(4)]).toStrictEqual([[0, 1, 2, 3], [4, 5, 6, 7]]);
    expect([...asLinq(arr).buffer(10)]).toStrictEqual([arr]);
  });
  it("count", () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7];
    expect(asLinq(arr).buffer(1).count()).toBe(8);
    expect(asLinq(arr).buffer(2).count()).toBe(4);
    expect(asLinq(arr).buffer(3).count()).toBe(3);
    expect(asLinq(arr).buffer(4).count()).toBe(2);
    expect(asLinq(arr).buffer(10).count()).toBe(1);
  });
});
