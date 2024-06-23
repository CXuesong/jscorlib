import { describe, it } from "vitest";
import * as _Comparison from "../strings";
import { expectSign } from "./utils";

describe("compareStringOrdinal", () => {
  it("trivial", () => {
    expectSign(_Comparison.compareStringOrdinal("abc", "abc")).toBe(0);
    expectSign(_Comparison.compareStringOrdinal("abc", "ABC")).toBe(1);
    expectSign(_Comparison.compareStringOrdinal("ABC", "abc")).toBe(-1);
    expectSign(_Comparison.compareStringOrdinal(undefined, "abc")).toBe(-1);
    expectSign(_Comparison.compareStringOrdinal("abc", undefined)).toBe(1);
    expectSign(_Comparison.compareStringOrdinal(undefined, undefined)).toBe(0);
  });

  it("length difference", () => {
    expectSign(_Comparison.compareStringOrdinal("abc", "abcd")).toBe(-1);
    expectSign(_Comparison.compareStringOrdinal("abcd", "abc")).toBe(1);
  });

  it("non-ASCII characters", () => {
    expectSign(_Comparison.compareStringOrdinal("ábč", "ábč")).toBe(0);
    expectSign(_Comparison.compareStringOrdinal("ábč", "ábć")).toBe(1);
    expectSign(_Comparison.compareStringOrdinal("ábć", "ábč")).toBe(-1);
  });
});

describe("compareStringOrdinalIgnoreCase", () => {
  it("trivial", () => {
    expectSign(_Comparison.compareStringOrdinalIgnoreCase("abc", "abc")).toBe(0);
    expectSign(_Comparison.compareStringOrdinalIgnoreCase("abc", "ABC")).toBe(0);
    expectSign(_Comparison.compareStringOrdinalIgnoreCase("ABC", "abc")).toBe(0);
    expectSign(_Comparison.compareStringOrdinalIgnoreCase(undefined, "abc")).toBe(-1);
    expectSign(_Comparison.compareStringOrdinalIgnoreCase("abc", undefined)).toBe(1);
    expectSign(_Comparison.compareStringOrdinalIgnoreCase(undefined, undefined)).toBe(0);
    expectSign(_Comparison.compareStringOrdinalIgnoreCase("abc", undefined)).toBe(1);
  });

  it("length difference", () => {
    expectSign(_Comparison.compareStringOrdinalIgnoreCase("abc", "abcd")).toBe(-1);
    expectSign(_Comparison.compareStringOrdinalIgnoreCase("abcd", "abc")).toBe(1);
  });

  it("non-ASCII characters", () => {
    expectSign(_Comparison.compareStringOrdinalIgnoreCase("ábč", "ábč")).toBe(0);
    expectSign(_Comparison.compareStringOrdinalIgnoreCase("ábč", "ábć")).toBe(1);
    expectSign(_Comparison.compareStringOrdinalIgnoreCase("ábć", "ábč")).toBe(-1);
  });
});
