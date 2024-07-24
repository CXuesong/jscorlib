/**
 * Polyfill of {@link Promise.withResolvers}.
 * @see [ES2023: ES Promise.withResolvers](https://github.com/tc39/proposal-promise-with-resolvers)
 */
export function withResolvers<T>(): PromiseWithResolvers<T> {
  const result = {} as PromiseWithResolvers<T>;
  result.promise = new Promise((res, rej) => {
    result.resolve = res;
    result.reject = rej;
  })
  return result;
}
