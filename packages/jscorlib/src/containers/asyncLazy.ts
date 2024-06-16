import { checkArgumentType } from "../errors";

const enum AsyncLazyState {
  Unresolved = 0,
  Resolving,
  Resolved,
}

interface AsyncLazyUnresolvedStateHolder<T> {
  state: AsyncLazyState.Unresolved;
  valueFactory: () => PromiseLike<T>;
}

interface AsyncLazyResolvingStateHolder<T> {
  state: AsyncLazyState.Resolving;
  promise: Promise<T>;
}

interface AsyncLazyResolvedStateHolder<T> {
  state: AsyncLazyState.Resolved;
  value: T;
}

type AsyncLazyStateHolder<T> =
  | AsyncLazyUnresolvedStateHolder<T>
  | AsyncLazyResolvingStateHolder<T>
  | AsyncLazyResolvedStateHolder<T>
  ;

export class AsyncLazy<T> {
  private _stateHolder: AsyncLazyStateHolder<T>;
  public constructor(valueFactory: () => PromiseLike<T>) {
    checkArgumentType(0, "valueFactory", valueFactory, "function");
    this._stateHolder = {
      state: AsyncLazyState.Unresolved,
      valueFactory,
    };
  }
  public get valueCreated(): boolean {
    return this._stateHolder.state === AsyncLazyState.Resolved;
  }
  public get value(): Promise<T> {
    switch (this._stateHolder.state) {
      case AsyncLazyState.Unresolved:
        this._stateHolder = {
          state: AsyncLazyState.Resolving,
          promise: this._resolveValue(this._stateHolder),
        };
        return this._stateHolder.promise;
      case AsyncLazyState.Resolving:
        return this._stateHolder.promise;
      case AsyncLazyState.Resolved:
        return Promise.resolve(this._stateHolder.value);
    }
  }
  public get tryGetValueImmediate(): T | undefined {
    return this._stateHolder.state === AsyncLazyState.Resolved ? this._stateHolder.value : undefined;
  }
  private async _resolveValue(stateHolder: AsyncLazyUnresolvedStateHolder<T>): Promise<T> {
    try {
      const value = await stateHolder.valueFactory();
      this._stateHolder = {
        state: AsyncLazyState.Resolved,
        value,
      };
      return value;
    } catch (err) {
      this._stateHolder = {
        state: AsyncLazyState.Unresolved,
        valueFactory: stateHolder.valueFactory,
      };
      throw err;
    }
  }
}
