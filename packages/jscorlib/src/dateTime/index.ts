/**
 * Contains a set of helper functions to work with {@link !Date} and {@link !Temporal} APIs.
 * 
 * Note that since `Temporal` API is still in TC 39 Draft phase, if you are going to work with these API,
 * you will have to apply a polyfill, such as
 * * [temporal-polyfill](https://www.npmjs.com/package/temporal-polyfill)
 * * [@js-temporal/polyfill](https://www.npmjs.com/package/@js-temporal/polyfill)
 * 
 * jscorlib is not providing polyfill as its implementation is not trivial.
 * 
 * As this package as declared to be side-effectless, you should not see runtime errors caused by
 * "missing dependencies" until you have consumed functions that have code path dependency on `Temporal` API.
 * 
 * @see [TC 39 Stage 3 Draft: Temporal](https://tc39.es/proposal-temporal/)
 * @see [Temporal documentation](https://tc39.es/proposal-temporal/docs/)
 * 
 * ## Parsing
 * 
 * This module provides a more permissive parsing functionality for {@link !Date} and {@link Temporal} APIs.
 * Similar to date/time parsing in .NET, this package currently supports any of following "invariant"
 * date/time expressions.
 * 
 *  * Date expression
 *    * `yyyy-MM-dd`
 *    * `MM-dd-yyyy`
 *    * `yyyy-MMM-dd`
 *    * `yyyy-MMMM-dd`
 *    * `dd-MMM-yyyy` (RFC 1123)
 *    * `dd-MNMM-yyyy`
 *    * Optionally, prepending or appending `ddd` is supported.
 *  * Time expression
 *    * `HH:mm:ss.fffffffff`
 *    * `tt hh:mm:ss.fffffffff`
 *    * `hh:mm:ss.fffffffff tt`
 *  * Time zone offset
 *    * `+0:00`
 *    * `+00:00`
 *    * `+0000`
 *    * `Z` (=`+00:00`)
 *    * `GMT` (=`+00:00`) (RFC 1123)
 *  * Time zone ID (Not supported by {@link !Date})
 *    * `[tz]`
 * 
 * Refer to [Custom date and time format strings](https://learn.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings)
 * for a list of explanations for the placeholders above.
 * 
 * These expressions are combined in the following order, with optional whitespaces in between
 * 
 * > Date + Time [+ Time zone offset] [+ Time zone ID]
 * 
 * Not all of the expressions above are mandatory. Besides, one or more sub-part of the date or time expression can be neglected.
 * For example, the following date/time expression are all valid
 *  * `2001-10-5` -> `2021-10-5 00:00:00 Z`
 *  * `2001-10-5 +8:00` -> `2021-10-4 16:00:00 Z`
 *  * `2001-10` -> `2021-10-1 00:00:00 [local TZ]`
 *  * `10:50Z` -> `[Today] 10:50:00 Z`
 *  * `10:50` -> `[Today] 10:50:00 [local TZ]`
 *  * `10:50 [Asia/Shanghai]` -> `[Today] 10:50:00 +8:00 [Asia/Shanghai]`
 * 
 * However, at least either of the date or time expression should present. Expressions with only time zone ID / offset
 * are considered invalid.
 * 
 * @module
 */
export * from "./parsing";
