import { assert } from "../../diagnostics";
import { StringTokenParser } from "../../internal/stringTokenParser";
import { asSafeInteger } from "../../numbers";
import { consumeTimeZoneOffsetMins } from "./timeZone";
import { DateParseResult, DateTimeParseFormatError, DateTimeParseResult, TimeParseResult } from "./typing";

const dateSeparators = ["-", "/"];
const timeSeparators = [":"];
const fractionSeparators = [".", ","];

export function tryParseDateTimeInvariant(expression: string): DateTimeParseResult | DateTimeParseFormatError {
  if (!expression) return { error: "format-error" };
  const parser = new StringTokenParser(expression);
  parser.consumeRegExp(/\s+/y);

  let dateResult, timeResult;
  if ((dateResult = consumeDate(parser))) {
    // DATE [+ TIME]
    parser.consumeRegExp(/\s+/y);
    timeResult = consumeTime(parser);
    parser.consumeRegExp(/\s+/y);
  } else if ((timeResult = consumeTime(parser))) {
    // TIME [+ DATE]
    parser.consumeRegExp(/\s+/y);
    if (!timeResult.tMarkPresent) {
      // If there is ISO 8601 Time marker "T" and the time is placed at the beginning,
      // we won't allow date expression placed after it.
      dateResult = consumeDate(parser);
      parser.consumeRegExp(/\s+/y);
    }
  }
  if (!dateResult && !timeResult) {
    // Failfast if we didn't parse any date/time
    checkParserEof(parser);
    return { error: "format-error" };
  }
  const tz = consumeTimeZoneOffsetMins(parser);
  if (typeof tz === "object") {
    // Invalid time zone expression
    parser.checkStateStackEmpty();
    return tz;
  }
  return checkParserEof(parser) ?? buildFullParseResult(dateResult, timeResult, tz);
}

function buildFullParseResult(
  dateResult: DateParseResult | undefined,
  timeResult: TimeParseResult | undefined,
  tzResult: number | undefined,
): DateTimeParseResult {
  assert(dateResult != null || timeResult != null);
  return {
    year: dateResult?.[0],
    month: dateResult?.[1],
    day: dateResult?.[2],

    hour: timeResult?.[0],
    minute: timeResult?.[1],
    second: timeResult?.[2],
    fraction: timeResult?.[3],

    tzOffsetMinutes: tzResult,
  };
}

function consumeDate(parser: StringTokenParser): DateParseResult | undefined {
  return consumeDateYMD(parser) ?? consumeDateMDY(parser);
}

// yyyy-MM-dd / yyyy-MM
function consumeDateYMD(parser: StringTokenParser): [year: number, month: number, day: number | undefined] | undefined {
  parser.pushState();
  let match;
  if (!(match = parser.consumeRegExp(/\d{2,4}/y))) return parser.popState(), undefined;
  const isShortYearFormat = match[0].length < 3;
  let year = asSafeInteger(match[0]);
  if (isShortYearFormat) {
    // Expand the year number
    year = year >= 50 ? (1900 + year) : (2000 + year);
  }

  parser.consumeRegExp(/\s*/y);
  if (!parser.consumeAnyString(dateSeparators)) return parser.popState(), undefined;
  parser.consumeRegExp(/\s*/y);

  if (!(match = parser.consumeRegExp(/\d\d?/y))) return parser.popState(), undefined;
  const month = asSafeInteger(match[0]);
  if (month < 1 || month > 12) return parser.popState(), undefined;

  parser.consumeRegExp(/\s*/y);
  if (!parser.consumeAnyString(dateSeparators)) {
    if (isShortYearFormat)
      return parser.popState(), undefined;
    return parser.acceptState(), [year, month, undefined];
  }
  parser.consumeRegExp(/\s*/y);

  if (!(match = parser.consumeRegExp(/\d\d?/y))) return parser.popState(), undefined;
  const day = asSafeInteger(match[0]);
  if (day < 1 || day > 31) return parser.popState(), undefined;

  return parser.acceptState(), [year, month, day];
}

// MM-dd-yyyy / MM-dd
function consumeDateMDY(parser: StringTokenParser): [year: number | undefined, month: number, day: number] | undefined {
  parser.pushState();
  let match;

  if (!(match = parser.consumeRegExp(/\d\d?/y))) return parser.popState(), undefined;
  const month = asSafeInteger(match[0]);
  if (month < 1 || month > 12) return parser.popState(), undefined;

  parser.consumeRegExp(/\s*/y);
  if (!parser.consumeAnyString(dateSeparators)) return parser.popState(), undefined;
  parser.consumeRegExp(/\s*/y);

  if (!(match = parser.consumeRegExp(/\d\d?/y))) return parser.popState(), undefined;
  const day = asSafeInteger(match[0]);
  if (day < 1 || day > 31) return parser.popState(), undefined;

  parser.consumeRegExp(/\s*/y);
  if (!parser.consumeAnyString(dateSeparators)) return parser.acceptState(), [undefined, month, day];
  parser.consumeRegExp(/\s*/y);

  if (!(match = parser.consumeRegExp(/\d{3,4}/y))) return parser.popState(), undefined;
  const year = asSafeInteger(match[0]);

  return parser.acceptState(), [year, month, day];
}

type TimeParseResultEx = TimeParseResult & { tMarkPresent?: boolean };

function consumeTime(parser: StringTokenParser): TimeParseResultEx | undefined {
  parser.pushState();

  // ISO 8601 Time marker "T" -- this also forces 24-hour notation
  const tMarkPresent = parser.consumeRegExp(/T/yi) != null;
  let match;
  let ampmDesignator = tMarkPresent ? undefined : consumeAMPMDesignator(parser);
  let hour;
  let minute;
  let second;
  let fraction;

  parser.consumeRegExp(/\s*/y);

  if (!(match = parser.consumeRegExp(/\d\d?/y))) return parser.popState(), undefined;
  hour = asSafeInteger(match[0]);
  if (hour > 23 || hour > 12 && ampmDesignator === "am") return parser.popState(), undefined;
  // 12-hour notation -> 24-hour notation
  if (hour < 12 && ampmDesignator === "pm") hour = (hour + 12) % 24;

  parser.consumeRegExp(/\s*/y);
  if (!parser.consumeAnyString(timeSeparators)) return parser.popState(), undefined;
  parser.consumeRegExp(/\s*/y);

  if (!(match = parser.consumeRegExp(/\d\d?/y))) return parser.popState(), undefined;
  // eslint-disable-next-line prefer-const
  minute = asSafeInteger(match[0]);
  if (minute > 59) return parser.popState(), undefined;

  parser.consumeRegExp(/\s*/y);
  if (parser.consumeAnyString(timeSeparators)) {
    parser.consumeRegExp(/\s*/y);

    if (!(match = parser.consumeRegExp(/\d\d?/y))) return parser.popState(), undefined;
    second = asSafeInteger(match[0]);
    if (second > 59) return parser.popState(), undefined;

    parser.consumeRegExp(/\s*/y);
    if (parser.consumeAnyString(fractionSeparators)) {
      parser.consumeRegExp(/\s*/y);
      // "1.23" is valid
      if ((match = parser.consumeRegExp(/\d*/y))) {
        fraction = Number.parseFloat("." + match[0]);
        assert(fraction <= 1);
      }
    }
  }

  if (!tMarkPresent && !ampmDesignator) {
    // postfix
    ampmDesignator = consumeAMPMDesignator(parser);
    if (hour > 12 && ampmDesignator === "am") return parser.popState(), undefined;
    // 12-hour notation -> 24-hour notation
    if (hour < 12 && ampmDesignator === "pm") hour = (hour + 12) % 24;
  }

  const result: TimeParseResultEx = [hour, minute, second, fraction];
  result.tMarkPresent = tMarkPresent;
  return parser.acceptState(), result;
}

function consumeAMPMDesignator(parser: StringTokenParser): "am" | "pm" | undefined {
  if (parser.consumeRegExp(/AM/yi)) return "am";
  if (parser.consumeRegExp(/PM/yi)) return "pm";
  return undefined;
}

function checkParserEof(parser: StringTokenParser): DateTimeParseFormatError | undefined {
  parser.checkStateStackEmpty();
  if (parser.isEof) return undefined;
  return {
    error: "format-error",
    message: `Extraneous content detected at position ${parser.position}.`,
  };
}
