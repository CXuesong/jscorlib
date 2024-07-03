import { isTypedArray } from "../types";
import { LinqWrapperBase } from "./linqWrapper";
import { BuiltInLinqTraits, TryUnwrapUnorderedSymbol } from "./traits";

export function isArrayLikeStrict<T>(iterable: Iterable<T>): iterable is Iterable<T> & ArrayLike<T> {
  return typeof iterable === "string"
    || Array.isArray(iterable)
    || isTypedArray(iterable);
}

export function unwrapUnorderedLinqWrapper<T>(wrapper: LinqWrapperBase<T>): Iterable<T> {
  let it = wrapper as (BuiltInLinqTraits<T> & Iterable<T>);
  while (typeof it[TryUnwrapUnorderedSymbol] === "function") {
    const unwrapped = it[TryUnwrapUnorderedSymbol]();
    // Cannot unwrap anymore
    if (!unwrapped) return it;
    it = unwrapped;
  }
  return it;
}
