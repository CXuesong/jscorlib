/**
 * The error that is thrown when a specified timeout has been reached while performing an operation.
 */
export class TimeoutError extends Error {
  public override name = "TimeoutError";
}
