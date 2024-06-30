import { isTypedArray } from "../types";

export function isArrayLikeStrict<T>(iterable: Iterable<T>): iterable is Iterable<T> & ArrayLike<T> {
  return typeof iterable === "string"
    || Array.isArray(iterable)
    || isTypedArray(iterable);
}
