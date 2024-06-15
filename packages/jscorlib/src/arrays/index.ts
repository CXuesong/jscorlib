/**
 * @module
 * Contains helpers to work with the JS built-in Array data type.
 * 
 * Due to historical reasons and backwards compatibility considerations, Arrays in JS lacks API consistency,
 * and some operations might not be intuitive enough. This module may help you to cope with them.
 * 
 * ## API conventions
 * Unless otherwise noted,
 * * all the array index parameters of {@see typing#BidirectionalIndex} are bidirectional,
 *      meaning that you can use negative numbers to access array from the end.
 * * all the methods treat arrays with empty slots (or ["sparse arrays"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections#sparse_arrays))
 *      as if the empty slots are all filled with `undefined`. This is consistent with
 *      [how the newer Array APIs are handling the empty slots](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#array_methods_and_empty_slots).
 * 
 * @see {typing#BidirectionalIndex}
 * @see {Array}
 */
export * from "./indexOf";
export * from "./remove";
