import { describe, expect, it } from "vitest";
import { FormatError } from "../../errors";
import * as _Strings from "../format";

describe("format", () => {
  it("simple args", () => {
    expect(_Strings.format("test")).toBe("test");
    expect(_Strings.format("test{0}", 123456)).toBe("test123456");
    expect(_Strings.format("{1}-test-{0}", "abc", "def")).toBe("def-test-abc");
  });

  it("repeated args", () => {
    expect(_Strings.format("{0}-{0}-{0}", "a")).toBe("a-a-a");
  });

  it("escaped brackets", () => {
    expect(_Strings.format("{{0}}", "a")).toBe("{0}");
    expect(_Strings.format("{{0}}-{0}", "a")).toBe("{0}-a");
  });

  it("error cases", () => {
    expect(() => _Strings.format("{0}")).toThrow(FormatError);
    expect(() => _Strings.format("{1}", "a")).toThrow(FormatError);
    // TODO detect this case and throw Error after `format` rewrite
    // expect(() => _Strings.format("{-1}", "a")).toThrow(Errors.FormatError);
    expect(_Strings.format("{-1}", "a")).toBe("{-1}");
  });
});
