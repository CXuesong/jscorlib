/** The error that is thrown when a method call is invalid for the object's current state. */
export class InvalidOperationError extends Error {
  public override name = "InvalidOperationError";
  public constructor(message?: string, options?: ErrorOptions) {
    super(message ?? "Operation is invalid for current state.", options);
  }
}
