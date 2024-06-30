import { ArgumentRangeError } from "../../errors";
import { asSafeInteger, SafeInteger } from "../../numbers";
import { LinqWrapper } from "./linqWrapper";
import { IterableFactoryLinqWrapper } from "./linqWrapper.internal";

declare module "./linqWrapper" {
  export interface LinqWrapper<T> {
    buffer(count: SafeInteger): LinqWrapper<readonly T[]>;
  }
}

export function Linq$buffer<T>(this: LinqWrapper<T>, count: SafeInteger): LinqWrapper<readonly T[]> {
  count = asSafeInteger(count);
  if (count <= 0) throw ArgumentRangeError.create(0, "count", "Expect value to be positive.");
  const unwrapped = this.unwrap();
  return new IterableFactoryLinqWrapper(() => bufferIterable(unwrapped, count)).asLinq();
}

function* bufferIterable<T>(iterable: Iterable<T>, count: number): Iterable<readonly T[]> {
  let currentBatch: T[] = [];
  for (const e of iterable) {
    currentBatch.push(e);
    if (currentBatch.length >= count) {
      yield currentBatch;
      currentBatch = [];
    }
  }
  if (currentBatch.length) yield currentBatch;
}
