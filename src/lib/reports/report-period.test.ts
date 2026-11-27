import { describe, expect, test } from "bun:test";

import { periodQuery, presetRange, readPeriodFilter } from "@/lib/reports/report-period";

// Friday, November 27, 2026 (a local date, as the person's calendar).
const friday = new Date(2026, 10, 27, 15, 30);

describe("presetRange", () => {
  test("this year to date, the default, runs from January 1 to today", () => {
    expect(presetRange("this_year_to_date", friday)).toEqual({ from: "2026-01-01", to: "2026-11-27" });
  });

  test("weeks start on Monday, also when today is Sunday", () => {
    expect(presetRange("this_week", friday)).toEqual({ from: "2026-11-23", to: "2026-11-27" });
    expect(presetRange("last_week", friday)).toEqual({ from: "2026-11-16", to: "2026-11-22" });
    const sunday = new Date(2026, 10, 29);
    expect(presetRange("this_week", sunday)).toEqual({ from: "2026-11-23", to: "2026-11-29" });
    const monday = new Date(2026, 10, 23);
    expect(presetRange("last_week", monday)).toEqual({ from: "2026-11-16", to: "2026-11-22" });
  });

  test("months, quarters and years end on their last day", () => {
    expect(presetRange("this_month", friday)).toEqual({ from: "2026-11-01", to: "2026-11-30" });
    expect(presetRange("last_month", friday)).toEqual({ from: "2026-10-01", to: "2026-10-31" });
    expect(presetRange("this_quarter", friday)).toEqual({ from: "2026-10-01", to: "2026-12-31" });
    expect(presetRange("last_quarter", friday)).toEqual({ from: "2026-07-01", to: "2026-09-30" });
    expect(presetRange("this_year", friday)).toEqual({ from: "2026-01-01", to: "2026-12-31" });
    expect(presetRange("last_year", friday)).toEqual({ from: "2025-01-01", to: "2025-12-31" });
  });

  test("edges: the first quarter's last quarter is last year's fourth, and February knows leap years", () => {
    const february = new Date(2028, 1, 10);
    expect(presetRange("last_quarter", february)).toEqual({ from: "2027-10-01", to: "2027-12-31" });
    expect(presetRange("this_month", february)).toEqual({ from: "2028-02-01", to: "2028-02-29" });
    expect(presetRange("last_month", new Date(2026, 2, 31))).toEqual({ from: "2026-02-01", to: "2026-02-28" });
    expect(presetRange("yesterday", new Date(2026, 0, 1))).toEqual({ from: "2025-12-31", to: "2025-12-31" });
  });

  test("all dates is open at both ends", () => {
    expect(presetRange("all_dates", friday)).toEqual({ from: null, to: null });
  });
});

describe("the period in the address", () => {
  test("nothing, or something unknown, is the default", () => {
    expect(readPeriodFilter(new URLSearchParams(""), friday)).toEqual({ period: "this_year_to_date", range: { from: "2026-01-01", to: "2026-11-27" } });
    expect(readPeriodFilter(new URLSearchParams("reportPeriod=next_decade"), friday).period).toBe("this_year_to_date");
  });

  test("a preset's days come from today, not the address", () => {
    expect(readPeriodFilter(new URLSearchParams("reportPeriod=last_month&from=2020-01-01"), friday)).toEqual({ period: "last_month", range: { from: "2026-10-01", to: "2026-10-31" } });
  });

  test("custom keeps its dates, and a missing or broken one leaves that end open", () => {
    expect(readPeriodFilter(new URLSearchParams("reportPeriod=custom&from=2026-02-01&to=2026-02-28"), friday).range).toEqual({ from: "2026-02-01", to: "2026-02-28" });
    expect(readPeriodFilter(new URLSearchParams("reportPeriod=custom&to=2026-02-30"), friday).range).toEqual({ from: null, to: null });
  });

  test("goes back into the address as it came, the default left out", () => {
    for (const query of ["", "reportPeriod=all_dates", "reportPeriod=last_quarter", "reportPeriod=custom&from=2026-02-01&to=2026-02-28", "reportPeriod=custom&to=2026-03-31"]) {
      expect(periodQuery(readPeriodFilter(new URLSearchParams(query), friday))).toBe(query);
    }
  });
});
