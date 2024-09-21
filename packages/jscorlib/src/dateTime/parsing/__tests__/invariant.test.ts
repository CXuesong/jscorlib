import { describe, expect, it } from "vitest";
import { tryParseDateTimeInvariant } from "../internal/invariant";

describe("tryParseDateTimeInvariant", () => {
  it("date", () => {
    expect(tryParseDateTimeInvariant("1993-01-02")).toEqual({ year: 1993, month: 1, day: 2 });
    expect(tryParseDateTimeInvariant("  1993-02-03")).toEqual({ year: 1993, month: 2, day: 3 });
    expect(tryParseDateTimeInvariant("1993 -02")).toEqual({ year: 1993, month: 2, day: undefined });
    expect(tryParseDateTimeInvariant("93-3-4")).toEqual({ year: 1993, month: 3, day: 4 });
    expect(tryParseDateTimeInvariant("03-3-4")).toEqual({ year: 2003, month: 3, day: 4 });
    expect(tryParseDateTimeInvariant("03-4")).toEqual({ year: undefined, month: 3, day: 4 });

    expect(tryParseDateTimeInvariant("1-2-1993")).toEqual({ year: 1993, month: 1, day: 2 });
    expect(tryParseDateTimeInvariant("1-2")).toEqual({ year: undefined, month: 1, day: 2 });

    expect(tryParseDateTimeInvariant("2003-February-1")).toEqual({ year: 2003, month: 2, day: 1 });
    expect(tryParseDateTimeInvariant("2003-APR-1")).toEqual({ year: 2003, month: 4, day: 1 });
  });

  it("time", () => {
    expect(tryParseDateTimeInvariant("5:30")).toEqual({ hour: 5, minute: 30 });
    expect(tryParseDateTimeInvariant("5:12:34")).toEqual({ hour: 5, minute: 12, second: 34 });
    expect(tryParseDateTimeInvariant("5:12:34.567890")).toEqual({ hour: 5, minute: 12, second: 34, fraction: .56789 });

    expect(tryParseDateTimeInvariant("AM 5:30")).toEqual({ hour: 5, minute: 30 });
    expect(tryParseDateTimeInvariant("5:12:34 PM ")).toEqual({ hour: 17, minute: 12, second: 34 });
    expect(tryParseDateTimeInvariant("PM 5:12:34.567890")).toEqual({ hour: 17, minute: 12, second: 34, fraction: .56789 });
  });

  it("date/time", () => {
    expect(tryParseDateTimeInvariant("2024-9-10 PM 5:12:34.567890")).toEqual({
      year: 2024, month: 9, day: 10,
      hour: 17, minute: 12, second: 34, fraction: 0.56789,
    });
    expect(tryParseDateTimeInvariant("2024-9-10 17:12:34.567890")).toEqual({
      year: 2024, month: 9, day: 10,
      hour: 17, minute: 12, second: 34, fraction: 0.56789,
    });
  });

  it("time zones", () => {
    expect(tryParseDateTimeInvariant("2024-9-10 PM 5:12:34Z")).toEqual({
      year: 2024, month: 9, day: 10,
      hour: 17, minute: 12, second: 34,
      tzOffsetMinutes: 0,
    });
    expect(tryParseDateTimeInvariant("2024-9-10 PM 5:12:34 GMT")).toEqual({
      year: 2024, month: 9, day: 10,
      hour: 17, minute: 12, second: 34,
      tzOffsetMinutes: 0,
    });
    expect(tryParseDateTimeInvariant("2024-9-10 5:12:34 PM+8:30")).toEqual({
      year: 2024, month: 9, day: 10,
      hour: 17, minute: 12, second: 34,
      tzOffsetMinutes: 8 * 60 + 30,
    });
    expect(tryParseDateTimeInvariant("2024-9-10 17:12:34 -11:00")).toEqual({
      year: 2024, month: 9, day: 10,
      hour: 17, minute: 12, second: 34,
      tzOffsetMinutes: -11 * 60,
    });
    expect(tryParseDateTimeInvariant("5:12:34 PM+8")).toEqual({
      hour: 17, minute: 12, second: 34,
      tzOffsetMinutes: 8 * 60,
    });
    expect(tryParseDateTimeInvariant("5:12:34 PM+0800")).toEqual({
      hour: 17, minute: 12, second: 34,
      tzOffsetMinutes: 8 * 60,
    });
    expect(tryParseDateTimeInvariant("5:12:34 PM-0830")).toEqual({
      hour: 17, minute: 12, second: 34,
      tzOffsetMinutes: -8 * 60 - 30,
    });
  });

  it("ISO 8601", () => {
    expect(tryParseDateTimeInvariant("T14:01:52Z")).toEqual({
      hour: 14, minute: 1, second: 52,
      tzOffsetMinutes: 0,
    });
    expect(tryParseDateTimeInvariant("2024-09-19T14:10:52Z")).toEqual({
      year: 2024, month: 9, day: 19,
      hour: 14, minute: 10, second: 52,
      tzOffsetMinutes: 0,
    });
    expect(tryParseDateTimeInvariant("2024-09-19T14:10:52+2:30")).toEqual({
      year: 2024, month: 9, day: 19,
      hour: 14, minute: 10, second: 52,
      tzOffsetMinutes: 2 * 60 + 30,
    });
  });

  it("RFC 1123", () => {
    expect(tryParseDateTimeInvariant("Thu, 01 Jan 1970 01:23:45 GMT")).toEqual({
      year: 1970, month: 1, day: 1, dayOfWeek: 4,
      hour: 1, minute: 23, second: 45,
      tzOffsetMinutes: 0,
    });
    // This is not standard, but we still support parsing it.
    expect(tryParseDateTimeInvariant("Thu 1 Jan 2024 1:23:45 GMT")).toEqual({
      year: 2024, month: 1, day: 1, dayOfWeek: 4,
      hour: 1, minute: 23, second: 45,
      tzOffsetMinutes: 0,
    });
  });
});
