export const SetEqualsSymbol = Symbol.for("jscorlib::Collections.Sets.SetEquatable.SetEquals");

export interface SetEquatable {
  [SetEqualsSymbol](other: Iterable<unknown>): boolean;
}
