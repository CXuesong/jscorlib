import { bench, describe } from "vitest";
import { asLinq } from "../linqWrapper";
import * as _ForEach from "../forEach";
import { range } from "../../collections/iterators";

describe("Array", () => {
  const largeArray = new Array<number>(100_000).fill(100);
  bench("LINQ forEach", () => {
    let sum = 0;
    asLinq(largeArray).$_(_ForEach.forEach((item, index) => sum ^= item ^ index));
    void sum;
  });
  bench("Array.forEach baseline", () => {
    let sum = 0;
    largeArray.forEach((item, index) => sum ^= item ^ index);
    void sum;
  });
});

describe("Set", () => {
  const largeSet = new Set(range(0, 100_000));
  bench("LINQ forEach", () => {
    let sum = 0;
    asLinq(largeSet).$_(_ForEach.forEach((item, index) => sum ^= item ^ index));
    void sum;
  });
  bench("Set.forEach baseline", () => {
    let sum = 0;
    largeSet.forEach((item, index) => sum ^= item ^ index);
    void sum;
  });
});
