import type { StringComparisonOptions } from "../strings.intl";
import { LruCache } from "../../../caching/lruCache";
import { getInvariantLocale } from "../../../globalization";

// https://stackoverflow.com/questions/492799/difference-between-invariantculture-and-ordinal-string-comparison
export const invariantCollator = new Intl.Collator(getInvariantLocale(), { sensitivity: "variant" });
export const invariantIgnoreCaseCollator = new Intl.Collator(getInvariantLocale(), { sensitivity: "accent" });

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

export function getCollator(options: StringComparisonOptions): Intl.Collator {
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
      if (optionId === OPTION_IGNORE_CASE) return invariantIgnoreCaseCollator;
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
