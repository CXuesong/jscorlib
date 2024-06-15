import { ArgumentNullError } from "../errors";
import { SynchronizationContext } from "../synchronization";

/**
 * Expose ability to emit and subscribe to a single type of event.
 */
export class EventEmitter<TArg = void> {
  private _handlers: Array<EventHandler<TArg>> = [];
  /**
   * 
   * @param handler 
   * @returns 
   * @todo Set up convention on what should happen if a handler is added/removed while
   * the event is being fired.
   */
  public subscribe(handler: EventHandler<TArg>): Disposable {
    if (!handler) throw new ArgumentNullError({ paramIndex: 0, paramName: "handler" });
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
