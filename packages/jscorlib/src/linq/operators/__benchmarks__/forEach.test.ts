import { test } from "vitest";
import { asLinq } from "../../linqWrapper";
import * as _ForEach from "../forEach";
import { range } from "../../../collections/iterators";

test("Array", async ({ bench }) => {
  const largeArray = new Array<number>(100_000).fill(100);
  await bench.compare(
    bench("LINQ forEach", () => {
      let sum = 0;
      asLinq(largeArray).$(_ForEach.forEach((item, index) => sum ^= item ^ index));
      return sum;
    }),
    bench("Array.forEach baseline", () => {
      let sum = 0;
      largeArray.forEach((item, index) => sum ^= item ^ index);
      return sum;
    }),
  );
});

test("Set", async ({ bench }) => {
  const largeSet = new Set(range(0, 100_000));
  await bench.compare(
    bench("LINQ forEach", () => {
      let sum = 0;
      asLinq(largeSet).$(_ForEach.forEach((item, index) => sum ^= item ^ index));
      return sum;
    }),
    bench("Set.forEach baseline", () => {
      let sum = 0;
      largeSet.forEach((item, index) => sum ^= item ^ index);
      return sum;
    }),
  );
});
