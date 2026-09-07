import { expect, test } from "vitest";
import * as _Arrays from "../indexOf";

const haystack: readonly number[] = (() => {
  const h: number[] = [];
  for (let i = 0; i < 100_000; i++) {
    h.push(Math.random());
  }
  return h;
})();

test("indexOf (needle @ 10%)", async ({ bench }) => {
  const expectedIndex = haystack.length / 10;
  const needle = haystack[expectedIndex];
  expect(haystack.indexOf(needle)).toBe(expectedIndex);
  expect(_Arrays.indexOf(haystack, needle)).toBe(expectedIndex);

  await bench.compare(
    bench("Array.indexOf baseline", () => haystack.indexOf(needle)),
    bench("Arrays.indexOf", () => _Arrays.indexOf(haystack, needle)),
  );
});

test("indexOf (needle @ 50%)", async ({ bench }) => {
  const expectedIndex = haystack.length / 2;
  const needle = haystack[expectedIndex];
  expect(haystack.indexOf(needle)).toBe(expectedIndex);
  expect(_Arrays.indexOf(haystack, needle)).toBe(expectedIndex);

  await bench.compare(
    bench("Array.indexOf baseline", () => haystack.indexOf(needle)),
    bench("Arrays.indexOf", () => _Arrays.indexOf(haystack, needle)),
  );
});

test("indexOf (needle === undefined)", async ({ bench }) => {
  expect(haystack.indexOf(undefined as never)).toBe(-1);
  expect(_Arrays.indexOf(haystack, undefined)).toBe(-1);

  await bench.compare(
    bench("Array.indexOf baseline", () => haystack.indexOf(undefined as never)),
    bench("Arrays.indexOf", () => _Arrays.indexOf(haystack, undefined)),
  );
});

test("indexOf (haystack[..-2], needle @ ~50%)", async ({ bench }) => {
  const sliced = haystack.slice(0, haystack.length - 2);
  const expectedIndex = sliced.length / 2;
  const needle = sliced[expectedIndex];
  expect(sliced.indexOf(needle)).toBe(expectedIndex);
  expect(_Arrays.indexOf(haystack, needle, 0, sliced.length)).toBe(expectedIndex);

  await bench.compare(
    bench("Array.indexOf baseline", () => sliced.indexOf(needle)),
    // Specifying the end index makes indexOf use our implementation instead of the native one.
    bench("Arrays.indexOf", () => _Arrays.indexOf(haystack, needle, 0, sliced.length)),
  );
});

test("indexOf (haystack[50%..], needle @ 75%)", async ({ bench }) => {
  const startIndex = haystack.length / 2;
  const expectedIndex = haystack.length * 3 / 4;
  const needle = haystack[expectedIndex];
  expect(haystack.indexOf(needle, startIndex)).toBe(expectedIndex);
  expect(_Arrays.indexOf(haystack, needle, startIndex)).toBe(expectedIndex);

  await bench.compare(
    bench("Array.indexOf baseline", () => haystack.indexOf(needle, startIndex)),
    bench("Arrays.indexOf", () => _Arrays.indexOf(haystack, needle, startIndex)),
  );
});
