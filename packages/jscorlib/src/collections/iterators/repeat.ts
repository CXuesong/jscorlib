import { ArgumentRangeError } from "../../errors";
import { asSafeInteger } from "../../numbers/asSafeInteger";
import { SafeInteger } from "../../numbers/typing";

export function* repeat<T>(element: T, count: SafeInteger): Iterable<T> {
  count = asSafeInteger(count);
  if (count < 0) throw ArgumentRangeError.create(1, "count", "count should be non-negative.");
  for (let i = 0; i < count; i++) yield element;
}
