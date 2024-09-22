import { describe, expect, it } from "vitest";
import { parseDate } from "../date";

describe("parseDate", () => {
  it("date / time", () => {
    const dateNow = new Date();
    expect(parseDate("1993-01-02")).toEqual(new Date(1993, 0, 2));
    expect(parseDate("5:12:34")).toEqual(new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), 5, 12, 34));
    // fraction will be truncated
    expect(parseDate("5:12:34.567890Z")).toEqual(new Date(Date.UTC(dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getUTCDate(), 5, 12, 34, 567)));
    expect(parseDate("2024-9-10 PM 5:12:34.567890Z")).toEqual(new Date("2024-09-10T17:12:34.567Z"));
    expect(parseDate("2024-9-10 PM 5:12:34Z")).toEqual(new Date("2024-09-10T17:12:34.000Z"));
    // ISO 8601
    expect(parseDate("2024-09-19T14:10:52+2:30")).toEqual(new Date("2024-09-19T11:40:52.000Z"));
    // RFC 1123
    expect(parseDate("Thu, 01 Jan 1970 01:23:45 GMT")).toEqual(new Date("1970-01-01T01:23:45.000Z"));
  });
});
