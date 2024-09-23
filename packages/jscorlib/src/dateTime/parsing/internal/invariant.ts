import { InvariantLocaleIgnoreCaseStringEqualityComparer } from "../../../collections/equalityComparison";
import { assert } from "../../../diagnostics";
import { StringTokenParser } from "../../../internal/stringTokenParser";
import { asSafeInteger, SafeInteger } from "../../../numbers";
import { consumeTimeZoneId, consumeTimeZoneOffsetMins } from "./timeZone";
import { DateParseResult, DateTimeParseFormatError, DateTimeParseResult, TimeParseResult } from "./parseResult";

const dateSeparators = ["-", "/", ","];   // "," is used in RFC1123
const timeSeparators = [":"];
const fractionSeparators = [".", ","];

// TODO https://stackoverflow.com/questions/47232534/how-to-get-a-list-of-month-names-in-javascript-using-intl
const monthNamesLong = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const monthNamesShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const dayNamesLong = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const dayNamesShort = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export function tryParseDateTimeInvariant(expression: string): DateTimeParseResult | DateTimeParseFormatError {
  if (!expression) return { error: "format-error" };
  const parser = new StringTokenParser(expression);
  parser.consumeRegExp(/\s+/y);

  let dateResult, timeResult;
  if ((dateResult = consumeDateWithDayOfWeek(parser))) {
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
      dateResult = consumeDateWithDayOfWeek(parser);
      parser.consumeRegExp(/\s+/y);
    }
  }
  if (!dateResult && !timeResult) {
    // Failfast if we didn't parse any date/time
    checkParserEof(parser);
    return { error: "format-error" };
  }
  const tzOffsetMins = consumeTimeZoneOffsetMins(parser);
  if (typeof tzOffsetMins === "object") {
    // Invalid time zone expression
    parser.checkStateStackEmpty();
    return tzOffsetMins;
  }
  parser.consumeRegExp(/\s+/y);
  const tzId = consumeTimeZoneId(parser);
  parser.consumeRegExp(/\s+/y);
  return checkParserEof(parser) ?? buildFullParseResult(dateResult, timeResult, tzOffsetMins, tzId);
}

function buildFullParseResult(
  dateResult: DateParseResult | undefined,
  timeResult: TimeParseResult | undefined,
  tzOffsetMins: SafeInteger | undefined,
  tzId: string | undefined,
): DateTimeParseResult {
  assert(dateResult != null || timeResult != null);
  return {
    year: dateResult?.[0],
    month: dateResult?.[1],
    day: dateResult?.[2],
    dayOfWeek: dateResult?.[3],

    hour: timeResult?.[0],
    minute: timeResult?.[1],
    second: timeResult?.[2],
    fraction: timeResult?.[3],

    tzOffsetMinutes: tzOffsetMins,
    tzId,
  };
}

function consumeDateWithDayOfWeek(parser: StringTokenParser): DateParseResult | undefined {
  // Optional day of week
  let dayOfWeek;

  // prefix
  if ((dayOfWeek = consumeDayName(parser)) != null) {
    // We allow week name to be placed immediately next to other tokens
    parser.consumeRegExp(/\s+/y);
    if (parser.consumeAnyString(dateSeparators)) parser.consumeRegExp(/\s+/y);
  }

  const date = consumeDateAny(parser);
  if (!date) return undefined;

  // suffix
  if (dayOfWeek == null) {
    parser.pushState();

    parser.consumeRegExp(/\s+/y);
    if (parser.consumeAnyString(dateSeparators)) parser.consumeRegExp(/\s+/y);

    if ((dayOfWeek = consumeDayName(parser)) != null) {
      parser.acceptState();
    } else {
      parser.popState();
    }
  }

  date[3] = dayOfWeek;
  return date;
}

function consumeDateAny(parser: StringTokenParser): DateParseResult | undefined {
  return consumeDateYMD(parser) ?? consumeDateMDY(parser) ?? consumeDateDMY(parser);
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

  // Note that we allow delimit parts only by spaces
  // RFC1123: Thu, 10 Apr 2008 13:30:00 GMT
  let anySpace = parser.consumeRegExp(/\s+/y);
  if (!parser.consumeAnyString(dateSeparators) && !anySpace) return parser.popState(), undefined;
  parser.consumeRegExp(/\s+/y);

  const month = consumeMonthNumeric(parser) ?? consumeMonthName(parser);
  if (month == null) return parser.popState(), undefined;

  anySpace = parser.consumeRegExp(/\s+/y);
  if (!parser.consumeAnyString(dateSeparators) && !anySpace) {
    if (isShortYearFormat)
      // We don't allow "93-10"
      return parser.popState(), undefined;
    // We allow "1993-10" or "0093-10"
    return parser.acceptState(), [year, month, undefined];
  }
  parser.consumeRegExp(/\s+/y);

  const day = consumeDay(parser);
  if (day == null) return parser.popState(), undefined;

  return parser.acceptState(), [year, month, day];
}

// MM-dd-yyyy / MM-dd
function consumeDateMDY(parser: StringTokenParser): [year: number | undefined, month: number, day: number] | undefined {
  parser.pushState();
  let match;

  const month = consumeMonthNumeric(parser) ?? consumeMonthName(parser);
  if (month == null) return parser.popState(), undefined;

  // Note that we allow delimit parts only by spaces
  // RFC1123: Thu, 10 Apr 2008 13:30:00 GMT
  let anySpace = parser.consumeRegExp(/\s+/y);
  if (!parser.consumeAnyString(dateSeparators) && !anySpace) return parser.popState(), undefined;
  parser.consumeRegExp(/\s+/y);

  const day = consumeDay(parser);
  if (day == null) return parser.popState(), undefined;

  anySpace = parser.consumeRegExp(/\s+/y);
  if (!parser.consumeAnyString(dateSeparators) && !anySpace) return parser.acceptState(), [undefined, month, day];
  parser.consumeRegExp(/\s+/y);

  if (!(match = parser.consumeRegExp(/\d{3,4}/y))) return parser.popState(), undefined;
  const year = asSafeInteger(match[0]);

  return parser.acceptState(), [year, month, day];
}

// For RFC1123
// dd-MMM-yyyy / MMM-yyyy; MMM -> long/short month name
function consumeDateDMY(parser: StringTokenParser): [year: number, month: number, day?: number] | undefined {
  parser.pushState();
  let match;

  // Optional day number
  const day = consumeDay(parser);
  if (day == null) {
    // `consumeDay` might have mutated parser state. Reset it.
    parser.popState();
    parser.pushState();
  } else {
    // RFC1123 uses space as delimiter: Thu, 10 Apr 2008 13:30:00 GMT
    // We allow month name to be placed immediately next to other tokens
    parser.consumeRegExp(/\s+/y);
    if (parser.consumeAnyString(dateSeparators)) parser.consumeRegExp(/\s+/y);
  }

  // Then month name
  const month = consumeMonthName(parser);
  if (month == null) return parser.popState(), undefined;

  parser.consumeRegExp(/\s+/y);
  if (parser.consumeAnyString(dateSeparators)) parser.consumeRegExp(/\s+/y);

  // year number should have at least 3 digits
  if (!(match = parser.consumeRegExp(/\d{3,4}/y))) return parser.popState(), undefined;
  const year = Number.parseInt(match[0]);

  return parser.acceptState(), [year, month, day];
}

function consumeMonthNumeric(parser: StringTokenParser): number | undefined {
  // We need to aggressively take every token.
  parser.pushState();
  let match;

  // Numeric
  if ((match = parser.consumeRegExp(/\d+/y))) {
    const month = Number.parseInt(match[0]);
    if (Number.isNaN(month) || month < 1 || month > 12) return parser.popState(), undefined;
    return parser.acceptState(), month;
  }

  return parser.popState(), undefined;
}

function consumeMonthName(parser: StringTokenParser): number | undefined {
  // EN
  for (let i = 0; i < 12; i++) {
    if (parser.consumeString(monthNamesLong[i], InvariantLocaleIgnoreCaseStringEqualityComparer.instance)) return i + 1;
  }

  for (let i = 0; i < 12; i++) {
    if (parser.consumeString(monthNamesShort[i], InvariantLocaleIgnoreCaseStringEqualityComparer.instance)) return i + 1;
  }

  return undefined;
}

/** [Inline parser state] */
function consumeDay(parser: StringTokenParser): number | undefined {
  // We need to aggressively take every digit and then validate its range,
  // so as to prevent stop consuming in the middle of a number.
  // 10-12-05 --> 2010-12-05
  // 10-12-2005 --> 2005-10-12
  const match = parser.consumeRegExp(/\d+/y);
  if (!match) return undefined;
  const day = Number.parseInt(match[0]);
  if (Number.isNaN(day) || day < 1 || day > 31) return undefined;
  return day;
}

function consumeDayName(parser: StringTokenParser): number | undefined {
  // EN
  for (let i = 0; i < 7; i++) {
    if (parser.consumeString(dayNamesLong[i], InvariantLocaleIgnoreCaseStringEqualityComparer.instance)) return i;
  }

  for (let i = 0; i < 7; i++) {
    if (parser.consumeString(dayNamesShort[i], InvariantLocaleIgnoreCaseStringEqualityComparer.instance)) return i;
  }

  return undefined;
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

  parser.consumeRegExp(/\s+/y);

  if (!(match = parser.consumeRegExp(/\d\d?/y))) return parser.popState(), undefined;
  hour = asSafeInteger(match[0]);
  if (hour > 23 || hour > 12 && ampmDesignator === "am") return parser.popState(), undefined;
  // 12-hour notation -> 24-hour notation
  if (hour < 12 && ampmDesignator === "pm") hour = (hour + 12) % 24;

  parser.consumeRegExp(/\s+/y);
  if (!parser.consumeAnyString(timeSeparators)) return parser.popState(), undefined;
  parser.consumeRegExp(/\s+/y);

  if (!(match = parser.consumeRegExp(/\d\d?/y))) return parser.popState(), undefined;
  // eslint-disable-next-line prefer-const
  minute = asSafeInteger(match[0]);
  if (minute > 59) return parser.popState(), undefined;

  parser.consumeRegExp(/\s+/y);
  if (parser.consumeAnyString(timeSeparators)) {
    parser.consumeRegExp(/\s+/y);

    if (!(match = parser.consumeRegExp(/\d\d?/y))) return parser.popState(), undefined;
    second = asSafeInteger(match[0]);
    if (second > 59) return parser.popState(), undefined;

    parser.consumeRegExp(/\s+/y);
    if (parser.consumeAnyString(fractionSeparators)) {
      parser.consumeRegExp(/\s+/y);
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
