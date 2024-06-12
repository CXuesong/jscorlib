export interface ArgumentErrorOptions extends ErrorOptions {
  /** name of the parameter that causes this exception. */
  paramName?: string;
  /** 0-based index of the parameter that causes this exception. */
  paramIndex?: number;
}

function buildArgumentErrorMessage(stem: string, options?: ArgumentErrorOptions): string {
  let m = stem;
  if (options?.paramName != null || options?.paramIndex != null) {
    let paramExpr = "";
    if (options.paramIndex != null) paramExpr = `#${options.paramIndex}`;
    if (options.paramName != null) {
      if (paramExpr) paramExpr += ": ";
      paramExpr += options.paramName;
    }
    m += " ";
    m += paramExpr;
  }
  return m;
}

/**
 * The error that is thrown when one of the arguments provided to a method is not valid.
 */
export class ArgumentError extends RangeError {
  public name = "ArgumentError";
  /** name of the parameter that causes this exception. */
  public readonly paramName?: string;
  /** 0-based index of the parameter that causes this exception. */
  public readonly paramIndex?: number;
  public constructor(message?: string, options?: ArgumentErrorOptions) {
    super(
      message ?? buildArgumentErrorMessage("Value does not fall within the expected range.", message),
      options,
    );
    this.paramIndex = options?.paramIndex;
    this.paramName = options?.paramName;
  }
}

/**
 * The error that is thrown when a `null` (or `undefined`) value is passed to a method that does not accept it as a valid argument.
 * 
 * @remarks By convention of jscorlib, we recommend not distinguishing between `null` and `undefined`.
 */
export class ArgumentNullError extends ArgumentError {
  public name = "ArgumentNullError";
  public constructor(options?: ArgumentErrorOptions);
  public constructor(message?: string, options?: ArgumentErrorOptions);
  public constructor(arg1?: string | ArgumentErrorOptions, options?: ArgumentErrorOptions) {
    super(
      (typeof arg1 === "string" ? arg1 : undefined)
      ?? buildArgumentErrorMessage(
        "Value cannot be null.",
        options ?? (typeof arg1 === "object" ? arg1 : undefined),
      ),
      options,
    );
  }
}
