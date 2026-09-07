import { test } from "vitest";
import * as _Comparison from "../strings";

const strAaab = "a".repeat(1000000) + "b";
const strAaaB = "a".repeat(1000000) + "B";
const strAaac = "a".repeat(1000000) + "c";

const caseSensitiveCollator = new Intl.Collator("en", { sensitivity: "variant" });
const caseInsensitiveCollator = new Intl.Collator("en", { sensitivity: "accent" });

test("CS(aaa…b, aaa…c)", async ({ bench }) => {
  await bench.compare(
    bench("baseline: localeCompare(aaa…b, aaa…c)", () => caseSensitiveCollator.compare(strAaab, strAaac)),
    bench("compareStringOrdinal(aaa…b, aaa…c)", () => _Comparison.compareStringOrdinal(strAaab, strAaac)),
  );
});

test("CS(aaa…c, aaa…b)", async ({ bench }) => {
  await bench.compare(
    bench("baseline: localeCompare(aaa…c, aaa…b)", () => caseSensitiveCollator.compare(strAaac, strAaab)),
    bench("compareStringOrdinal(aaa…c, aaa…b)", () => _Comparison.compareStringOrdinal(strAaac, strAaab)),
  );
});

test("CI(aaa…b, aaa…B)", async ({ bench }) => {
  await bench.compare(
    bench("baseline: localeCompare(aaa…b, aaa…B)", () => caseInsensitiveCollator.compare(strAaab, strAaaB)),
    bench("compareStringOrdinalIgnoreCase(aaa…b, aaa…B)", () => _Comparison.compareStringOrdinalIgnoreCase(strAaab, strAaaB)),
  );
});

test("CI(aaa…B, aaa…b)", async ({ bench }) => {
  await bench.compare(
    bench("baseline: localeCompare(aaa…B, aaa…b)", () => caseInsensitiveCollator.compare(strAaaB, strAaab)),
    bench("compareStringOrdinalIgnoreCase(aaa…B, aaa…b)", () => _Comparison.compareStringOrdinalIgnoreCase(strAaaB, strAaab)),
  );
});
