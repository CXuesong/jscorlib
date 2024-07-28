import { bench, describe } from "vitest";
import { AbstractLinqWrapper, IterableLinqWrapper } from "../../internal";

describe("Iterating throuh an array (index, value)", () => {
  const largeArray = new Array<number>(100_000).fill(100);
  const arrayIterableLinq = new IterableLinqWrapper(largeArray);
  const arrayLikeLinq = new ArrayLikeLinqWrapper(largeArray);
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
  bench("for...of (Array)", () => {
    let i = 0;
    for (const e of largeArray) {
      void i;
      void e;
      i++;
    }
  });
  bench("for...of (IterableLinqWrapper)", () => {
    let i = 0;
    for (const e of arrayIterableLinq) {
      void i;
      void e;
      i++;
    }
  });
  bench("for...of (ArrayLikeLinqWrapper)", () => {
    let i = 0;
    for (const e of arrayLikeLinq) {
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

// If we are going to return an Iterator, we might as well just reutrn `array[Iterator]()`
// Using `for` loop impacts performance.
class ArrayLikeLinqWrapper<T> extends AbstractLinqWrapper<T> {
  public constructor(private readonly _array: ArrayLike<T> & Iterable<T>) {
    super();
  }
  public *[Symbol.iterator](): Iterator<T> {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this._array.length; i++) {
      yield this._array[i];
    }
  }
  public override unwrap(): Iterable<T> {
    return this._array;
  }
}
