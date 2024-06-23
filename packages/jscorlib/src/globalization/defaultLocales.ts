// Just a marker.
const BuiltInLocaleSymbol = Symbol.for("jscorlib::BuiltInLocale");

interface BuiltInLocale extends Intl.Locale {
  [BuiltInLocaleSymbol]?: "default" | "invariant";
}

let defaultLocale: BuiltInLocale | undefined;

/**
 * Retrieves the current default locale of the environment.
 * 
 * @remarks
 * Before [tc39/ecma402#68](https://github.com/tc39/ecma402/issues/68) gets resolved,
 * there is no official approach to retrieve user's "current locale" per se. Thus this
 * implementation is currently using the default {@link Intl.Collator} locale
 * as an approximation.
 * 
 * Note that the implementation is subject to changes in the future.
 */
export function getDefaultLocale(): Intl.Locale {
  // There is no concept like "Default Locale" as of now. We use 
  // https://github.com/tc39/ecma402/issues/68
  if (!defaultLocale) {
    const collator = new Intl.Collator();
    const collatorOptions = collator.resolvedOptions();
    defaultLocale = new Intl.Locale(collatorOptions.locale);
    defaultLocale[BuiltInLocaleSymbol] = "default";
  }
  return defaultLocale;
}

let invariantLocale: BuiltInLocale | undefined;

/**
 * Retrieves the current best approximity of invariant locale
 * (like "culture-independent", or "invariant culture" in .NET).
 * 
 * @remarks
 * Currently this implementation is returning `en` as a "standard" locale
 * for various locale-related operations, such as sorting, formatting, etc.
 * 
 * Note that the implementation is subject to changes in the future.
 */
export function getInvariantLocale(): Intl.Locale {
  // There is technically no "invariant locale" in JS. We use EN to simulate.
  // https://stackoverflow.com/questions/492799/difference-between-invariantculture-and-ordinal-string-comparison
  if (!invariantLocale) {
    invariantLocale = new Intl.Locale("en");
    invariantLocale[BuiltInLocaleSymbol] = "invariant";
  }
  return invariantLocale;
}
