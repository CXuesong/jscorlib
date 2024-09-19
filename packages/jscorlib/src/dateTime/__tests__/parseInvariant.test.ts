import { describe, expect, it } from "vitest";
import { tryParseDateTimeInvariant } from "../parseInvariant";

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
    expect(tryParseDateTimeInvariant("5:30")).toEqual({ hour: 5, minute: 30 });
    expect(tryParseDateTimeInvariant("5:12:34")).toEqual({ hour: 5, minute: 12, second: 34 });
    expect(tryParseDateTimeInvariant("5:12:34.567890")).toEqual({ hour: 5, minute: 12, second: 34, fraction: .56789 });

    expect(tryParseDateTimeInvariant("AM 5:30")).toEqual({ hour: 5, minute: 30 });
    expect(tryParseDateTimeInvariant("5:12:34 PM ")).toEqual({ hour: 17, minute: 12, second: 34 });
    expect(tryParseDateTimeInvariant("PM 5:12:34.567890")).toEqual({ hour: 17, minute: 12, second: 34, fraction: .56789 });
  });
});
