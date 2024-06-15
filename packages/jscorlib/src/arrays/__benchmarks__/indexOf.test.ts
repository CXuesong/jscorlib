import { bench, describe, expect } from "vitest";
import * as _Arrays from "../indexOf";

const haystack: readonly number[] = (() => {
  const h: number[] = [];
  for (let i = 0; i < 100_000; i++) {
    h.push(Math.random());
  }
  return h;
})();

describe("indexOf (needle @ 10%)", () => {
  bench("Array.indexOf baseline", () => {
    const needle = haystack[haystack.length / 10];
    expect(haystack.indexOf(needle)).toBe(haystack.length / 10);
  });
  bench("Arrays.indexOf", () => {
    const needle = haystack[haystack.length / 10];
    expect(_Arrays.indexOf(haystack, needle)).toBe(haystack.length / 10);
  });
});

describe("indexOf (needle @ 50%)", () => {
  bench("Array.indexOf baseline", () => {
    const needle = haystack[haystack.length / 2];
    expect(haystack.indexOf(needle)).toBe(haystack.length / 2);
  });
  bench("Arrays.indexOf", () => {
    const needle = haystack[haystack.length / 2];
    expect(_Arrays.indexOf(haystack, needle)).toBe(haystack.length / 2);
  });
});

describe("indexOf (needle === undefined)", () => {
  bench("Array.indexOf baseline", () => {
    expect(haystack.indexOf(undefined as never)).toBe(-1);
  });
  bench("Arrays.indexOf", () => {
    expect(_Arrays.indexOf(haystack, undefined)).toBe(-1);
  });
});

describe("indexOf (haystack[..-2], needle @ ~50%)", () => {
  const sliced = haystack.slice(0, haystack.length - 2);
  bench("Array.indexOf baseline", () => {
    const needle = sliced[sliced.length / 2];
    expect(sliced.indexOf(needle)).toBe(sliced.length / 2);
  });
  bench("Arrays.indexOf", () => {
    // This makes indexOf to use our own implementation, instead of the native one's
    const needle = haystack[(haystack.length - 2) / 2];
    expect(_Arrays.indexOf(haystack, needle, 0, haystack.length - 2)).toBe((haystack.length - 2) / 2);
  });
});

describe("indexOf (haystack[50%..], needle @ 75%)", () => {
  bench("Array.indexOf baseline", () => {
    const needle = haystack[haystack.length * 3 / 4];
    expect(haystack.indexOf(needle, haystack.length / 2)).toBe(haystack.length * 3 / 4);
  });
  bench("Arrays.indexOf", () => {
    const needle = haystack[haystack.length * 3 / 4];
    expect(_Arrays.indexOf(haystack, needle, haystack.length / 2)).toBe(haystack.length * 3 / 4);
  });
});
