import { remove } from "../arrays";
import { assert } from "../diagnostics";
import { ArgumentRangeError, checkArgumentType, InvalidOperationError } from "../errors";
import { asSafeInteger, SafeInteger } from "../numbers";

interface SemaphoreWaiter {
  resolve: () => void;
}

/**
 * Limits the number of concurrent asynchronous processes that can access a resource.
 * 
 * @remarks
 * A Semaphore is a synchronization object that maintains a count between zero and an optional, specified maximum value.
 * The count is decremented each time a caller enters the Semaphore, and incremented each time a caller releases the Semaphore.
 * 
 * To enter the Semaphore, call {@link wait} or {@link waitAsync}. To release the Semaphore, call {@link release}.
 * When {@link count} reaches zero, subsequent calls to {@link waitAsync} will block asynchronously until the Semaphore is released elsewhere.
 * If multiple callers are blocked asynchronously, there is no guaranteed order, such as FIFO or LIFO, that controls who enter the Semaphore.
 */
export class Semaphore {
  private _count: SafeInteger;
  private readonly _maxCount?: SafeInteger;
  private readonly _waiters: SemaphoreWaiter[] = [];
  public constructor(initialCount: SafeInteger, maxCount?: SafeInteger) {
    this._count = asSafeInteger(initialCount);
    this._maxCount = maxCount == null ? undefined : asSafeInteger(maxCount);
    if (this._count < 0) throw ArgumentRangeError.create(0, "initialCount", "initialCount should be non-negative.");
    if (this._maxCount != null) {
      if (this._maxCount <= 0) throw ArgumentRangeError.create(1, "maxCount", "maxCount should be positive.");
      if (this._count > this._maxCount) throw ArgumentRangeError.create(0, "initialCount", "initialCount should be no greater than maxCount.");
    }
  }
  public get count(): SafeInteger {
    return this._count;
  }
  public get maxCount(): SafeInteger | undefined {
    return this._maxCount;
  }
  /**
   * Tries to enter the Semaphore immediately.
   * 
   * @returns `true` if the caller has successfully entered the Semaphore; `false` otherwise.
   * @remarks
   * * If the caller has successfully entered the Sempahore, {@link count} will be decreased by 1.
   * * This method is synchronous and does not block the caller, as JavaScript is single-threaded.
   * Blocking the caller causes deadlocks.
   * @see {release}
   */
  public wait(): boolean {
    if (this._count <= 0) return false;
    this._count--;
    return true;
  }
  /**
   * Blocks the caller asynchronously until it can enter the Semaphore, reached the specified timeout, or has been aborted.
   * 
   * @param timeoutMs maximum time in milliseconds to wait.
   * @param signal a signal used to cancel the wait.
   * @returns `true` if the caller has entered Semaphore successfully; `false` if the specified timeout has been reched.
   * @throws {@link DOMException} the specified `signal` has been aborted. If the signal has been aborted with explicit reason,
   *          the {@link AbortSignal.reason} will be thrown.
   * @remarks
   * If the caller has successfully entered the Sempahore, {@link count} will be decreased by 1.
   * @see {release}
   */
  public waitAsync(timeoutMs?: number, signal?: AbortSignal): Promise<true>;
  /**
   * Blocks the caller asynchronously until it can enter the Semaphore or has reached the specified timeout.
   * 
   * @param signal a signal used to cancel the wait.
   * @returns always `true`, as the returned {@link Promise} won't fulfill until it enters the Semaphore or has been aborted,
   *          which will result in rejection.
   * @throws {@link DOMException} the specified `signal` has been aborted. If the signal has been aborted with explicit reason,
   *          the {@link AbortSignal.reason} will be thrown.
   * @remarks
   * If the caller has successfully entered the Sempahore, {@link count} will be decreased by 1.
   * @see {release}
   */
  public waitAsync(signal?: AbortSignal): Promise<boolean>;
  /**
   * Blocks the caller asynchronously until it can enter the Semaphore.
   * 
   * @returns always `true`, as the returned {@link Promise} won't fulfill until it enters the Semaphore.
   * @remarks
   * If the caller has successfully entered the Sempahore, {@link count} will be decreased by 1.
   * @see {release}
   */
  public waitAsync(): Promise<true>;
  public waitAsync(arg0?: number | AbortSignal, arg1?: AbortSignal): Promise<boolean> {
    const [timeoutMs, signal] = typeof arg0 === "number"
      ? [arg0, arg1]
      : [undefined, arg0];
    if (timeoutMs != null) {
      checkArgumentType(0, "timeoutMs", timeoutMs, "number");
      if (timeoutMs < 0) throw ArgumentRangeError.create(0, "timeoutMs", "Timeout should be non-negative.");
    }
    if (signal != null) {
      checkArgumentType(typeof arg0 === "number" ? 1 : 0, "signal", signal, AbortSignal);
      // Bail out
      signal.throwIfAborted();
    }
    if (this._count > 0) {
      this._count--;
      return Promise.resolve(true);
    }

    // Semaphore not available.
    // You cannot actually setTimeout with timeout less than 1ms.
    // https://chromium.googlesource.com/chromium/blink/+/master/Source/core/frame/DOMTimer.cpp#93
    if (timeoutMs != null && timeoutMs <= 1) return Promise.resolve(false);
    // Wait asynchronously.
    const pr = Promise.withResolvers<boolean>();
    let timeoutId = undefined;
    let onAbort = undefined;
    if (timeoutMs != null) {
      timeoutId = setTimeout(() => {
        remove(this._waiters, waiter);
        cleanup();
        pr.resolve(false);
      }, timeoutMs);
    }
    if (signal) {
      onAbort = () => {
        remove(this._waiters, waiter);
        cleanup();
        pr.reject(signal.reason);
      };
      signal.addEventListener("abort", onAbort);
    }
    const cleanup = () => {
      if (timeoutId != null) clearTimeout(timeoutId);
      if (onAbort != null) signal!.removeEventListener("abort", onAbort);
    };
    const waiter: SemaphoreWaiter = {
      resolve: () => {
        cleanup();
        assert(this._count > 0);
        this._count--;
        pr.resolve(true);
      },
    };
    this._waiters.push(waiter);
    return pr.promise;
  }
  /**
   * Releases the Semaphore a specified number of times.
   * 
   * @param releaseCount The number of times to exit the Semaphore. `undefined` will exit the Semaphore once (1).
   * @throws {@link InvalidOperationError} Adding the specified count to the Semaphore would cause it to exceed {@link maxCount}.
   * @remarks
   * * A call to this function increments the {@link count} by `releaseCount`. If {@link count} is already `0` before this function
   * is called, the function also allows `releaseCount` {@link Promise}s blocked by {@link waitAsync} to enter the Semaphore.
   * * If there are blocked Promises waiting to enter the Semaphore, this function _does not_ guarantee the order in which
   * the blocked Promises enters the Semaphore (e.g. FIFO). That is, the order does not have to be deterministic and is subject
   * to changes in a later version of the implementation.
   * * When deciding whether the specified `releaseCount` will cause Semaphore to exceed {@link maxCount}, Promises waiting to
   * enter the Semaphore are not counted in. This behavior is currently just to align with the Win32
   * [`ReleaseSemaphore`](https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-releasesemaphore)
   * API.
   */
  public release(releaseCount?: SafeInteger): SafeInteger {
    releaseCount = releaseCount == null ? 1 : asSafeInteger(releaseCount);
    if (releaseCount < 1) throw ArgumentRangeError.create(0, "releaseCount", "releaseCount should be positive.");
    // We align the behavior with Win32 Semaphore API, that is, waiters does not count.
    if (this._maxCount != null && this._maxCount - this._count < releaseCount)
      throw new InvalidOperationError("Adding the specified count to the Semaphore would cause it to exceed its maximum count.");
    const prevCount = this.count;

    // Drain waiters queue first
    // Actually it's LIFO here. Surprise XD
    let nextWaiter;
    while (releaseCount > 0 && (nextWaiter = this._waiters.pop())) {
      releaseCount--;
      nextWaiter.resolve();
    }

    // Then increase count
    this._count += releaseCount;
    assert(this._maxCount == null || this._count <= this._maxCount);
    return prevCount;
  }
  public toString(): string {
    if (this._maxCount == null) return `[Semaphore ${this._count}]`;
    return `[Semaphore ${this._count}/${this._maxCount}]`;
  }
  public readonly [Symbol.toStringTag] = "Semaphore";
}
