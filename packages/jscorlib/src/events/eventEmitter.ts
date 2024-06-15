import { checkArgumentType } from "../errors";
import { SynchronizationContext } from "../synchronization";

/**
 * Expose ability to emit and subscribe to a single type of event.
 * @template TArg type of the event payload.
 */
export class EventEmitter<TArg = void> {
  private _handlers: Array<EventHandler<TArg>> = [];
  /**
   * Subscribes to the event.
   * @param handler a function to call when the event has been fired.
   * @returns a token used to cancel the event subscription.
   * @remarks
   * * Subscribing the same handler multiple times is allowed; they will be invoked multiple times.
   * * If `handler` returns a {@link PromiseLike} value, depending on how the {@link EventEmitter.invokeAsync} is called,
   *    your event handler might be called concurrently (the 2nd invocation starts before the 1st invocation ends).
   * @todo Set up convention on what should happen if a handler is added/removed while
   * the event is being fired.
   */
  public subscribe(handler: EventHandler<TArg>): Disposable {
    checkArgumentType(0, "handler", handler, "function");

    let unsubscribed = false;
    this._handlers.push(handler);
    return {
      [Symbol.dispose]: () => {
        if (unsubscribed) return;
        const index = this._handlers.indexOf(handler);
        if (index >= 0) {
          this._handlers.splice(index, 1);
        }
        unsubscribed = true;
      },
    };
  }
  /**
   * Fires the event.
   * @param arg event payload.
   * @remarks
   * * This function will asynchronously wait for all its event handlers to return (or throw)
   * before returning, but _will not_ await any asynchronous portions.
   * * Were any of the event handler to throw any error, this function
   * _would not_ throw. Instead, errors are thrown to the current {@link SynchronizationContext}.
   */
  public invoke(arg: TArg): void {
    for (const h of this._handlers) {
      try {
        void h.call(undefined, arg);
      } catch (err) {
        // re-throw error later in global context
        SynchronizationContext.current.post(() => {
          throw err;
        });
        // continue running the next event handler
      }
    }
  }
  /**
   * Fires the event asynchronously.
   * @param arg event payload.
   * @remarks
   * * This function will wait for all its event handlers to return (or throw)
   * before returning, and will await any asynchronous portions.
   * * Were any of the event handler to throw any error, this function
   * _would not_ throw. Instead, errors are thrown to the current {@link SynchronizationContext}.
   */
  public async invokeAsync(arg: TArg): Promise<void> {
    const promises: Array<PromiseLike<void>> = [];
    for (const h of this._handlers) {
      try {
        const r = h.call(undefined, arg);
        if (r?.then) promises.push(r);
      } catch (err) {
        // re-throw error later in global context
        SynchronizationContext.current.post(() => {
          throw err;
        });
        // continue running the next event handler
      }
    }
    // Just wait for the promises to settle -- we don't want to bubble up the errors to the caller.
    await Promise.allSettled(promises);
  }
}

export type SyncEventHandler<TArg> = (this: void, arg: TArg) => void;
export type AsyncEventHandler<TArg> = (this: void, arg: TArg) => void | PromiseLike<void>;
export type EventHandler<TArg> = SyncEventHandler<TArg> | AsyncEventHandler<TArg>;
