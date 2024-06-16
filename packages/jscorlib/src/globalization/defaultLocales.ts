// There is no concept like "Default Locale" as of now.
// https://github.com/tc39/ecma402/issues/68
//
//const defaultLocale =

let invariantLocale: Intl.Locale | undefined;

export function getInvariantLocale(): Intl.Locale {
  // There is technically no "invariant locale" in JS. We use EN to simulate.
  // https://stackoverflow.com/questions/492799/difference-between-invariantculture-and-ordinal-string-comparison
  if (!invariantLocale) {
    invariantLocale = new Intl.Locale("en");
    (invariantLocale as unknown as Record<string, unknown>).___jscorlib_invariant_locale = true;
  }
  return invariantLocale;
}
