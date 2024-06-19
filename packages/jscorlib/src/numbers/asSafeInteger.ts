import { ArgumentRangeError } from "../errors";
import { SafeInteger } from "./typing";

/**
 * Truncates the given number into its integer part,
 * and checks whether the value is within the safe integer range
 * 
 * @returns the truncated number, guaranteed to be within the range of
 * [{@link !Number.MIN_SAFE_INTEGER}, {@link !Number.MAX_SAFE_INTEGER}]
 * @throws {@link ArgumentRangeError} specified `value` cannot be represented by a safe integer.
 * @see {@link !Number.isSafeInteger}
 */
export function asSafeInteger(value: SafeInteger): SafeInteger {
  const result = Math.trunc(value);
  if (!Number.isSafeInteger(result)) {
    throw ArgumentRangeError.create(0, "value", `Value ${value} cannot be represented as an integer without precesion loss.`);
  }
  return result;
}
