import { assert } from "../diagnostics";
import type { LinqWrapper } from "./linqWrapper";
import { BuiltInLinqTraits, TryGetCountDirectSymbol } from "./traits";
import { isArrayLikeStrict } from "./utils.internal";

declare module "./linqWrapper" {
  // https://github.com/typescript-eslint/typescript-eslint/issues/3353
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface LinqWrapper<T> {
    /** Retrieves the length of sequence. */
    count(): number;
    /**
     * Retrieves the length of sequence, if the length can be evaluated without
     * an enumeration against the input {@link !Iterable}.
     */
    tryGetCountDirect(): number | undefined;
  }
}

function tryGetCountDirect<T>(iterable: Iterable<T>): number | undefined {
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

export function Linq$count<T>(this: LinqWrapper<T>): number {
  const unwrapped = this.unwrap();
  let count = tryGetCountDirect(unwrapped);
  if (count != null) return count;
  // Slow route
  count = 0;
  for (const _void of unwrapped) count++;
  return count;
}

export function Linq$tryGetCountDirect<T>(this: LinqWrapper<T>): number | undefined {
  return tryGetCountDirect(this.unwrap());
}
