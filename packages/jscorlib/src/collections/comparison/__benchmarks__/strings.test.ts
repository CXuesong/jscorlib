import { bench, describe } from "vitest";
import * as _Comparison from "../strings";

const strAaab = "a".repeat(1000000) + "b";
const strAaaB = "a".repeat(1000000) + "B";
const strAaac = "a".repeat(1000000) + "c";

const caseSensitiveCollator = new Intl.Collator("en", { sensitivity: "variant" });
const caseInsensitiveCollator = new Intl.Collator("en", { sensitivity: "accent" });

describe("CS(aaa…b, aaa…c)", () => {
  bench("baseline: localeCompare(aaa…b, aaa…c)", () => {
    void caseSensitiveCollator.compare(strAaab, strAaac);
  });
  bench("compareStringOrdinal(aaa…b, aaa…c)", () => {
    void _Comparison.compareStringOrdinal(strAaab, strAaac);
  });
});

describe("CS(aaa…c, aaa…b)", () => {
  bench("baseline: localeCompare(aaa…c, aaa…b)", () => {
    void caseSensitiveCollator.compare(strAaac, strAaab);
  });
  bench("compareStringOrdinal(aaa…c, aaa…b)", () => {
    void _Comparison.compareStringOrdinal(strAaac, strAaab);
  });
});

describe("CI(aaa…b, aaa…B)", () => {
  bench("baseline: localeCompare(aaa…b, aaa…B)", () => {
    void caseInsensitiveCollator.compare(strAaab, strAaaB);
  });
  bench("compareStringOrdinalIgnoreCase(aaa…b, aaa…B)", () => {
    void _Comparison.compareStringOrdinalIgnoreCase(strAaab, strAaaB);
  });
});

describe("CI(aaa…B, aaa…b)", () => {
  bench("baseline: localeCompare(aaa…B, aaa…b)", () => {
    void caseInsensitiveCollator.compare(strAaaB, strAaab);
  });
  bench("compareStringOrdinalIgnoreCase(aaa…B, aaa…b)", () => {
    void _Comparison.compareStringOrdinalIgnoreCase(strAaaB, strAaab);
  });
});
