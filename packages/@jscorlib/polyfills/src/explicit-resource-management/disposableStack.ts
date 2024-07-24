export class DisposableStack implements globalThis.DisposableStack {
  private _stack: Disposable[] | undefined = [];
  public get disposed(): boolean {
    return !!this._stack;
  }
  private _getCheckedStack(): Disposable[] {
    if (!this._stack) throw new ReferenceError("DisposableStack has already been disposed.");
    return this._stack;
  }
  public dispose(): void {
    if (!this._stack) return;
    const errors: unknown[] = [];
    while (this._stack.length) {
      const d = this._stack.pop()!;
      try {
        d[Symbol.dispose]();
      } catch (err) {
        errors.push(err);
      }
    }
    this._stack = undefined;
    if (errors.length) {
      // TODO Should throw SuppressedError instead.
      throw new AggregateError(errors);
    }
  }
  public use<T extends Disposable | null | undefined>(value: T): T {
    if (value) {
      this._getCheckedStack().push(value);
    }
    return value;
  }
  public adopt<T>(value: T, onDispose: (value: T) => void): T {
    this._getCheckedStack().push({
      [Symbol.dispose]: () => {
        onDispose(value);
      },
    });
    return value;
  }
  public defer(onDispose: () => void): void {
    this._getCheckedStack().push({
      [Symbol.dispose]: () => {
        onDispose();
      },
    });
  }
  public move(): DisposableStack {
    const inst = new DisposableStack();
    inst._stack = this._stack;
    this._stack = undefined;
    return inst;
  }
  public [Symbol.dispose](): void {
    this.dispose();
  }
  public readonly [Symbol.toStringTag] = "jscorlib::DisposableStack";
}
