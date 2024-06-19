// https://stackoverflow.com/questions/70135031/how-to-sort-strings-in-javascript-by-code-point-values
// This is not exactly codepoint comparison, but, well. We take EN as "invariant culture" for now.
// This also means EOR collation is used.
// Iterating the codepoints through the string (ordinal / binary collation) in JS can be much slower.
//
// Note the difference between Ordinal/Invariant comparison

import { LruCache } from "../../caching/lruCache";
import { getInvariantLocale } from "../../globalization";

// https://stackoverflow.com/questions/492799/difference-between-invariantculture-and-ordinal-string-comparison
const invariantCollator = new Intl.Collator(getInvariantLocale(), { sensitivity: "variant" });
const invariantCollatorIgnoreCase = new Intl.Collator(getInvariantLocale(), { sensitivity: "accent" });

export function compareStringInvariant(x: string | undefined, y: string | undefined): number {
  if (x == null) return y == null ? 0 : -1;
  if (y == null) return 1;
  return invariantCollator.compare(x, y);
}

export function compareStringInvariantIgnoreCase(x: string | undefined, y: string | undefined): number {
  if (x == null) return y == null ? 0 : -1;
  if (y == null) return 1;
  return invariantCollatorIgnoreCase.compare(x, y);
}

export interface StringComparisonOptions {
  /**
   * The locale used to compare the strings.
   * By default it uses the result of {@link getInvariantLocale}.
   */
  locale?: Intl.Locale | string | string[];
  ignoreCase?: boolean;
  /**
   * Indicates that the string comparison must ignore nonspacing combining characters, such as diacritics.
   * The Unicode Standard defines combining characters as characters that are combined with base characters to produce a new character.
   * Nonspacing combining characters do not occupy a spacing position by themselves when rendered.
   * 
   * @see https://learn.microsoft.com/en-us/dotnet/api/system.globalization.compareoptions
   */
  ignoreNonSpace?: boolean;
}

export function compareString(x: string | undefined, y: string | undefined, collator?: Intl.Collator): number;
export function compareString(x: string | undefined, y: string | undefined, collator?: StringComparisonOptions): number;
export function compareString(x: string | undefined, y: string | undefined, arg3?: Intl.Collator | StringComparisonOptions): number {
  if (x == null) return y == null ? 0 : -1;
  if (y == null) return 1;

  arg3 ??= invariantCollator;
  if (arg3 instanceof Intl.Collator) {
    return arg3.compare(x, y);
  }

  const collator = getCollator(arg3);
  return collator.compare(x, y);
}

const collatorCache = new LruCache<string, Intl.Collator>(10);
const collatorOptions = [
  // ignoreCase[2]:N, ignoreNonSpace[1]:N
  { sensitivity: "variant" },
  // ignoreCase:N, ignoreNonSpace:Y
  { sensitivity: "accent" },
  // ignoreCase:Y, ignoreNonSpace:N
  { sensitivity: "case" },
  // ignoreCase:Y, ignoreNonSpace:Y
  { sensitivity: "base" },
] satisfies Intl.CollatorOptions[];

function getCollator(options: StringComparisonOptions): Intl.Collator {
  const OPTION_IGNORE_CASE = 2;
  const OPTION_IGNORE_NONSPACE = 1;
  const optionId =
    (options.ignoreCase ? OPTION_IGNORE_CASE : 0)
    | (options.ignoreNonSpace ? OPTION_IGNORE_NONSPACE : 0)
    ;
  const locale = options.locale;
  let cacheKey: string | undefined;
  if (!Array.isArray(locale)) {
    if (!locale || locale === getInvariantLocale()) {
      if (optionId === 0) return invariantCollator;
      if (optionId === OPTION_IGNORE_CASE) return invariantCollatorIgnoreCase;
    } else if (typeof locale === "string") {
      const normalized = Intl.getCanonicalLocales(locale)[0];
      if (normalized) cacheKey = `${normalized}|${optionId}`;
    } else {
      cacheKey = `${locale.baseName}|${optionId}`;
    }
  }
  let collator = cacheKey ? collatorCache.get(cacheKey) : undefined;
  if (!collator) {
    collator = new Intl.Collator(locale, collatorOptions[optionId]);
    if (cacheKey) collatorCache.set(cacheKey, collator);
  }
  return collator;
}
