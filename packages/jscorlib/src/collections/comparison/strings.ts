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

export function compareStringOrdinalIgnoreCase(x: string | undefined, y: string | undefined): number {
  if (x == null) return y == null ? 0 : -1;
  if (y == null) return 1;
  const minLength = x.length < y.length ? x.length : y.length;
  const CHAR_CODE_A = 65;
  // const CHAR_CODE_Z = 90;
  const CHAR_CODE_a = 97;
  const CHAR_CODE_z = 122;
  for (let i = 0; i < minLength; i++) {
    let xv = x.charCodeAt(i);
    let yv = y.charCodeAt(i);
    if (xv === yv) continue;

    // Normalize charcode into upper-case
    if (xv >= CHAR_CODE_a && xv <= CHAR_CODE_z) xv -= (CHAR_CODE_a - CHAR_CODE_A);
    if (yv >= CHAR_CODE_a && yv <= CHAR_CODE_z) yv -= (CHAR_CODE_a - CHAR_CODE_A);
    if (xv != yv) return xv - yv;
  }
  // Prefix are the same. Use length to break the tie.
  return x.length - y.length;
}
