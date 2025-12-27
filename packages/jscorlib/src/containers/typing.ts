/** Provides ability to lazily evaluate a value when it is accessed for the first time. */
export interface LazyLike<T> {
  /** Whether the value has been created. */
  readonly valueCreated: boolean;
  /** Gets the lazily evaluated value. */
  readonly value: T;
}

/** Provides ability to lazily evaluate a value asynchronously when it is accessed for the first time. */
export interface AsyncLazyLike<T> {
  /** Whether the value has been created. */
  readonly valueCreated: boolean;
  /** Gets the lazily evaluated value. */
  readonly value: Promise<T>;
  /** Attempts to get the value immediately if it has been created. */
  tryGetImmediateValue(): T | undefined;
}
