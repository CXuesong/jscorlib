let _current: SynchronizationContext | undefined;

/**
 * Provides a way to queue a unit of work to a context.
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
   */
  public post(callback: () => void): void {
    queueMicrotask(callback);
  }
}
