import { isIsoDate, isoDateOf, type IsoDate } from "@/lib/reports/dates";

/** The *Report period* choices, as the old app's (and its URL values). */
export const REPORT_PERIODS = [
  { value: "this_year_to_date", label: "This year to date" },
  { value: "all_dates", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
  { value: "this_quarter", label: "This quarter" },
  { value: "this_year", label: "This year" },
  { value: "last_week", label: "Last week" },
  { value: "last_month", label: "Last month" },
  { value: "last_quarter", label: "Last quarter" },
  { value: "last_year", label: "Last year" },
  { value: "custom", label: "Custom" }
] as const;

export type ReportPeriod = (typeof REPORT_PERIODS)[number]["value"];

export const DEFAULT_REPORT_PERIOD = "this_year_to_date" satisfies ReportPeriod;

/**
 * The dates a question to gl-node needs, for *All dates*: the earliest and
 * latest days its Date takes, so nothing in the books falls outside.
 */
export const EARLIEST_DATE: IsoDate = "0001-01-01";
export const LATEST_DATE: IsoDate = "9999-12-31";

/** A period's days, both ends included; `null` ends mean *All dates*. */
export type DateRange = { from: IsoDate | null; to: IsoDate | null };

function isReportPeriod(value: string | null): value is ReportPeriod {
  return REPORT_PERIODS.some((period) => period.value === value);
}

function day(year: number, monthIndex: number, dayOfMonth: number): IsoDate {
  return isoDateOf(new Date(year, monthIndex, dayOfMonth));
}

/** The days a preset covers on `today` (weeks start on Monday). Custom has no days of its own. */
export function presetRange(period: Exclude<ReportPeriod, "custom">, today: Date = new Date()): DateRange {
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();
  // Days back to this week's Monday: Sunday is 6, Monday 0.
  const sinceMonday = (today.getDay() + 6) % 7;
  const quarterStart = Math.floor(month / 3) * 3;
  switch (period) {
    case "all_dates":
      return { from: null, to: null };
    case "today":
      return { from: day(year, month, date), to: day(year, month, date) };
    case "yesterday":
      return { from: day(year, month, date - 1), to: day(year, month, date - 1) };
    case "this_week":
      return { from: day(year, month, date - sinceMonday), to: day(year, month, date) };
    case "this_month":
      return { from: day(year, month, 1), to: day(year, month + 1, 0) };
    case "this_quarter":
      return { from: day(year, quarterStart, 1), to: day(year, quarterStart + 3, 0) };
    case "this_year":
      return { from: day(year, 0, 1), to: day(year, 11, 31) };
    case "last_week":
      return { from: day(year, month, date - sinceMonday - 7), to: day(year, month, date - sinceMonday - 1) };
    case "last_month":
      return { from: day(year, month - 1, 1), to: day(year, month, 0) };
    case "last_quarter":
      return { from: day(year, quarterStart - 3, 1), to: day(year, quarterStart, 0) };
    case "last_year":
      return { from: day(year - 1, 0, 1), to: day(year - 1, 11, 31) };
    case "this_year_to_date":
      return { from: day(year, 0, 1), to: day(year, month, date) };
  }
}

/** A report's period as the address carries it. */
export type PeriodFilter = { period: ReportPeriod; range: DateRange };

/**
 * The period in the address: `reportPeriod`, plus `from` and `to` for
 * Custom (either may be missing: open at that end). An unknown value falls
 * back to the default; a date that isn't a whole date counts as missing.
 */
export function readPeriodFilter(parameters: URLSearchParams, today: Date = new Date()): PeriodFilter {
  const requested = parameters.get("reportPeriod");
  if (requested === "custom") {
    const from = parameters.get("from");
    const to = parameters.get("to");
    return { period: "custom", range: { from: isIsoDate(from) ? from : null, to: isIsoDate(to) ? to : null } };
  }
  if (isReportPeriod(requested) && requested !== "custom") return { period: requested, range: presetRange(requested, today) };
  return { period: DEFAULT_REPORT_PERIOD, range: presetRange(DEFAULT_REPORT_PERIOD, today) };
}

/** The address's query for a period; the default leaves it out. */
export function periodQuery(filter: PeriodFilter): string {
  const parameters = new URLSearchParams();
  if (filter.period !== DEFAULT_REPORT_PERIOD) parameters.set("reportPeriod", filter.period);
  if (filter.period === "custom") {
    if (filter.range.from) parameters.set("from", filter.range.from);
    if (filter.range.to) parameters.set("to", filter.range.to);
  }
  return parameters.toString();
}
