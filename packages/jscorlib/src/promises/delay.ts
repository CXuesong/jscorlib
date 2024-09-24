import { ArgumentRangeError } from "../errors";
import { DelayPromiseHolder } from "./internal";

/**
 * Gets a {@link !Promise} that resolves after the specified duration.
 * 
 * @param delayMs milliseconds of the delay, or `"infinite"` to wait indefinitely.
 * @param signal a signal used to cancel the returned Promise.
 * 
 * @throws {@link !DOMException} the specified `signal` has been aborted. If the signal has been aborted with explicit reason,
 *          the {@link AbortSignal.reason} will be thrown.
 * 
 * @see [tc39/proposal-built-in-modules#35](https://github.com/tc39/proposal-built-in-modules/issues/35)
 * @see [whatwg/html#617](https://github.com/whatwg/html/issues/617)
*/
export function delay(delayMs: number | "infinite", signal?: AbortSignal): Promise<void> {
  if (typeof delayMs === "number" && delayMs < 0) throw ArgumentRangeError.create(0, "delayMs", "delayMs should be a non-negative number.");
  signal?.throwIfAborted();
  if (delayMs === "infinite") {
    if (signal) return new DelayPromiseHolder(undefined, signal).promise;
    else return new Promise(() => { /* A promise that never resolves. */ });
  }

  return new DelayPromiseHolder(delayMs, signal).promise;
}
