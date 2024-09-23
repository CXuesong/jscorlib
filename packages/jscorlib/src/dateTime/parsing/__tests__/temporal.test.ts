import { describe, expect, it } from "vitest";
import { parseInstant, parseZonedDateTime, tryParseInstant, tryParseZonedDateTime } from "../temporal";
import { FormatError } from "../../../errors";

describe("parseZonedDateTime", () => {
  it("date / time", () => {
    const localNow = Temporal.Now.zonedDateTimeISO();
    const utcNow = localNow.withTimeZone("UTC");
    const localTZ = Temporal.Now.timeZoneId();
    expect(parseZonedDateTime("1993-01-02")).toEqual(Temporal.ZonedDateTime.from({ year: 1993, month: 1, day: 2, timeZone: localTZ }));
    expect(parseZonedDateTime("5:12:34")).toEqual(localNow.withPlainTime("05:12:34"));
    // fraction beyond ns (1e-9) will be truncated
    expect(parseZonedDateTime("5:12:34.567890Z")).toEqual(utcNow.withPlainTime("05:12:34.567890"));
    expect(parseZonedDateTime("2024-9-10 PM 5:12:34.1234567891Z")).toEqual(Temporal.ZonedDateTime.from("2024-09-10T17:12:34.123456789[UTC]"));
    expect(parseZonedDateTime("2024-9-10 PM 5:12:34Z")).toEqual(Temporal.ZonedDateTime.from("2024-09-10T17:12:34.000[UTC]"));
    // ISO 8601
    expect(parseZonedDateTime("2024-09-19T14:10:52+2:30")).toEqual(Temporal.ZonedDateTime.from("2024-09-19T14:10:52.000[+02:30]"));
    // RFC 1123
    expect(parseZonedDateTime("Thu, 01 Jan 1970 01:23:45 GMT")).toEqual(Temporal.ZonedDateTime.from("1970-01-01T01:23:45.000[UTC]"));
  });

  it("with explicit timezone", () => {
    expect(parseZonedDateTime("2024-09-19 14:10:52 [Asia/Shanghai]")).toEqual(Temporal.ZonedDateTime.from("2024-09-19T14:10:52.000[Asia/Shanghai]"));
    expect(parseZonedDateTime("2024-09-19 14:10:52 +8:00 [Asia/Shanghai]")).toEqual(Temporal.ZonedDateTime.from("2024-09-19T14:10:52.000[Asia/Shanghai]"));
    // TZ offset / TZ ID does not match
    expect(() => parseZonedDateTime("2024-09-19 14:10:52 +2:30 [Asia/Shanghai]")).throws(FormatError);
    expect(tryParseZonedDateTime("2024-09-19 14:10:52 +2:30 [Asia/Shanghai]")).toEqual(undefined);
  });
});

describe("parseInstant", () => {
  it("date / time", () => {
    const localNow = Temporal.Now.zonedDateTimeISO();
    const utcNow = localNow.withTimeZone("UTC");
    const localTZ = Temporal.Now.timeZoneId();
    expect(parseInstant("1993-01-02")).toEqual(Temporal.ZonedDateTime.from({ year: 1993, month: 1, day: 2, timeZone: localTZ }));
    expect(parseInstant("5:12:34")).toEqual(localNow.withPlainTime("05:12:34"));
    // fraction beyond ns (1e-9) will be truncated
    expect(parseInstant("5:12:34.567890Z")).toEqual(utcNow.withPlainTime("05:12:34.567890"));
    expect(parseInstant("2024-9-10 PM 5:12:34.1234567891Z")).toEqual(Temporal.Instant.from("2024-09-10T17:12:34.123456789Z"));
    expect(parseInstant("2024-9-10 PM 5:12:34Z")).toEqual(Temporal.Instant.from("2024-09-10T17:12:34.000Z"));
    // ISO 8601
    expect(parseInstant("2024-09-19T14:10:52+2:30")).toEqual(Temporal.Instant.from("2024-09-19T11:40:52.000Z"));
    // RFC 1123
    expect(parseInstant("Thu, 01 Jan 1970 01:23:45 GMT")).toEqual(Temporal.Instant.from("1970-01-01T01:23:45.000Z"));
  });

  it("with explicit timezone", () => {
    expect(parseInstant("2024-09-19 14:10:52 [Asia/Shanghai]")).toEqual(Temporal.Instant.from("2024-09-19T06:10:52Z"));
    expect(parseInstant("2024-09-19 14:10:52 +8:00 [Asia/Shanghai]")).toEqual(Temporal.Instant.from("2024-09-19T06:10:52Z"));
    expect(() => parseInstant("2024-09-19 14:10:52 +2:30 [Asia/Shanghai]")).throws(FormatError);
    expect(tryParseInstant("2024-09-19 14:10:52 +2:30 [Asia/Shanghai]")).toEqual(undefined);
  });
});

function zonedDateTimeEquals(a: Temporal.ZonedDateTime, b: Temporal.ZonedDateTime): boolean | undefined {
  if (a && b && typeof a.equals === "function" && typeof b.equals === "function") return a.equals(b);
  return undefined;
}

expect.addEqualityTesters([zonedDateTimeEquals]);
