import { describe, it, expect } from "vitest";
import * as _EqualityComparison from "../strings";

describe("OrdinalStringEqualityComparer", () => {
  const comparer = _EqualityComparison.OrdinalStringEqualityComparer.instance;
  it("trivial", () => {
    expect(comparer.equals("abc", "abc")).toBe(true);
    expect(comparer.equals("abc", "Abc")).toBe(false);
    expect(comparer.equals("abcd", "Abc")).toBe(false);
    expect(comparer.getHashCode("abc")).not.toBe(comparer.getHashCode("Abc"));
  });
});

describe("OrdinalStringEqualityComparer", () => {
  const comparer = _EqualityComparison.OrdinalIgnoreCaseStringEqualityComparer.instance;
  it("trivial", () => {
    expect(comparer.equals("abc", "abc")).toBe(true);
    expect(comparer.equals("abc", "Abc")).toBe(true);
    expect(comparer.equals("abcd", "Abc")).toBe(false);
    expect(comparer.getHashCode("abc")).toBe(comparer.getHashCode("Abc"));
    expect(comparer.getHashCode("abc")).not.toBe(comparer.getHashCode("Abcd"));
  });
});
