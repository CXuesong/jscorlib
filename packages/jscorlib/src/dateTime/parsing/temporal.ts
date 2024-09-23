/// <reference types="temporal-polyfill/global" />
import { FormatError } from "../../errors";
import { SafeInteger } from "../../numbers";
import { tryParseDateTimeInvariant } from "./internal/invariant";
import { createDateTimeParseError, DateTimeParseResult, isDateTimeParseError } from "./internal/parseResult";
import { DateTimeParsingOptions } from "./typing";

// GMT is now considered just a time zone officially used in some European and African countries.
// But UTC is not a time zone, but rather the new time standard that is the basis for clock time and time zones worldwide.
// This means that no country or territory officially uses UTC as a local time.
const utcTimeZoneName = "UTC";

/**
 * Converts the specified string expression of date and/or time to its equivalent {@link Temporal.ZonedDateTime} representation.
 * @returns an object equivalent to the date and time contained in `expression`.
 * @throws {@link FormatError}
 *  * the specified string expression cannot be interpreted as a valid date-time expression.
 *  * both time zone ID and time zone offset has been specified in the `expression`, but the time zone offset
 *    does not belong to the specified time zone ID. (e.g., `"+2:00[Asia/Shanghai]"`)
 * @see {@link tryParseZonedDateTime}
 * @see {@link parseInstant}
 */
export function parseZonedDateTime(expression: string, options?: DateTimeParsingOptions): Temporal.ZonedDateTime {
  const result = tryParseDateTimeInvariant(expression);
  if (isDateTimeParseError(result)) throw createDateTimeParseError(result);
  const zdtLike = parseResultToDateTimeLikeAndOffset(result, options);
  try {
    return Temporal.ZonedDateTime.from(zdtLike, { offset: "reject" });
  } catch (err) {
    if (err instanceof RangeError) throw new FormatError(err.message, { cause: err });
    throw err;
  }
}

/**
 * Tries to convert the specified string expression of date and/or time to its equivalent {@link Temporal.ZonedDateTime} representation.
 * @returns an object equivalent to the date and time contained in `expression`, or `undefined` if the conversion has failed.
 * @see {@link parseZonedDateTime}
 */
export function tryParseZonedDateTime(expression: string, options?: DateTimeParsingOptions): Temporal.ZonedDateTime | undefined {
  const result = tryParseDateTimeInvariant(expression);
  if (isDateTimeParseError(result)) return undefined;
  const zdtLike = parseResultToDateTimeLikeAndOffset(result, options);
  try {
    return Temporal.ZonedDateTime.from(zdtLike, { offset: "reject" });
  } catch (err) {
    if (err instanceof RangeError) return undefined;
    throw err;
  }
}

/**
 * Converts the specified string expression of date and/or time to its equivalent {@link Temporal.Instant} representation.
 * @returns an object equivalent to the date and time contained in `expression`.
 * @throws {@link FormatError}
 *  * the specified string expression cannot be interpreted as a valid date-time expression.
 *  * both time zone ID and time zone offset has been specified in the `expression`, but the time zone offset
 *    does not belong to the specified time zone ID. (e.g., `"+2:00[Asia/Shanghai]"`)
 * @see {@link tryParseInstant}
 * @see {@link parseZonedDateTime}
 */
export function parseInstant(expression: string, options?: DateTimeParsingOptions): Temporal.Instant {
  return parseZonedDateTime(expression, options).toInstant();
}

/**
 * Tries to convert the specified string expression of date and/or time to its equivalent {@link Temporal.Instant} representation.
 * @returns an object equivalent to the date and time contained in `expression`, or `undefined` if the conversion has failed.
 * @see {@link parseInstant}
 */
export function tryParseInstant(expression: string, options?: DateTimeParsingOptions): Temporal.Instant | undefined {
  return tryParseZonedDateTime(expression, options)?.toInstant();
}

// ISO 8601
function formatTZOffsetExpression(tzOffsetMins: SafeInteger): string {
  if (tzOffsetMins === 0) return "+00:00";
  const h = Math.trunc(Math.abs(tzOffsetMins) / 60);
  const m = Math.abs(tzOffsetMins) % 60;
  const sign = h > 0 ? "+" : "-";
  const hpadding = h < 10 ? "0" : "";
  const mpadding = m < 10 ? "0" : "";
  return `${sign}${hpadding}${h}:${mpadding}${m}`;
}

function parseResultToDateTimeLikeAndOffset(
  result: DateTimeParseResult,
  options?: DateTimeParsingOptions,
): Temporal.ZonedDateTimeLike {
  // undefined --> unspecified (Local TZ if TZ ID is also missing; otherwise, inferred from TZ ID)
  let tzOffsetMins: number | undefined;
  let tzId: string;
  if (result.tzId != null)
    [tzId, tzOffsetMins] = [result.tzId, result.tzOffsetMinutes];
  else if (result.tzOffsetMinutes == null)
    [tzId, tzOffsetMins] = options?.assumeUtc ? [utcTimeZoneName, 0] : [Temporal.Now.timeZoneId(), undefined];
  else if (result.tzOffsetMinutes === 0)
    [tzId, tzOffsetMins] = [utcTimeZoneName, 0];
  else
    [tzId, tzOffsetMins] = [formatTZOffsetExpression(result.tzOffsetMinutes), result.tzOffsetMinutes];

  // https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/Globalization/DateTimeParse.cs,63d1edb58b57f7e9
  // See also: "./date.ts"!parseResultToDateTime
  if (result.year == null || result.month == null || result.day == null) {
    const [year, month, day] = getFallbackDate(result.tzId, tzOffsetMins);
    if (result.year == null && result.month == null && result.day == null) {
      // date part is missing
      result.year = year;
      result.month = month;
      result.day = day;
    } else {
      // date part is incomplete
      result.year ??= year;
      result.month ??= 1;
      result.day ??= 1;
    }
  }
  result.hour ??= 0;
  result.minute ??= 0;
  result.second ??= 0;
  result.fraction ??= 0;

  return {
    year: result.year,
    month: result.month,
    day: result.day,
    hour: result.hour,
    minute: result.minute,
    second: result.second,
    millisecond: Math.trunc(result.fraction * 1e3),
    microsecond: Math.trunc((result.fraction * 1e6) % 1000),
    nanosecond: Math.trunc((result.fraction * 1e9) % 1000),
    timeZone: tzId,
    offset: tzOffsetMins == null ? undefined : formatTZOffsetExpression(tzOffsetMins),
  };
}

// tzOffsetMins: undefined means "unspecified", using "Local" if tzId is also missing.
function getFallbackDate(tzId: string | undefined, tzOffsetMins: SafeInteger | undefined): [year: SafeInteger, month: SafeInteger, day: SafeInteger] {
  if (tzId != null) {
    // Explicit TZ ID
    const now = Temporal.Now.zonedDateTimeISO(tzId);
    // We do not check consistency between tzId and tzOffsetMins here.
    return [now.year, now.month, now.day];
  }
  if (tzOffsetMins == null) {
    // Local TZ
    const now = Temporal.Now.zonedDateTimeISO();
    return [now.year, now.month, now.day];
  }
  // TODO calendar
  const utcNow = Temporal.Now.zonedDateTimeISO(utcTimeZoneName);
  if (tzOffsetMins === 0) {
    // UTC
    return [utcNow.year, utcNow.month, utcNow.day];
  }
  // Explicit TZ offset
  // Manually offset the UTC time, as Temporal actually recommends to use TZ name instead of TZ offset.
  const offsetNow = utcNow.add({ minutes: tzOffsetMins });
  return [offsetNow.year, offsetNow.month, offsetNow.day];
}
