/// <reference types="temporal-polyfill/global" />
import { assert } from "../../diagnostics";
import { SafeInteger } from "../../numbers";
import { tryParseDateTimeInvariant } from "./internal/invariant";
import { createDateTimeParseError, DateTimeParseResult, isDateTimeParseError } from "./internal/parseResult";
import { DateTimeParsingOptions } from "./typing";

const utcTimeZoneName = "UTC";

export function parseZonedDateTime(expression: string, options?: DateTimeParsingOptions): Temporal.ZonedDateTime {
  const result = tryParseDateTimeInvariant(expression);
  if (isDateTimeParseError(result)) throw createDateTimeParseError(result);
  return parseResultToZonedDateTime(result, options);
}

export function tryParseZonedDateTime(expression: string, options?: DateTimeParsingOptions): Temporal.ZonedDateTime | undefined {
  const result = tryParseDateTimeInvariant(expression);
  if (isDateTimeParseError(result)) return undefined;
  return parseResultToZonedDateTime(result, options);
}

function parseResultToZonedDateTime(result: DateTimeParseResult, options?: DateTimeParsingOptions): Temporal.ZonedDateTime {
  // https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/Globalization/DateTimeParse.cs,63d1edb58b57f7e9
  // See also: "./date.ts"!parseResultToDateTime
  if (result.year == null || result.month == null || result.day == null) {
    const [year, month, day] = getFallbackDate(result, options);
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

  const dtArgs: Temporal.ZonedDateTimeLike = {
    year: result.year,
    month: result.month,
    day: result.day,
    hour: result.hour,
    minute: result.minute,
    second: result.second,
    millisecond: Math.trunc(result.fraction * 1e3),
    microsecond: Math.trunc((result.fraction * 1e6) % 1000),
    nanosecond: Math.trunc((result.fraction * 1e9) % 1000),
  };

  if (result.tzOffsetMinutes == 0 || result.tzOffsetMinutes == null && options?.assumeUtc) {
    // UTC
    dtArgs.timeZone = utcTimeZoneName;
  } else if (result.tzOffsetMinutes == null && !options?.assumeUtc) {
    // Local TZ
    dtArgs.timeZone = Temporal.Now.timeZoneId();
  } else {
    // Specified TZ / TZ offset
    assert(result.tzOffsetMinutes != null);
    const h = Math.trunc(Math.abs(result.tzOffsetMinutes) / 60);
    const m = Math.abs(result.tzOffsetMinutes) % 60;
    const sign = h > 0 ? "+" : "-";
    const hpadding = h < 10 ? "0" : "";
    const mpadding = m < 10 ? "0" : "";
    dtArgs.timeZone = `${sign}${hpadding}${h}:${mpadding}${m}`;
  }
  return Temporal.ZonedDateTime.from(dtArgs);
}

function getFallbackDate(result: DateTimeParseResult, options?: DateTimeParsingOptions): [year: SafeInteger, month: SafeInteger, day: SafeInteger] {
  if (result.tzOffsetMinutes == null && !options?.assumeUtc) {
    // Local TZ
    const now = Temporal.Now.zonedDateTimeISO();
    return [now.year, now.month, now.day];
  }
  // TODO calendar
  const utcNow = Temporal.Now.zonedDateTimeISO(utcTimeZoneName);
  if (result.tzOffsetMinutes === 0 || result.tzOffsetMinutes == null && options?.assumeUtc) {
    // UTC
    return [utcNow.year, utcNow.month, utcNow.day];
  }
  assert(result.tzOffsetMinutes != null);
  // Explicit TZ
  // Manually offset the UTC time, as Temporal actually recommends to use TZ name instead of TZ offset.
  const offsetNow = utcNow.add({ minutes: result.tzOffsetMinutes });
  return [offsetNow.year, offsetNow.month, offsetNow.day];
}
