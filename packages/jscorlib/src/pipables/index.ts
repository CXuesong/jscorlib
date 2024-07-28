/**
 * This module contains some helpers borrowing some of basic the concepts from [ES pipe operator](https://tc39.es/proposal-pipeline-operator/),
 * enabling extending methods to existing objects in a tree-shaking-friendly way.
 * 
 * ```ts
 * // ES pipe operator (2021)
 * x |> func1(%, a)
 *   |> func2(%, b)
 *   |> func3(%, c)
 * 
 * // Pipables (this module)
 * let x: PipeTarget;
 * x.$(func1(a))
 *  .$(func2(b))
 *  .$(func3(c))
 * ```
 * 
 * To enable usage with pipe functions, an object should implement {@link PipeTarget} interface (the `$` method).
 * 
 * Pipe functions should be compatible with {@link PipeFunction}. Refer to the type definition documentation for more information.
 * 
 * @see [TC 39 Stage 2 Draft: ES pipe operator](https://tc39.es/proposal-pipeline-operator/)
 * 
 * @module
 */
import { PipeFunction, PipeTarget } from "./typing";

export * from "./typing";
