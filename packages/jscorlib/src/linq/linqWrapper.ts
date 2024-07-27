import { PipeTarget } from "../pipables";
import { AbstractLinqWrapper, IterableLinqWrapper } from "./linqWrapper.internal";

/**
 * Represents an extension point to expose the additional LINQ methods
 * via {@link PipeTarget}.
 * 
 * @template T type of the sequence item.
 * 
 * @remarks To invoke LINQ methods, use the {@link $} method with LINQ pipe functions
 * in this module.
 */
export interface LinqWrapper<T> extends Iterable<T>, PipeTarget {
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

const wrapperCache = new WeakMap<Iterable<unknown>, LinqWrapper<unknown>>();

export function asLinq<T>(sequence: Iterable<T>): LinqWrapper<T> {
  if (sequence instanceof AbstractLinqWrapper) return sequence as LinqWrapper<T>;
  let wrapper = wrapperCache.get(sequence);
  if (!wrapper) {
    wrapper = new IterableLinqWrapper(sequence);
    wrapperCache.set(sequence, wrapper);
  }
  return wrapper as LinqWrapper<T>;
}
