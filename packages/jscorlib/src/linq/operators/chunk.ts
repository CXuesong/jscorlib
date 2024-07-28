import { ArgumentRangeError } from "../../errors";
import { asSafeInteger, SafeInteger } from "../../numbers";
import { PipeBody, PipeFunction } from "../../pipables";
import { IterableFactoryLinqWrapper } from "../internal";
import { LinqWrapper } from "../linqWrapper";

/**
 * Splits the elements of a sequence into chunks of `count` at most size.
 */
export function chunk<T>(count: SafeInteger): PipeBody<LinqWrapper<T>, LinqWrapper<readonly T[]>> {
  return target => {
    count = asSafeInteger(count);
    if (count <= 0) throw ArgumentRangeError.create(0, "count", "Expect value to be positive.");
    const unwrapped = target.unwrap();
    return new IterableFactoryLinqWrapper(() => chunkIterable(unwrapped, count));
  };
}
chunk satisfies PipeFunction;

function* chunkIterable<T>(iterable: Iterable<T>, count: number): Iterable<readonly T[]> {
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
