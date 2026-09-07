import { test } from "vitest";
import * as _EqualityComparison from "../strings";
import { SafeInteger } from "../../../numbers";

const strAaab100 = "a".repeat(100) + "b";
const strAaaB100 = "a".repeat(100) + "B";
const strAaab1K = "a".repeat(1_000) + "b";
const strAaaB1K = "a".repeat(1_000) + "B";
const strAaab1M = "a".repeat(1_000_000) + "b";
const strAaaB1M = "a".repeat(1_000_000) + "B";
// const strAaac = "a".repeat(1000000) + "c";

test("Hash(aaa…b) 100 chars", async ({ bench }) => {
  await bench.compare(
    bench("baseline: aaa…b === aaa…B", () => strAaab100 === strAaaB100),
    bench("Buffer", () => computeOrdinalStringHashWithBuffer(strAaab100)),
    bench("OrdinalStringEqualityComparer", () =>
      _EqualityComparison.OrdinalStringEqualityComparer.instance.getHashCode(strAaab100)),
    bench("OrdinalIgnoreCaseStringEqualityComparer", () =>
      _EqualityComparison.OrdinalIgnoreCaseStringEqualityComparer.instance.getHashCode(strAaab100)),
  );
});

test("Hash(aaa…b) 1K chars", async ({ bench }) => {
  await bench.compare(
    bench("baseline: aaa…b === aaa…B", () => strAaab1K === strAaaB1K),
    bench("Buffer", () => computeOrdinalStringHashWithBuffer(strAaab1K)),
    bench("OrdinalStringEqualityComparer", () =>
      _EqualityComparison.OrdinalStringEqualityComparer.instance.getHashCode(strAaab1K)),
    bench("OrdinalIgnoreCaseStringEqualityComparer", () =>
      _EqualityComparison.OrdinalIgnoreCaseStringEqualityComparer.instance.getHashCode(strAaab1K)),
  );
});

test("Hash(aaa…b) 1M chars", async ({ bench }) => {
  await bench.compare(
    bench("baseline: aaa…b === aaa…B", () => strAaab1M === strAaaB1M),
    bench("Buffer", () => computeOrdinalStringHashWithBuffer(strAaab1M)),
    bench("OrdinalStringEqualityComparer", () =>
      _EqualityComparison.OrdinalStringEqualityComparer.instance.getHashCode(strAaab1M)),
    bench("OrdinalIgnoreCaseStringEqualityComparer", () =>
      _EqualityComparison.OrdinalIgnoreCaseStringEqualityComparer.instance.getHashCode(strAaab1M)),
  );
});

function computeOrdinalStringHashWithBuffer(str: string): SafeInteger {
  const buffer = Buffer.from(str);
  const int16View = new Uint16Array(buffer);
  let hash = 5381;
  hash ^= int16View.length;
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < int16View.length; i++) {
    hash = ((hash << 5) + hash) + int16View[i];
  }
  return hash;
}
