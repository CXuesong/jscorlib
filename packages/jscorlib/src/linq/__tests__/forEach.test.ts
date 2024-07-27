import { describe, expect, it } from "vitest";
import * as _Linq from "../forEach";
import { asLinq } from "../linqWrapper";

describe("forEach", () => {
  it("forEach", () => {
    const arr = ["a", "b", "c", "d", "e"];
    const result: Array<[item: string, index: number]> = [];
    asLinq(arr).$_(_Linq.forEach((item, index) => result.push([item, index])));
    expect(result).toStrictEqual([["a",0],["b",1],["c",2],["d",3],["e",4]]);
  });
});
