import { SafeInteger } from "../../numbers";

/**
 * A function that compares the equality of two objects.
 * 
 * @returns
 * * `true` if `x` is equal to `y`.
 * * `false` if `x` is not equal to `y`.
 * 
 * @see {@link !Collections.Comparison.ComparerFunction}
 * @see {@link EqualityComparer}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EqualityComparerFunction<T = any> = (x: T, y: T) => boolean;

/**
 * Provides methods to compare the equality of two objects.
 * 
 * @remarks
 * While it is theoretically possible to let a {@link !Function} implement this interface,
 * this can interfere with the overload resolution logic and thus not recommended.
 * 
 * Due to the limitation of current JavaScript API, there is no efficient approach to evaluate
 * hash code for every primitive types (e.g. `string`). This can cause significant performance penalty.
 * 
 * @see {@link EqualityComparerFunction}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface EqualityComparer<T = any> {
  /**
   * Compares the equality of two objects.
   * 
   * @returns
   * * `true` if `x` is equal to `y`.
   * * `false` if `x` is not equal to `y`.
   */
  equals(x: T, y: T): boolean;
  /**
   * Evaluates the hash code for the specified `value`.
   * 
   * @remarks Implementations are required to ensure that if {@link equals} returns `true` for two values `x` and `y`,
   * then the value returned by {@link getHashCode} for `x` must equal the value returned for `y`.
   */
  getHashCode(value: T): SafeInteger;
  /**
   * Given an aribtrary value, checks whether the value can be compared by the current {@link EqualityComparer}.
   */
  isSupported(value: unknown): value is T;
}

export const EqualsSymbol = Symbol.for("jscorlib::Collections.EqualityComparison.Equatable.Equals");
export const GetHashCodeSymbol = Symbol.for("jscorlib::Collections.EqualityComparison.Equatable.GetHashCode");

export interface Equatable {
  [EqualsSymbol](other: unknown): boolean;
  [GetHashCodeSymbol]?(): SafeInteger;
}
