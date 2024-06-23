import type { LinqWrapper, LinqWrapperBase } from "./linqWrapper";

// TODO global shared instanceof support with Symbol.for
/** @internal */
export class LinqWrapperImpl<T> implements LinqWrapperBase<T> {
  private constructor(private readonly _iterable: Iterable<T>) {
  }
  public static create<T>(iterable: Iterable<T>): LinqWrapper<T> {
    // Coerce the type
    return new LinqWrapperImpl(iterable) as unknown as LinqWrapper<T>;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public [Symbol.iterator](): Iterator<T, any, undefined> {
    return this._iterable[Symbol.iterator]();
  }
  public asLinq(): LinqWrapper<T> {
    return this as unknown as LinqWrapper<T>;
  }
  public unwrap(): Iterable<T> {
    return this._iterable;
  }
}
