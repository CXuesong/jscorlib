import { TypeId, getTypeId, typeIdToString } from "../types/typeId";

export interface InvalidCastErrorOptions extends ErrorOptions {
  valueType?: TypeId;
  targetType?: TypeId;
}

function buildInvalidCastErrorMessage(options?: InvalidCastErrorOptions): string {
  const { valueType, targetType } = options ?? {};
  if (valueType && targetType)
    return `Cannot cast value of type ${typeIdToString(valueType)} into type ${typeIdToString(targetType)}.`;
  if (valueType)
    return `Cannot cast value of type ${typeIdToString(valueType)} into target type.`;
  if (targetType)
    return `Cannot cast value into type ${typeIdToString(targetType)}.`;
  return "Unable to cast value into target type.";
}

export class InvalidCastError extends TypeError {
  public override name = "InvalidCastError";
  public readonly valueType?: TypeId;
  public readonly targetType?: TypeId;
  public constructor(message?: string, options?: InvalidCastErrorOptions) {
    super(message ?? buildInvalidCastErrorMessage(options), options);
    this.valueType = options?.valueType;
    this.targetType = options?.targetType;
  }
  public static fromValue(value: unknown, targetType?: TypeId): InvalidCastError {
    return new InvalidCastError(undefined, {
      valueType: getTypeId(value),
      targetType,
    });
  }
}
