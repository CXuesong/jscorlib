import { assert } from "../diagnostics";
import { LinqWrapperBase } from "./linqWrapper";
import { BuiltInLinqTraits, TryUnwrapUnorderedSymbol } from "./traits";

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
