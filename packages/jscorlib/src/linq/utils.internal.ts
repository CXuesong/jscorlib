import { assert } from "../diagnostics";
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
    assert(unwrapped !== it, "BuiltInLinqTraits[TryUnwrapUnorderedSymbol] should never return itself. Are you intending to return `undefined`?");
    it = unwrapped;
  }
  return it;
}
