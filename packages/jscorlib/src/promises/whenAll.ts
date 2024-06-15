/**
 * Creates a {@link Promise} that will settle when the supplied Promises are settled.
 * @param promises the Promises to wait for settling.
 * @returns a Promise that will get fulfilled when the supplied Promises are fulfilled.
 * If any of the `promises` is rejected, the returned Promise will be rejected with {@link AggregateError}.
 */
export async function whenAll<T extends readonly unknown[] | []>(promises: T): Promise<{ -readonly [P in keyof T]: Awaited<T[P]>; }>;
export async function whenAll<T>(promises: Iterable<T | PromiseLike<T>>): Promise<Array<Awaited<T>>>;
export async function whenAll<T>(promises: Iterable<T | PromiseLike<T>>): Promise<Array<Awaited<T>>> {
  const settledResults = await Promise.allSettled(promises);
  const errors = settledResults
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map<unknown>(r => r.reason);
  if (errors.length) throw new AggregateError(errors);
  return settledResults.map(r => (r as PromiseFulfilledResult<Awaited<T>>).value);
}
