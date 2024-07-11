import { SetEqualsSymbol, SetEquatable } from "./typing";

export function setEquals(x: Iterable<unknown>, y: Iterable<unknown>): boolean {
  // Trivial case
  if (x === y) return true;
  // Check override
  if (isSetEquatable(x)) return x[SetEqualsSymbol](y);
  if (isSetEquatable(y)) return y[SetEqualsSymbol](x);
  // Check either side for Set.
  {
    const [a, b] = x instanceof Set ? [x, y] : [y, x];
    // a could be set
    if (a instanceof Set) {
      // Sets shouldn't have duplicates so we try to bail out.
      if (b instanceof Set && b.size !== a.size) return false;
      for (const v of b) {
        if (!a.has(v)) return false;
      }
      return true;
    }
  }
  // Just compare
  // Convert either side into Set before comparing.
  // <value, seen in y>
  const xSet = new Map<unknown, boolean>();
  for (const v of x) xSet.set(v, false);
  for (const v of y) {
    if (!xSet.has(v)) return false;
    xSet.set(v, true);
  }
  for (const seen of xSet.values()) {
    if (!seen) return false;
  }
  return true;
}

function isSetEquatable(value: object): value is SetEquatable {
  return typeof (value as SetEquatable)[SetEqualsSymbol] === "function";
}
