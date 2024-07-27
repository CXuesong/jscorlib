import { describe, expect, it } from "vitest";
import * as _Chunk from "../chunk";
import * as _Count from "../count";
import { asLinq } from "../linqWrapper";

describe("chunk", () => {
  it("sequence", () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7];
    expect([...asLinq(arr).$_(_Chunk.chunk(1))]).toStrictEqual([[0], [1], [2], [3], [4], [5], [6], [7]]);
    expect([...asLinq(arr).$_(_Chunk.chunk(2))]).toStrictEqual([[0, 1], [2, 3], [4, 5], [6, 7]]);
    expect([...asLinq(arr).$_(_Chunk.chunk(3))]).toStrictEqual([[0, 1, 2], [3, 4, 5], [6, 7]]);
    expect([...asLinq(arr).$_(_Chunk.chunk(4))]).toStrictEqual([[0, 1, 2, 3], [4, 5, 6, 7]]);
    expect([...asLinq(arr).$_(_Chunk.chunk(10))]).toStrictEqual([arr]);
  });
  it("count", () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7];
    expect(asLinq(arr).$_(_Chunk.chunk(1)).$_(_Count.count())).toBe(8);
    expect(asLinq(arr).$_(_Chunk.chunk(2)).$_(_Count.count())).toBe(4);
    expect(asLinq(arr).$_(_Chunk.chunk(3)).$_(_Count.count())).toBe(3);
    expect(asLinq(arr).$_(_Chunk.chunk(4)).$_(_Count.count())).toBe(2);
    expect(asLinq(arr).$_(_Chunk.chunk(10)).$_(_Count.count())).toBe(1);
  });
});
