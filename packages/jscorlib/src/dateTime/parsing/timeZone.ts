import { StringTokenParser } from "../../internal/stringTokenParser";
import { DateTimeParseFormatError } from "./typing";

export function consumeTimeZoneOffsetMins(parser: StringTokenParser): number | DateTimeParseFormatError | undefined {
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
