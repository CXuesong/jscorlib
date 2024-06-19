/**
 * Compares strings in a case-sensitive ordinal way.
 * The comparison is based on the values of the UTF-16 code units (not Unicode code points) they contain.
 * @see [MDN - Less than (<)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than#description)
 */
export function compareStringOrdinal(x: string | undefined, y: string | undefined): number {
  if (x == null) return y == null ? 0 : -1;
  if (y == null) return 1;
  if (x > y) return 1;
  // see whether we can save 1 comparison first.
  if (x.length !== y.length) return -1;
  if (x < y) return -1;
  return 0;
}
