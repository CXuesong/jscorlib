import { FormatError } from "../../errors";
import { SafeInteger } from "../../numbers";

export interface DateTimeParseResult {
  year?: SafeInteger;
  month?: SafeInteger;
  day?: SafeInteger;
  /** 0: Sunday */
  dayOfWeek?: SafeInteger;

  hour?: SafeInteger;
  minute?: SafeInteger;
  second?: SafeInteger;
  // 0~1; avoid precision loss
  fraction?: number;

  // tzName?: string;
  tzOffsetMinutes?: SafeInteger;
}

export interface DateTimeParseFormatError {
  error: "format-error" | "tz-format-error";
  message?: string;
}

// Internal shorthands
export type DateParseResult = [year?: number, month?: number, day?: number, dayOfWeek?: number];
export type TimeParseResult = [hour: number, minute?: number, second?: number, fraction?: number];

export function createDateTimeParseError(error: DateTimeParseFormatError): Error {
  return new FormatError(error.message ?? error.error);
}

export function isDateTimeParseError(result: DateTimeParseResult | DateTimeParseFormatError): result is DateTimeParseFormatError {
  return "error" in result;
}

export interface DateTimeParsingOptions {
  assumeUtc?: boolean;
}
