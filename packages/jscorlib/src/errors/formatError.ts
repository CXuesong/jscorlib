/** The exception that is thrown when the format of an argument is invalid, or when a composite format string is not well formed. */
export class FormatError extends Error {
  public name = "FormatError";
  public constructor(message?: string, options?: ErrorOptions) {
    super(message ?? "Input string was not in a correct format.", options);
  }
}
