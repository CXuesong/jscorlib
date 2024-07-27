import { PipeTarget } from "../pipables";
import { AbstractLinqWrapper, IterableLinqWrapper } from "./linqWrapper.internal";

/**
 * Provides basic methods in addition to {@link !Iterable} in order to
 * support LINQ extension methods.
 * 
 * @template T type of the sequence item.
 */
export interface LinqWrapperBase<T> extends Iterable<T>, PipeTarget {
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
    wrapper = new IterableLinqWrapper(sequence).asLinq();
    wrapperCache.set(sequence, wrapper);
  }
  return wrapper as LinqWrapper<T>;
}
