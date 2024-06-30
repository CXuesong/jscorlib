import { bench, describe } from "vitest";

describe("Iterating throuh an array (index, value)", () => {
  const largeArray = new Array<number>(100_000).fill(100);
  bench("for", () => {
    for (let i = 0; i < largeArray.length; i++) {
      void i;
      void largeArray[i];
    }
  });
  bench("for (cached .length)", () => {
    const { length } = largeArray;
    for (let i = 0; i < length; i++) {
      void i;
      void largeArray[i];
    }
  });
  bench("for...of", () => {
    let i = 0;
    for (const e of largeArray) {
      void i;
      void e;
      i++;
    }
  });
  bench("for...of .values()", () => {
    let i = 0;
    for (const e of largeArray.values()) {
      void i;
      void e;
      i++;
    }
  });
  bench("for...of .entries()", () => {
    for (const [i, e] of largeArray.entries()) {
      void i;
      void e;
    }
  });
  bench(".forEach()", () => {
    largeArray.forEach((e, i) => {
      void e;
      void i;
    });
  });
});
