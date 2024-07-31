import type { EventEmitter } from "../events";

let _current: SynchronizationContext | undefined;

/**
 * Provides a way to queue a unit of work to a context.
 * 
 * @remarks
 * While there is no built-in multi-threading support in JavaScript, this class provides abstraction for APIs
 * in the same library (e.g., {@link EventEmitter}) to allow their asynchronous behavior to be overridden
 * to some extent.
 */
export class SynchronizationContext {
  public static get current(): SynchronizationContext {
    return _current ??= new SynchronizationContext();
  }
  public static set current(value: SynchronizationContext) {
    _current = value;
  }
  /**
   * Dispatches an asynchronous message to a synchronization context.
   * @param callback the callback to excute on the synchronization context.
   * @virtual
   * The default implementation is to leverage {@link queueMicrotask} to queue the work asynchronously.
   */
  public post(callback: () => void): void {
    queueMicrotask(callback);
  }
}
