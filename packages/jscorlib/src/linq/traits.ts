export const TryGetCountDirectSymbol = Symbol.for("jscorlib::Linq.TryGetCountDirect");

export interface BuiltInLinqTraits {
  [TryGetCountDirectSymbol]?(): number | undefined;
}
