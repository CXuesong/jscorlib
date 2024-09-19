export interface DateTimeParseResult {
  year?: number;
  month?: number;
  day?: number;

  hour?: number;
  minute?: number;
  second?: number;
  // 0~1; avoid precision loss
  fraction?: number;

  tzName?: string;
  tzOffsetNs?: number;
}

export interface DateTimeParseFormatError {
  error: "format-error";
  message?: string;
}
