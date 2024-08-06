import { TimeoutError } from "../errors";
import { DelayPromiseHolder } from "./internal";

/**
 * Gets a {@link Promise} that resolves when the specified {@link PromiseLike} is fulfilled
 * or when the specified {@link AbortSignal} has been aborted.
 * 
 * @param promise the `Promise` or `PromiseLike` to wait for.
 * @param signal a signal used to cancel the wait.
 * 
 * @returns a `Promise` that represents the asynchronous wait.
 * @throws `any` the provided `promise` has been rejected.
 * @throws {@link DOMException} the specified `signal` has been aborted. If the signal has been aborted with explicit reason,
 *          the {@link AbortSignal.reason} will be thrown.
 */
export function wait<T>(promise: PromiseLike<T>, signal?: AbortSignal): Promise<T>;
/**
 * Gets a {@link Promise} that resolves when the specified {@link PromiseLike} is fulfilled,
 * when the specified `timeout` has reached, or when the specified {@link AbortSignal} has been aborted.
 * 
 * @param promise the `Promise` or `PromiseLike` to wait for.
 * @param timeout the timeout after which the returned `Promise` should be rejected, if the provided `promise` has not settled.
 *                specify `undefined` for infinite timeout.
 * @param signal a signal used to cancel the wait.
 * 
 * @returns a `Promise` that represents the asynchronous wait.
 * @throws `any` the provided `promise` has been rejected.
 * @throws {@link TimeoutError} the specified `timeout` has been reached.
 * @throws {@link DOMException} the specified `signal` has been aborted. If the signal has been aborted with explicit reason,
 *          the {@link AbortSignal.reason} will be thrown.
 */
export function wait<T>(promise: PromiseLike<T>, timeout?: number, signal?: AbortSignal): Promise<T | undefined>;
export function wait<T>(promise: PromiseLike<T>, arg1?: AbortSignal | number, signal?: AbortSignal): Promise<T | undefined> {
  // Theoretically, any value can be await-ed.
  // checkArgumentType(0, "promise", promise, "object");
  const timeout = typeof arg1 === "number" ? arg1 : undefined;
  signal ??= typeof arg1 === "object" ? arg1 : undefined;

  signal?.throwIfAborted();
  if (timeout == null && !signal) return wrapPromise(promise);

  const delayPromiseHolder = new DelayPromiseHolder(timeout, signal);
  const delayTimeoutPromise = delayPromiseHolder.promise.then(() => { throw new TimeoutError("Timeout waiting for the Promise to settle."); });
  return Promise.race([wrapPromise(promise, delayPromiseHolder), delayTimeoutPromise]);
}

async function wrapPromise<T>(promise: PromiseLike<T>, delayPromiseHolder?: DelayPromiseHolder): Promise<T> {
  try {
    return await promise;
  } finally {
    delayPromiseHolder?.dispose();
  }
}
