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
 * @remarks Due to the limitation of current JavaScript API, there is no efficient approach to evaluate
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
}
