import type { StringSplitOptions } from "./split";

export const SplitSymbol = Symbol.for("jscorlib::Strings.CustomStringSplitDelimiter");

export interface CustomStringSplitDelimiter {
  [SplitSymbol](str: string, options: StringSplitOptions): string[];
}
