/*
We will have to design the extension methods this way due to
https://github.com/microsoft/TypeScript/issues/41709
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
export type PipeFunction<TTarget = any, TArgs extends any[] = any[], TReturnValue = any> = (...args: TArgs) => PipeBody<TTarget, TReturnValue>;

export type PipeBody<TTarget = any, TReturnValue = any> = (target: TTarget) => TReturnValue;
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface PipeTarget {
  $<T>(pipeBody: PipeBody<this, T>): T;
}
