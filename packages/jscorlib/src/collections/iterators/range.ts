import { ArgumentRangeError } from "../../errors";
import { asSafeInteger } from "../../numbers/asSafeInteger";
import { SafeInteger } from "../../numbers/typing";

/**
 * Generates a sequence of integral numbers within a specified range.
 * @param start value of the first integer in the sequence.
 * @param count number of sequential integers to generate.
 * @remarks
 * Both `start` and `count` will be truncated into integer, and they should be within
 * the safe integer range.
 */
export function* range(start: SafeInteger, count: SafeInteger): Iterable<SafeInteger> {
  start = asSafeInteger(start);
  count = asSafeInteger(count);
  if (count < 0) throw ArgumentRangeError.create(1, "count", "count should be non-negative.");
  if (!Number.isSafeInteger(start + count)) {
    throw new ArgumentRangeError("start + count cannot be represented with an integer without precision loss.");
  }
  for (let i = 0; i < count; i++) yield start + i;
}
