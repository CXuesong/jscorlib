import { TypeFromTypeId, TypeId, getTypeId, isAssignableToTypeId, typeIdToString } from "../types/typeId";

export interface ArgumentErrorOptions extends ErrorOptions {
  /** name of the parameter that causes this exception. */
  paramName?: string;
  /** 0-based index of the parameter that causes this exception. */
  paramIndex?: number;
}

function tryBuildArgumentIdentifier(paramIndex: number | undefined, paramName: string | undefined): string | undefined {
  if (paramIndex == null && paramName == null) return undefined;
  let expr = "";
  if (paramIndex != null) expr = `#${paramIndex}`;
  if (paramName != null) {
    if (expr) expr += ": ";
    expr += paramName;
  }
  return expr;
}

function buildArgumentErrorMessage(stem: string, options?: ArgumentErrorOptions): string {
  const paramId = tryBuildArgumentIdentifier(options?.paramIndex, options?.paramName);
  return paramId == null ? stem : `${stem} Parameter: ${paramId}.`;
}

/**
 * Represents common information shared between {@link ArgumentTypeError} and {@link ArgumentRangeError}.
 */
export interface ArgumentError extends Error {
  /** name of the parameter that causes this exception. */
  readonly paramName?: string;
  /** 0-based index of the parameter that causes this exception. */
  readonly paramIndex?: number;
}

/**
 * The error that is thrown when one of the arguments provided to a method is not valid.
 */
export class ArgumentRangeError extends RangeError implements ArgumentError {
  public override name = "ArgumentRangeError";
  /** name of the parameter that causes this exception. */
  public readonly paramName?: string;
  /** 0-based index of the parameter that causes this exception. */
  public readonly paramIndex?: number;
  public constructor(message?: string, options?: ArgumentErrorOptions) {
    super(
      message ?? buildArgumentErrorMessage("Value does not fall within the expected range.", options),
      options,
    );
    this.paramIndex = options?.paramIndex;
    this.paramName = options?.paramName;
  }
  public static create(paramIndex: number | undefined, paramName?: string, message?: string): ArgumentRangeError {
    return new ArgumentRangeError(message, { paramIndex, paramName });
  }
}

export interface ArgumentTypeErrorOptions extends ArgumentErrorOptions {
  valueType?: TypeId;
  argumentTypes?: TypeId[];
}

function buildArgumentTypeErrorMessage(options?: ArgumentTypeErrorOptions): string {
  const { valueType, argumentTypes } = options ?? {};
  const argumentExpr = tryBuildArgumentIdentifier(options?.paramIndex, options?.paramName);
  const argTypeExpr = argumentTypes?.length ? argumentTypes.map(t => typeIdToString(t)).join(" | ") : undefined;
  const argumentSuffix = argumentExpr == null ? "" : ` Parameter: ${argumentExpr}.`;
  if (valueType && argTypeExpr != null)
    return `Cannot apply value of type ${typeIdToString(valueType)} into parameter of type ${argTypeExpr}.${argumentSuffix}`;

  if (valueType)
    return `Cannot apply value of type ${typeIdToString(valueType)} into parameter.${argumentSuffix}`;

  if (argTypeExpr != null)
    return `Type mismatch applying the value into parameter of type ${argTypeExpr}.${argumentSuffix}`;

  return `Type mismatch applying the value into parameter.${argumentSuffix}`;
}

/**
 * The error that is thrown when one of the arguments provided to a method is not valid.
 */
export class ArgumentTypeError extends TypeError implements ArgumentError {
  public override name = "ArgumentTypeError";
  /** name of the parameter that causes this exception. */
  public readonly paramName?: string;
  /** 0-based index of the parameter that causes this exception. */
  public readonly paramIndex?: number;
  public readonly valueType?: TypeId;
  public readonly targetType?: TypeId;
  public constructor(message?: string, options?: ArgumentTypeErrorOptions) {
    super(message ?? (buildArgumentTypeErrorMessage(options)), options);
    this.paramIndex = options?.paramIndex;
    this.paramName = options?.paramName;
  }
  /**
   * Short-hand function to create an {@link ArgumentTypeError} instace with general message.
   * 
   * @see {@link checkArgumentType}
   */
  public static create(paramIndex: number | undefined, paramName?: string, message?: string): ArgumentRangeError {
    return new ArgumentTypeError(message, { paramIndex, paramName });
  }
}

function buildArgumentNullErrorMessage(options?: ArgumentTypeErrorOptions): string {
  const argumentExpr = tryBuildArgumentIdentifier(options?.paramIndex, options?.paramName);
  const nullExpr = options?.valueType === "object" ? "null" : "undefined";
  const argumentSuffix = argumentExpr == null ? "" : ` Parameter: ${argumentExpr}.`;
  return `Value cannot be ${nullExpr}.${argumentSuffix}`;
}

/**
 * The error that is thrown when a `null` (or `undefined`) value is passed to a method that does not accept it as a valid argument.
 * 
 * @remarks By convention of jscorlib, we recommend not distinguishing between `null` and `undefined`.
 */
export class ArgumentNullError extends ArgumentTypeError {
  public override name = "ArgumentNullError";
  public constructor(message?: string, options?: ArgumentTypeErrorOptions) {
    super(message ?? buildArgumentNullErrorMessage(options), options);
  }
  public static override create(paramIndex: number | undefined, paramName?: string, message?: string): ArgumentRangeError {
    return new ArgumentNullError(message, { paramIndex, paramName });
  }
}

/**
 * A helper function to ensure the given argument value satisfies the type constraints.
 * @param paramIndex 0-based index of the parameter.
 * @param paramName parameter name.
 * @param value passed in parameter value.
 * @param allowedType any allowed types of this parameter.
 * 
 * @throws {@link ArgumentTypeError} Provided parameter does not satisfy the type constraints.
 */
export function checkArgumentType<TTypeIds extends TypeId[]>(
  paramIndex: number, paramName: string, value: unknown, ...allowedType: TTypeIds
): asserts value is TypeFromTypeId<TTypeIds[number]>;
export function checkArgumentType(paramIndex: number, paramName: string, value: unknown, ...allowedTypes: TypeId[]): void;
export function checkArgumentType(paramIndex: number, paramName: string, value: unknown, ...allowedTypes: TypeId[]): void {
  if (value == null) {
    throw new ArgumentNullError(undefined, {
      paramIndex,
      paramName,
      valueType: getTypeId(value),
      argumentTypes: allowedTypes,
    });
  }
  for (const typeId of allowedTypes) {
    if (isAssignableToTypeId(value, typeId)) return;
  }
  throw new ArgumentTypeError(undefined, {
    paramIndex,
    paramName,
    valueType: getTypeId(value),
    argumentTypes: allowedTypes,
  });
}
