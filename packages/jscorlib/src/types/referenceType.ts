/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Represents any function.
 */
export type AnyFunction<TArgs extends any[] = any[], TReturnValue = any> = (...args: TArgs) => TReturnValue;

/**
 * Represents JavaScript built-in types that behaves like "reference type" in other languages.
 * 
 * @remarks For now, the "reference type" values are define as one of the following
 * * objects (excluding `null`)
 * * arrays
 * * functions
 * * symbols (including [shared symbols in the global symbol registry](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#shared_symbols_in_the_global_symbol_registry))
 */
export type ReferenceType = object | any[] | AnyFunction | symbol;
/* eslint-enable @typescript-eslint/no-explicit-any */

export function isReferenceType(value?: unknown): value is ReferenceType {
  return typeof value === "object" && value !== null
    || typeof value === "symbol"
    || typeof value === "function";
}
