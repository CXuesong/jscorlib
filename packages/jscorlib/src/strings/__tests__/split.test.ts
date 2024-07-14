import { describe, expect, it } from "vitest";
import * as _Strings from "../split";

describe("format", () => {
  it("simple args", () => {
    // Trivial
    expect(_Strings.split("part1,part2,part3", ",")).toStrictEqual(["part1", "part2", "part3"]);
    expect(_Strings.split(",part1,,,part2,", ",")).toStrictEqual(["", "part1", "", "", "part2", ""]);
    expect(_Strings.split("part1,,part2;part3 part4, part5", /[,;\s]+/)).toStrictEqual(["part1", "part2", "part3", "part4", "part5"]);
  });

  it("limited array count", () => {
    // This will force `split` to use our home-made implementation.
    expect(_Strings.split("part1,part2,part3", ",", 3)).toStrictEqual(["part1", "part2", "part3"]);
    expect(_Strings.split("part1,part2,part3", ",", 10)).toStrictEqual(["part1", "part2", "part3"]);
    expect(_Strings.split(",part1,,,part2,", ",", 3)).toStrictEqual(["", "part1", ",,part2,"]);
    expect(_Strings.split("part1,,part2;part3 part4, part5", /[,;\s]+/, 10)).toStrictEqual(["part1", "part2", "part3", "part4", "part5"]);
    expect(_Strings.split("part1,,part2;part3 part4, part5", /[,;\s]+/, 3)).toStrictEqual(["part1", "part2", "part3 part4, part5"]);
    // `y` flag should make no difference
    expect(_Strings.split("part1,,part2;part3 part4, part5", /[,;\s]+/y, 3)).toStrictEqual(["part1", "part2", "part3 part4, part5"]);
  });

  it("malformed string delimiters (UTF-16 characters)", () => {
    // Built-in implementation
    expect(_Strings.split("abcdef", "")).toStrictEqual(["a", "b", "c", "d", "e", "f"]);
    // Our implementations
    expect(_Strings.split("abcdef", "", 0)).toStrictEqual([]);
    expect(_Strings.split("abcdef", "", 1)).toStrictEqual(["abcdef"]);
    expect(_Strings.split("abcdef", "", 2)).toStrictEqual(["a", "bcdef"]);
    expect(_Strings.split("abcdef", "", 3)).toStrictEqual(["a", "b", "cdef"]);
    expect(_Strings.split("abcdef", "", 10)).toStrictEqual(["a", "b", "c", "d", "e", "f"]);
    // Fall into built-in implementation
    expect(_Strings.split("", "")).toStrictEqual([]);
    expect(_Strings.split("", "", 2)).toStrictEqual([""]);
    expect(_Strings.split("测试文本", "", 3)).toStrictEqual(["测", "试", "文本"]);
    // 😄😄 Code points larger than 0x10FFFF will be separated and thus broken into UTF-16 code points.
    expect(_Strings.split("x\ud83d\ude04\ud83d\ude04x", "", 4)).toStrictEqual(["x", "\ud83d", "\ude04", "\ud83d\ude04x"]);
  });

  it("malformed RegExp delimiters (UTF-16 characters)", () => {
    // Built-in implementation
    expect(_Strings.split("abcdef", /(?:)/)).toStrictEqual(["a", "b", "c", "d", "e", "f"]);
    // Our implementations
    expect(_Strings.split("abcdef", /(?:)/, 0)).toStrictEqual([]);
    expect(_Strings.split("abcdef", /(?:)/, 1)).toStrictEqual(["abcdef"]);
    expect(_Strings.split("abcdef", /(?:)/, 2)).toStrictEqual(["a", "bcdef"]);
    expect(_Strings.split("abcdef", /(?:)/, 3)).toStrictEqual(["a", "b", "cdef"]);
    expect(_Strings.split("abcdef", /(?:)/, 10)).toStrictEqual(["a", "b", "c", "d", "e", "f"]);
    expect(_Strings.split("x\ud83d\ude04\ud83d\ude04x", "", 4)).toStrictEqual(["x", "\ud83d", "\ude04", "\ud83d\ude04x"]);
  });

  it("malformed RegExp delimiters (Unicode codepoints)", () => {
    // Built-in implementation
    expect(_Strings.split("abcdef", /(?:)/u)).toStrictEqual(["a", "b", "c", "d", "e", "f"]);
    // Our implementations
    expect(_Strings.split("abcdef", /(?:)/u, 0)).toStrictEqual([]);
    expect(_Strings.split("abcdef", /(?:)/u, 1)).toStrictEqual(["abcdef"]);
    expect(_Strings.split("abcdef", /(?:)/u, 2)).toStrictEqual(["a", "bcdef"]);
    expect(_Strings.split("abcdef", /(?:)/u, 3)).toStrictEqual(["a", "b", "cdef"]);
    expect(_Strings.split("abcdef", /(?:)/u, 10)).toStrictEqual(["a", "b", "c", "d", "e", "f"]);
    // `u` causes input string to be separated by Unicode code points.
    expect(_Strings.split("x\ud83d\ude04\ud83d\ude04x", /(?:)/u, 4)).toStrictEqual(["x", "\ud83d\ude04", "\ud83d\ude04", "x"]);
  });
});
