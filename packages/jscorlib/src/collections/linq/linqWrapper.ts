import { ArgumentRangeError, InvalidOperationError } from "../../errors";
import { LinqWrapperImpl } from "./linqWrapper.internal";

export interface LinqWrapperBase<T> extends Iterable<T> {
  /**
   * Returns the current object as {@link LinqWrapper}.
   * 
   * @remarks This method is usually used as a short-hand of `asLinq(this)`,
   * when you want to access the shadowed methods exposed from `LinqWrapper<T>`.
   * @experimental I'm not sure whether this method actually makes any use.
   * Let's wait and see.
   */
  asLinq(): LinqWrapper<T>;
  /**
   * Infrastructure. Unwraps and returns the underlying {@link !Iterable} object.
   * 
   * @returns the underlying {@link !Iterable} object. If there is no other specific
   * underlying data, this method may return `this`.
   * 
   * @remarks This is the reverse operation of {@link asLinq}. LINQ extension function
   * implementations can use this method to retrieve the underlying data object.
   * 
   * As LINQ functions consumer, usually you won't need to call this function directly.
   */
  unwrap(): Iterable<T>;
}

// Extension point
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LinqWrapper<T> extends LinqWrapperBase<T> {
}

const wrapperCache = new WeakMap<Iterable<unknown>, LinqWrapper<unknown>>();

export function asLinq<T>(sequence: Iterable<T>): LinqWrapper<T> {
  if (sequence instanceof LinqWrapperImpl) return sequence as unknown as LinqWrapper<T>;
  let wrapper = wrapperCache.get(sequence) as LinqWrapper<T>;
  if (!wrapper) {
    wrapper = LinqWrapperImpl.create(sequence);
    wrapperCache.set(sequence, wrapper);
  }
  return wrapper;
}

/**
 * General definition of "Extension Methods" in JS.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtensionMethod<TThis = unknown> = (this: TThis, ...args: any[]) => any;

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface LinqExtensionMethodModule<TThis = unknown> {
  // We cannot place typeparam in index type.
  [exportKey: `Linq$${string}`]: ExtensionMethod<TThis>;
}

export function registerLinqMethod<T>(name: string, methodImpl: ExtensionMethod<LinqWrapper<T>>): void {
  const prototype = LinqWrapperImpl.prototype as unknown as Record<string, unknown>;
  if (name.startsWith("_") || name.startsWith("$")) throw ArgumentRangeError.create(0, "name", `LINQ method name cannot start with "_" or "$".`);
  if (name in prototype) throw new InvalidOperationError(`LINQ method "${name}" has already been registered.`);
  prototype[name] = methodImpl;
}

export function registerLinqModule<T>(module: LinqExtensionMethodModule<LinqWrapper<T>>): void {
  for (const key of Object.keys(module)) {
    if (typeof key === "string" && key.startsWith("Linq$")) {
      registerLinqMethod(key.substring(5), module[key as `Linq$${string}`]);
    }
  }
}
