import { ReferenceType } from "../../types";
import { EqualsSymbol, Equatable } from "./typing";

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
