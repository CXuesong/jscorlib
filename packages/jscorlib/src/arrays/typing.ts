/**
 * Represents an Zero-based index. By convention,
 * * index is [converted to an integer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#integer_conversion);
 * * negative index counts back from the end of the array. Specifically, `index` < 0 means `index` + `array.length`.
 * 
 * @see {Array.at}
 */
export type BidirectionalIndex = number;

/**
 * Represents the sentry value `-1` returned from `indexOf` or `findIndex` series of functions,
 * when there is no matching element found in the array.
 * 
 * This apparently loose type definition still provides slightly tighter type than plain `number`,
 * when we are (almost) sure the `indexOf` function will return `-1` with the provided arguments,
 * while encouraging the caller to write something like
 * ```ts
 * const arr = [1, 2, 3];                     // number[]
 * const needle = "I don't exist at all.";    // string (not assignable to number)
 * if (Arrays.indexOf(arr, needle) < 0) {
 *   // item not found
 * }
 * ```
 * rather than
 * ```ts
 * if (Arrays.indexOf(arr, needle) === -1) {
 *   // item not found
 * }
 * ```
 * in order to make work of API backward compatibility easier.
 */
export type NoMatchIndexNominal =
  | -1
  | -1.5
  | -2
  | -2.5
  | -1e100
  ;
