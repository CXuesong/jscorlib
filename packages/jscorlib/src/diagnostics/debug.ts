/**
 * In DEV environment, emits an error message.
 * This is usally used to indicate a critial failure during development process.
 * 
 * @param message message content.
 * @remarks
 * In DEV mode, this function will
 * * show user an alert message box (if `confirm` or `alert` function is available in global scope),
 * * trigger a `debugger` breakpoint,
 * * throw an error to the caller,
 *   * This means if there is error handler (`try...catch`) present on the stack trace, such unhandled error might
 *     cause unexpected behavior (as there is an unhandled error bubbling up).
 * * and signal the failure with `console.assert` function.
 * In PROD mode, this function does nothing. Bundler should be optimizing such call away.
 * 
 * Thus, please note that this function may or may not stop the caller's code execution.
 */
export function fail(message: string): void {
  if (process.env.NODE_ENV === "production") return;

  const err = new DebugFailure(message);
  console.assert(false, "[jscorlib] Diagnostics.Fail has been called.", err);

  if (typeof confirm === "function") {
    if (!confirm(`[jscorlib] Diagnostics.Fail has been called.
"Yes" = trigger a JS breakpoint.
"No" = ignore the debugging failure.
----------
${err.stack || String(err)}
`)) {
      return;
    }
  } else if (typeof alert === "function") {
    alert(`[jscorlib] Diagnostics.Fail has been called.
"OK" = trigger a JS breakpoint.
----------
${err.stack || String(err)}
`);
  }
  // eslint-disable-next-line no-debugger
  debugger;
  throw err;
}

class DebugFailure extends Error {
  public override name = "DebugFailure";
}

/**
 * Checks for a condition; if the condition is `false`,
 * outputs messages and shows the call stack with {@link fail} function.
 * 
 * @param condition the condition to check.
 * @param message the message to display when the condition is falsy.
 */
export function assert(condition: boolean, message?: string): asserts condition;
/**
 * Checks for a condition; if the condition is [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)
 * (e.g., `false`, `null`, `undefined`, `0`, `""`),
 * outputs messages and shows the call stack with {@link fail} function.
 * 
 * @param condition the condition to check.
 * @param message the message to display when the condition is falsy.
 */
export function assert(condition: unknown, message?: string): asserts condition;
export function assert(condition: unknown, message?: string): void {
  if (condition) return;
  fail(`[Assertion failure]\n${message ?? "No additional information provided."}`);
}
