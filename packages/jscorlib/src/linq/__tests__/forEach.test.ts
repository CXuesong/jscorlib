import { describe, expect, it } from "vitest";
import * as ForEach from "../forEach";
import { asLinq, registerLinqModule } from "../linqWrapper";

registerLinqModule(ForEach);

describe("forEach", () => {
  it("forEach", () => {
    const arr = ["a", "b", "c", "d", "e"];
    const result: Array<[item: string, index: number]> = [];
    asLinq(arr).forEach((item, index) => result.push([item, index]));
    expect(result).toStrictEqual([["a",0],["b",1],["c",2],["d",3],["e",4]]);
  });
});
