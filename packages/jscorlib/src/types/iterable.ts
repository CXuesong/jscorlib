// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isIterable(value: unknown): value is Iterable<any> {
  return value != null
    && typeof value === "object"
    && typeof (value as Iterable<unknown>)[Symbol.iterator] === "function";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isAsyncIterable(value: unknown): value is AsyncIterable<any> {
  return value != null
    && typeof value === "object"
    && typeof (value as AsyncIterable<unknown>)[Symbol.asyncIterator] === "function";
}
