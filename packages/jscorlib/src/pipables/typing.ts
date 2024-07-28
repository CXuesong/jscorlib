/*
We will have to design the extension methods this way due to
https://github.com/microsoft/TypeScript/issues/41709

See also
https://github.com/microsoft/TypeScript/issues/51556
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A function applicable to the {@link PipeTarget}.
 * 
 * Pipe functions are functions that, when invoked, returns another function, i.e., {@link PipeBody}, that only accepts 1 parameter,
 * i.e., {@link PipeTarget}.
 * 
 * Since TypeScript 4.9, you can use the following idiom to ensure your pipe function is compatible.
 * 
 * ```ts
 * function myPipeFunction(arg1: number): PipeBody<Target, string> {
 *  return target => {
 *    // ...
 *    return "result";
 *  };
 * }
 * 
 * // Ensures type compatibility.
 * myPipeFunction satisfies PipeFunction;
 * ```
 */
export type PipeFunction<TTarget = any, TArgs extends any[] = any[], TReturnValue = any> = (...args: TArgs) => PipeBody<TTarget, TReturnValue>;

/**
 * The return type of {@link PipeFunction}. This is a function that will be eventually invoked
 * directly with the {@link PipeTarget}.
 */
export type PipeBody<TTarget = any, TReturnValue = any> = (target: TTarget) => TReturnValue;
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface PipeTarget {
  /**
   * Applies the current object (`this`) to the specified pipe function result.
   * 
   * @param pipeBody an unary function, usually the return value of {@link PipeFunction}.
   */
  $<T>(pipeBody: PipeBody<this, T>): T;
}
