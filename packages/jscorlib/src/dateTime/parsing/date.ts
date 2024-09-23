import { assert } from "../../diagnostics";
import { FormatError } from "../../errors";
import { SafeInteger } from "../../numbers";
import { tryParseDateTimeInvariant } from "./internal/invariant";
import { createDateTimeParseError, DateTimeParseResult, isDateTimeParseError } from "./internal/parseResult";
import type { parseInstant, parseZonedDateTime } from "./temporal";
import { DateTimeParsingOptions } from "./typing";

/**
 * Converts the specified string expression of date and/or time to its equivalent {@link Date} representation.
 * @returns an object equivalent to the date and time contained in `expression`.
 * @throws {@link FormatError}
 *  * the specified string expression cannot be interpreted as a valid date-time expression.
 *  * `expression` contains time zone ID, but time zone parsing is not supported for {@link Date} parsing.
 *    You need to switch to {@link parseZonedDateTime} or {@link parseInstant} instead.
 * @see {@link tryParseDate}
 */
export function parseDate(expression: string, options?: DateTimeParsingOptions): Date {
  const result = tryParseDateTimeInvariant(expression);
  if (isDateTimeParseError(result)) throw createDateTimeParseError(result);
  return parseResultToDateTime(result, options);
}

/**
 * Tries to convert the specified string expression of date and/or time to its equivalent {@link Date} representation.
 * @returns an object equivalent to the date and time contained in `expression`, or `undefined` if the conversion has failed.
 * @see {@link parseDate}
 */
export function tryParseDate(expression: string, options?: DateTimeParsingOptions): Date | undefined {
  const result = tryParseDateTimeInvariant(expression);
  if (isDateTimeParseError(result)) return undefined;
  return parseResultToDateTime(result, options);
}

function parseResultToDateTime(result: DateTimeParseResult, options?: DateTimeParsingOptions): Date {
  if (result.tzId != null) throw new FormatError("Specifying time zone ID is not supported.");
  const tzOffsetMins = result.tzOffsetMinutes ?? (options?.assumeUtc ? 0 : "local");
  // https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/Globalization/DateTimeParse.cs,63d1edb58b57f7e9
  /*
  The following table describes the behaviors of getting the default value
  when a certain year/month/day values are missing.
 
  An "X" means that the value exists.  And "--" means that value is missing.
 
  Year    Month   Day =>  ResultYear  ResultMonth     ResultDay       Note
 
  X       X       X       Parsed year Parsed month    Parsed day
  X       X       --      Parsed Year Parsed month    1               If we have year and month, assume the first day of that month.
  X       --      X       Parsed year 1               Parsed day      If the month is missing, assume first month of that year.
  X       --      --      Parsed year 1               1               If we have only the year, assume the first day of that year.
 
  --      X       X       CurrentYear Parsed month    Parsed day      If the year is missing, assume the current year.
  --      X       --      CurrentYear Parsed month    1               If we have only a month value, assume the current year and current day.
  --      --      X       CurrentYear 1               Parsed day      If we have only a day value, assume current year and first month.
  --      --      --      CurrentYear Current month   Current day     So this means that if the date string only contains time, you will get current date.
 
  */
  // Date is always UTC
  if (result.year == null || result.month == null || result.day == null) {
    const [year, month, day] = getFallbackDate(tzOffsetMins);
    if (result.year == null && result.month == null && result.day == null) {
      // Date part is missing
      result.year = year;
      result.month = month;
      result.day = day;
    } else {
      // Date part is incomplete
      result.year ??= year;
      result.month ??= 1;
      result.day ??= 1;
    }
  }
  result.hour ??= 0;
  result.minute ??= 0;
  result.second ??= 0;
  result.fraction ??= 0;

  if (result.tzOffsetMinutes == null && !options?.assumeUtc) {
    // Local TZ
    return new Date(result.year, result.month - 1, result.day, result.hour, result.minute, result.second, result.fraction * 1000);
  }

  const tzMsSinceEpoch = Date.UTC(result.year, result.month - 1, result.day, result.hour, result.minute, result.second, result.fraction * 1000);
  if (result.tzOffsetMinutes === 0 || result.tzOffsetMinutes == null && options?.assumeUtc) {
    // UTC
    return new Date(tzMsSinceEpoch);
  }

  assert(result.tzOffsetMinutes != null);
  // Convert explicit TZ time back to UTC
  const tzOffsetMs = result.tzOffsetMinutes * 60_000;
  return new Date(tzMsSinceEpoch - tzOffsetMs);
}

function getFallbackDate(tzOffsetMins: SafeInteger | "local"): [year: SafeInteger, month: SafeInteger, day: SafeInteger] {
  if (tzOffsetMins === "local") {
    // Local TZ
    const dateNow = new Date();
    return [dateNow.getFullYear(), dateNow.getMonth() + 1, dateNow.getDate()];
  }
  if (tzOffsetMins === 0) {
    // UTC
    const dateNow = new Date();
    return [dateNow.getUTCFullYear(), dateNow.getUTCMonth() + 1, dateNow.getUTCDate()];
  }
  // Explicit TZ
  const msSinceEpoch = Date.now();
  const tzOffsetMs = tzOffsetMins * 60_000;
  const offsetDateNow = new Date(msSinceEpoch + tzOffsetMs);
  return [offsetDateNow.getUTCFullYear(), offsetDateNow.getUTCMonth() + 1, offsetDateNow.getUTCDate()];
}
