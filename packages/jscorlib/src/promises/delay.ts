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
