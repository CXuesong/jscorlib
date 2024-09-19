export interface DateTimeParseResult {
  year?: number;
  month?: number;
  day?: number;

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
