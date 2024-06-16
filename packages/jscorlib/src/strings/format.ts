import { FormatError, checkArgumentType } from "../errors/index";

/**
 * Replaces the format item in a specified string with the string representation of a corresponding object in a specified array.
 * @param expression A composite format string.
 * @param args An object array that contains zero or more objects to format.
 * @returns A copy of format in which the format items have been replaced by the string representation of the corresponding objects in args.
 * 
 * @see https://learn.microsoft.com/en-us/dotnet/api/system.string.format
 * @todo Re-implement by parsing into expression and throw error for invalid cases.
 */
export function format(expression: string, ...args: unknown[]): string {
  checkArgumentType(0, "expression", expression, "string");

  return expression.replaceAll(/(\{(?<TI>[0-9])+(:(?<TS>[^}]*))?\})|(?<LB>\{\{)|(?<RB>\}\})/ug, (...a) => {
    const groups = a[a.length - 1] as Record<"TI" | "TS" | "LB" | "RB", string>;
    if (groups.TI != null) {
      const index = Number.parseInt(groups.TI);
      if (Number.isNaN(index) || index < 0)
        throw new FormatError(`Invalid argument list index: ${groups.TI}.`);
      if (index >= args.length)
        throw new FormatError(`Argument list index ${groups.TI} exceeds the provided arguments.`);
      return String(args[index]);
    }

    if (groups.LB) return "{";
    if (groups.RB) return "}";
    return "";
  });
}
