/**
 * Gets a Promise that resolves after the specified duration.
 * 
 * @param delayMs milliseconds of the delay.
 * @param signal a signal used to cancel the returned Promise.
 * 
 * @see [tc39/proposal-built-in-modules#35](https://github.com/tc39/proposal-built-in-modules/issues/35)
 * @see [whatwg/html#617](https://github.com/whatwg/html/issues/617)
*/
export async function delay(delayMs: number, signal?: AbortSignal): Promise<void> {
  signal?.throwIfAborted();
  using disposables = new DisposableStack();
  await new Promise<void>((res, rej) => {
    if (signal) {
      const listener: EventListener = () => {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        rej(signal.reason);
      };
      signal.addEventListener("abort", listener);
      disposables.defer(() => signal.removeEventListener("abort", listener));
    }
    const timeoutId = setTimeout(res, delayMs);
    disposables.defer(() => clearTimeout(timeoutId));
  });
}
