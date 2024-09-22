/// <reference types="temporal-polyfill/global" />
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

export function parseInstant(expression: string, options?: DateTimeParsingOptions): Temporal.Instant {
  const result = tryParseDateTimeInvariant(expression);
  if (isDateTimeParseError(result)) throw createDateTimeParseError(result);
  return parseResultToInstant(result, options);
}

export function tryParseInstant(expression: string, options?: DateTimeParsingOptions): Temporal.Instant | undefined {
  const result = tryParseDateTimeInvariant(expression);
  if (isDateTimeParseError(result)) return undefined;
  return parseResultToInstant(result, options);
}

function parseResultToZonedDateTime(result: DateTimeParseResult, options?: DateTimeParsingOptions): Temporal.ZonedDateTime {
  const [dtLike, tzOffsetMins] = parseResultToDateTimeLikeAndOffset(result, options);
  const zdtLike: Temporal.ZonedDateTimeLike = dtLike;
  if (tzOffsetMins === 0) {
    // UTC
    zdtLike.timeZone = utcTimeZoneName;
  } else if (tzOffsetMins === "local") {
    // Local TZ
    zdtLike.timeZone = Temporal.Now.timeZoneId();
  } else {
    // Specified TZ / TZ offset
    const h = Math.trunc(Math.abs(tzOffsetMins) / 60);
    const m = Math.abs(tzOffsetMins) % 60;
    const sign = h > 0 ? "+" : "-";
    const hpadding = h < 10 ? "0" : "";
    const mpadding = m < 10 ? "0" : "";
    zdtLike.timeZone = `${sign}${hpadding}${h}:${mpadding}${m}`;
  }
  return Temporal.ZonedDateTime.from(zdtLike);
}

function parseResultToInstant(result: DateTimeParseResult, options?: DateTimeParsingOptions): Temporal.Instant {
  const [dtLike, tzOffsetMins] = parseResultToDateTimeLikeAndOffset(result, options);
  const zdtLike: Temporal.ZonedDateTimeLike = dtLike;
  if (tzOffsetMins === 0) {
    // UTC
    zdtLike.timeZone = utcTimeZoneName;
    return Temporal.ZonedDateTime.from(zdtLike).toInstant();
  }
  if (tzOffsetMins === "local") {
    // Local TZ
    zdtLike.timeZone = Temporal.Now.timeZoneId();
    return Temporal.ZonedDateTime.from(zdtLike).toInstant();
  }
  // Specified TZ / TZ offset -- Offset back to UTC
  zdtLike.timeZone = utcTimeZoneName;
  return Temporal.ZonedDateTime.from(zdtLike).toInstant().add({ minutes: -tzOffsetMins });
}

function parseResultToDateTimeLikeAndOffset(
  result: DateTimeParseResult,
  options?: DateTimeParsingOptions,
): [dtLike: Temporal.PlainDateTimeLike, tzOffsetMins: SafeInteger | "local"] {
  const tzOffsetMins = result.tzOffsetMinutes ?? (options?.assumeUtc ? 0 : "local");
  // https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/Globalization/DateTimeParse.cs,63d1edb58b57f7e9
  // See also: "./date.ts"!parseResultToDateTime
  if (result.year == null || result.month == null || result.day == null) {
    const [year, month, day] = getFallbackDate(tzOffsetMins);
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

  const dtLike: Temporal.PlainDateTimeLike = {
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

  return [dtLike, tzOffsetMins];
}

function getFallbackDate(tzOffsetMins: SafeInteger | "local"): [year: SafeInteger, month: SafeInteger, day: SafeInteger] {
  if (tzOffsetMins === "local") {
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
  // Explicit TZ
  // Manually offset the UTC time, as Temporal actually recommends to use TZ name instead of TZ offset.
  const offsetNow = utcNow.add({ minutes: tzOffsetMins });
  return [offsetNow.year, offsetNow.month, offsetNow.day];
}
