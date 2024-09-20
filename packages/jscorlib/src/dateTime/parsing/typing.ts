export interface DateTimeParseResult {
  year?: number;
  month?: number;
  day?: number;
  /** 0: Sunday */
  dayOfWeek?: number;

  hour?: number;
  minute?: number;
  second?: number;
  // 0~1; avoid precision loss
  fraction?: number;

  // tzName?: string;
  tzOffsetMinutes?: number;
}

export interface DateTimeParseFormatError {
  error: "format-error" | "tz-format-error";
  message?: string;
}

// Internal shorthands
export type DateParseResult = [year?: number, month?: number, day?: number, dayOfWeek?: number];
export type TimeParseResult = [hour: number, minute?: number, second?: number, fraction?: number];
