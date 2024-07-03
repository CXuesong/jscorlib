export const TryGetCountDirectSymbol = Symbol.for("jscorlib::Linq.TryGetCountDirect");
export const TryUnwrapUnorderedSymbol = Symbol.for("jscorlib::Linq.TryUnwrapUnordered");

export interface BuiltInLinqTraits<T> {
  /** Provides specialized implementation for {@link LinqWrapper!tryGetCountDirect}. */
  [TryGetCountDirectSymbol]?(): number | undefined;
  /**
   * Retrieves the input iterator, if the current LINQ wrapper is only re-ordering
   * the items without changing their values (e.g., sorting).
   * 
   * This function also implies {@link LinqWrapper!unwrap}.
   */
  [TryUnwrapUnorderedSymbol]?(): Iterable<T> | undefined;
}
