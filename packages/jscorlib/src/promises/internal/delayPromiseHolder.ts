import { assert } from "../../diagnostics";

export class DelayPromiseHolder implements Disposable {
  private _timeoutId?: ReturnType<typeof setTimeout>;
  private _res?: () => void;
  private _rej?: (reason: unknown) => void;
  private _promise?: Promise<void>;
  public constructor(public readonly delayMs?: number, public readonly signal?: AbortSignal) {
    // If you are ignoring both params, you might well use `new Promise(() => {})`.
    assert(delayMs != null || signal);

    this._promise = new Promise((res, rej) => {
      this._res = res;
      this._rej = rej;
    });

    signal?.addEventListener("abort", this._notifyAborted);

    if (delayMs != null) {
      this._timeoutId = setTimeout(this._notifyCompleted, delayMs);
    }
  }
  public get promise(): Promise<void> {
    assert(this._promise);
    return this._promise;
  }
  private _notifyCompleted = () => {
    this._res?.();
    this.dispose();
  };
  private _notifyAborted = () => {
    this._rej?.(this.signal?.reason);
    this.dispose();
  };
  public dispose(): void {
    this.signal?.removeEventListener("abort", this._notifyAborted);
    if (this._timeoutId != null) clearTimeout(this._timeoutId);
    this._timeoutId = undefined;
    this._promise = undefined;
    this._res = undefined;
    this._rej = undefined;
    // TODO probably also cleanup unfired callbacks.
  }
  public [Symbol.dispose](): void {
    this.dispose();
  }
}
