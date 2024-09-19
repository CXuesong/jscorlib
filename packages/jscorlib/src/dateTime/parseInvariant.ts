import { assert } from "../diagnostics";
import { StringTokenParser } from "../internal/stringTokenParser";
import { asSafeInteger } from "../numbers";
import type { DateTimeParseFormatError, DateTimeParseResult } from "./parse";

const dateSeparators = ["-", "/"];
const timeSeparators = [":"];
const fractionSeparators = [".", ","];

export function tryParseDateTimeInvariant(expression: string): DateTimeParseResult | DateTimeParseFormatError {
  if (!expression) return { error: "format-error", message: "Expression is empty." };
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
    dateResult = consumeDate(parser);
    parser.consumeRegExp(/\s+/y);
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

type DateParseResult = [year?: number, month?: number, day?: number];
type TimeParseResult = [hour: number, minute?: number, second?: number, fraction?: number];

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

function consumeTime(parser: StringTokenParser): TimeParseResult | undefined {
  parser.pushState();

  let match;
  let ampmDesignator = consumeAMPMDesignator(parser);
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

  if (!ampmDesignator) {
    // postfix
    ampmDesignator = consumeAMPMDesignator(parser);
    if (hour > 12 && ampmDesignator === "am") return parser.popState(), undefined;
    // 12-hour notation -> 24-hour notation
    if (hour < 12 && ampmDesignator === "pm") hour = (hour + 12) % 24;
  }

  // TODO TZ
  return parser.acceptState(), [hour, minute, second, fraction];
}

function consumeAMPMDesignator(parser: StringTokenParser): "am" | "pm" | undefined {
  if (parser.consumeRegExp(/AM/yi)) return "am";
  if (parser.consumeRegExp(/PM/yi)) return "pm";
  return undefined;
}

function consumeTimeZoneOffsetMins(parser: StringTokenParser): number | DateTimeParseFormatError | undefined {
  parser.pushState();

  let match;

  // UTC
  if (parser.consumeRegExp(/Z|GMT/yi)) return parser.acceptState(), 0;

  if (!(match = parser.consumeRegExp(/[+-]/y))) return parser.popState(), undefined;

  const factor = match[0] === "+" ? 1 : -1;
  parser.consumeRegExp(/\s*/y);

  // +800 / +0800
  if ((match = parser.consumeRegExp(/\d{3,4}/y))) {
    const h = Number.parseInt(match[0].length === 3 ? match[0].substring(0, 1) : match[0].substring(0, 2));
    const m = Number.parseInt(match[0].length === 3 ? match[0].substring(1) : match[0].substring(2));
    return parser.acceptState(), buildOffset(h, m);
  }

  // +8 / +8:00
  if ((match = parser.consumeRegExp(/(?<H>\d\d?)?(:?(?<M>\d+))?/y))) {
    // hh part should contain 2 digits at most.
    // 3 digits will be interpreted as `hmm` and should have been handled above.
    const h = Number.parseInt(match.groups!.H);
    const m = match.groups!.M ? Number.parseInt(match.groups!.M) : 0;
    return parser.acceptState(), buildOffset(h, m);
  }

  return parser.popState(), undefined;

  function buildOffset(h: number, m: number): number | DateTimeParseFormatError {
    if (m > 59) return { error: "tz-format-error", message: "Invalid time zone offset expression." };
    const offset = h * 60 + m;
    if (offset > 14 * 60) return { error: "tz-format-error", message: "Time zone offset should be within 14 hours." };
    return factor * offset;
  }
}

function checkParserEof(parser: StringTokenParser): DateTimeParseFormatError | undefined {
  parser.checkStateStackEmpty();
  if (parser.isEof) return undefined;
  return {
    error: "format-error",
    message: `Extraneous content detected at position ${parser.position}.`,
  };
}
