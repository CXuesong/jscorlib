import type { tryGetCountDirect } from "./operators/count";
import type { LinqWrapper } from "./linqWrapper";

export const TryGetCountDirectSymbol = Symbol.for("jscorlib::Linq.TryGetCountDirect");
export const TryUnwrapUnorderedSymbol = Symbol.for("jscorlib::Linq.TryUnwrapUnordered");

export interface BuiltInLinqTraits<T> {
  /** Provides specialized implementation for {@link tryGetCountDirect}. */
  [TryGetCountDirectSymbol]?(): number | undefined;
  /**
   * Retrieves the input iterator, if the current LINQ wrapper is only re-ordering
   * the items without changing their values (e.g., sorting).
   * 
   * @remarks While this function also implies {@link LinqWrapper.unwrap},
   * implementation _should not_ return `this`, as it can cause caller
   * to enter infinite loop.
   */
  [TryUnwrapUnorderedSymbol]?(): Iterable<T> | undefined;
}
