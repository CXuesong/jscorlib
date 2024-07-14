import { ArgumentRangeError, InvalidOperationError } from "../errors";
import { AbstractLinqWrapper, ArrayLikeLinqWrapper, IterableLinqWrapper } from "./linqWrapper.internal";
import { isArrayLikeStrict } from "../types/internal";

/**
 * Provides basic methods in addition to {@link !Iterable} in order to
 * support LINQ extension methods.
 * 
 * @template T type of the sequence item.
 */
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
   * Infrastructure. Unwraps and returns the underlying {@link !Iterable} object,
   * if available.
   * 
   * @returns the underlying {@link !Iterable} object that will give _exactly the same_
   * iteration sequence as current LINQ wrapper. If there is no applicable underlying iterator,
   * this method may return `this`.
   * 
   * @remarks This is the reverse operation of {@link asLinq}. LINQ extension function
   * implementations can use this method to retrieve the underlying data object.
   * 
   * By convention, multiple invocations to this function should return _the same_ reference.
   * Failing to meeting this requirement may result unexpected re-iteration behavior.
   * 
   * As LINQ functions consumer, usually you won't need to call this function directly.
   */
  unwrap(): Iterable<T>;
}

/**
 * Represents an extension point to expose the additional LINQ methods (extension methods)
 * via TypeScript interface augmentation.
 * 
 * @template T type of the sequence item.
 * 
 * @remarks To import the built-in or custom LINQ methods, you need to import
 * the corresponding module and call either {@link registerLinqModule} (recommended)
 * or {@link registerLinqMethod}.
 */
export interface LinqWrapper<T> extends LinqWrapperBase<T>, Iterable<T> {
}

const wrapperCache = new WeakMap<Iterable<unknown>, LinqWrapper<unknown>>();

export function asLinq<T>(sequence: Iterable<T>): LinqWrapper<T> {
  if (sequence instanceof AbstractLinqWrapper) return sequence.asLinq() as LinqWrapper<T>;
  let wrapper = wrapperCache.get(sequence);
  if (!wrapper) {
    wrapper = isArrayLikeStrict(sequence)
      ? new ArrayLikeLinqWrapper(sequence).asLinq()
      : new IterableLinqWrapper(sequence).asLinq();
    wrapperCache.set(sequence, wrapper);
  }
  return wrapper as LinqWrapper<T>;
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
  const prototype = AbstractLinqWrapper.prototype as unknown as Record<string, unknown>;
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
