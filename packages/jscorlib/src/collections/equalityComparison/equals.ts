import { ReferenceType } from "../../types";
import { EqualsSymbol, Equatable } from "./typing";

/**
 * Determines the equality of 2 reference type values.
 * @param x one value.
 * @param y the other value.
 * @returns
 * `true` if one of the following conditions is satisfied
 * * `Object.is(x, y)` is `true` (this also implies `x === y`).
 * * Both `x` and `y` has implemented {@link Equatable} interface, and `x[EqualsSymbol](y)` returns `true`.
 *     * If `y[EqualsSymbol](x)` returns `false` in the meantime, the behavior is undefined.
 */
export function referenceTypeEquals(x: ReferenceType | null | undefined, y: ReferenceType | null | undefined): boolean {
  if (Object.is(x, y)) return true;
  if (!x || !y) return false;
  const eqx = x as Equatable;
  const eqy = y as Equatable;
  // If one-side has implemented [[EqualsSymbol]], the other-side must have done the same
  // in order to make them both comparable (A == B --> B == A)
  if (typeof eqx[EqualsSymbol] === "function" && typeof eqy[EqualsSymbol] === "function")
    return eqx[EqualsSymbol](y);
  return false;
}
