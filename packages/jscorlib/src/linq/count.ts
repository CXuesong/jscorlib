import { assert } from "../diagnostics";
import { isArrayLikeStrict } from "../types/internal";
import type { LinqWrapper } from "./linqWrapper";
import { BuiltInLinqTraits, TryGetCountDirectSymbol } from "./traits";
import { PipeBody, PipeFunction } from "../pipables";

function tryGetCountDirectImpl<T>(iterable: Iterable<T>): number | undefined {
  const traits = iterable as BuiltInLinqTraits<T>;
  if (typeof traits[TryGetCountDirectSymbol] === "function") {
    const count = traits[TryGetCountDirectSymbol]();
    if (count != null) {
      assert(count >= 0);
      return count;
    }
  }
  if (isArrayLikeStrict(iterable)) return iterable.length;
  if (iterable instanceof Map || iterable instanceof Set) return iterable.size;
}

/** Retrieves the length of sequence. */
export function count<T>(): PipeBody<LinqWrapper<T>, number> {
  return target => {
    const unwrapped = target.unwrap();
    let count = tryGetCountDirectImpl(unwrapped);
    if (count != null) return count;
    // Slow route
    count = 0;
    for (const _void of unwrapped) count++;
    return count;
  };
}
count satisfies PipeFunction;

/**
 * Retrieves the length of sequence, if the length can be evaluated without
 * an enumeration against the input {@link !Iterable}.
 */
export function tryGetCountDirect<T>(): PipeBody<LinqWrapper<T>, number | undefined> {
  return target => tryGetCountDirectImpl(target.unwrap());
}
tryGetCountDirect satisfies PipeFunction;
