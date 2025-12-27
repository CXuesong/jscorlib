import { checkArgumentType } from "../errors";
import type { AsyncLazy } from "./asyncLazy";
import { LazyLike } from "./typing";

/**
 * A container that lazily evaluates a value when it is accessed for the first time.
 * 
 * @see {@link LazyLike}
 * @see {@link AsyncLazy}
*/
export class Lazy<T> implements LazyLike<T> {
  private _value?: T;
  private _valueFactory?: () => T;
  public constructor(valueFactory: () => T) {
    checkArgumentType(0, "valueFactory", valueFactory, "function");
    this._valueFactory = valueFactory;
  }
  public get valueCreated(): boolean {
    return this._valueFactory == null;
  }
  public get value(): T {
    if (this._valueFactory != null) {
      // Detach the value factory as we won't be needing it anymore.
      this._value = this._valueFactory();
      delete this._valueFactory;
    }
    return this._value!;
  }
}
