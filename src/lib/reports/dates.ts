/** A calendar date as gl-node takes it: `YYYY-MM-DD`. */
export type IsoDate = string;

function twoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

/** The day `date` falls on here, as `YYYY-MM-DD` (the person's own calendar day, not UTC's). */
export function isoDateOf(date: Date): IsoDate {
  return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
}

/** Today on this person's calendar. */
export function todayIsoDate(now: Date = new Date()): IsoDate {
  return isoDateOf(now);
}

/** Whether `value` is a real calendar date written `YYYY-MM-DD` (not `2026-02-30`). */
export function isIsoDate(value: string | null | undefined): value is IsoDate {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

const LONG_DATE = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });
const RUN_TIME = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });

/** `2026-11-27` as `November 27, 2026`. */
export function formatLongDate(value: IsoDate): string {
  const [year, month, day] = value.split("-").map(Number);
  return LONG_DATE.format(new Date(year, month - 1, day));
}

/** When a report's answer arrived, for its footer: `Friday, November 27, 2026 at 6:35 PM GMT+7`. */
export function formatRunTime(moment: Date): string {
  return RUN_TIME.format(moment);
}
