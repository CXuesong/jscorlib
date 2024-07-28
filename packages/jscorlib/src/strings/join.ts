import { checkArgumentType } from "../errors";
import { isArrayLikeStrict } from "../types/internal";

/**
 * Joins all the elements of an iterable sequence into a string, separated by the specified separator string.
 * @param separator the separator string placed between each of the items.
 * @param values a sequence of items to join. Every item inside will be converted into `string` first
 *                before appended to the output.
 */
export function join(separator: string, values: Iterable<unknown>): string {
  checkArgumentType(0, "separator", separator, "string");
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
