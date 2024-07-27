import { isArrayLikeStrict } from "../types/internal";

export function join(separator: string, values: Iterable<unknown>): string {
  if (isArrayLikeStrict(values)) return Array.prototype.join.call(values, separator);
  let sb = "";
  let i = 0;
  for (const v of values) {
    if (i > 0) sb += separator;
    sb += String(v);
    i++;
  }
  return sb;
}
