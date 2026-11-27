"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { InputField } from "@/components/ui/input-field";
import { FIELD_BASE_CLASSES, FIELD_SIZE_CLASSES, joinClasses } from "@/components/ui/field-styles";
import { isIsoDate, type IsoDate } from "@/lib/reports/dates";
import { REPORT_PERIODS, presetRange, type PeriodFilter, type ReportPeriod } from "@/lib/reports/report-period";

// A date typed into a field is used once typing stops, not per keystroke:
// a year typed digit by digit is a valid date at each step, and each date
// is a question to gl-node (60 a minute per company).
const TYPING_PAUSE_MILLISECONDS = 500;

/**
 * Puts a report's filters in the address. Through the History API, which
 * Next's useSearchParams follows: in the static export a search-only
 * router.replace never commits, and a filter is the browser's alone.
 */
export function replaceReportQuery(path: string, query: string): void {
  window.history.replaceState(null, "", query === "" ? path : `${path}?${query}`);
}

type DateFilterFieldProperties = {
  label: string;
  /** The date in use; null for an open end. */
  value: IsoDate | null;
  /** Called with a whole date once typing pauses, or null when the field is emptied (if `allowEmpty`). */
  onCommit: (value: IsoDate | null) => void;
  allowEmpty?: boolean;
};

/** A date filter that keeps what is typed and passes on a whole date once typing pauses. */
export function DateFilterField({ label, value, onCommit, allowEmpty = false }: DateFilterFieldProperties) {
  const [typed, setTyped] = useState(value ?? "");
  const [shownValue, setShownValue] = useState(value);
  if (value !== shownValue) {
    setShownValue(value);
    setTyped(value ?? "");
  }

  useEffect(() => {
    const committed = isIsoDate(typed) ? typed : typed === "" && allowEmpty ? null : undefined;
    if (committed === undefined || committed === value) return;
    const timer = window.setTimeout(() => onCommit(committed), TYPING_PAUSE_MILLISECONDS);
    return () => window.clearTimeout(timer);
  }, [typed, value, allowEmpty, onCommit]);

  return <InputField label={label} type="date" size="sm" value={typed} onChange={(event) => setTyped(event.target.value)} />;
}

/**
 * *Report period*, *From* and *To* (the old app's filters). Choosing a
 * preset sets both dates; editing a date makes the period Custom.
 */
export function PeriodFilters({ filter, onChange }: { filter: PeriodFilter; onChange: (filter: PeriodFilter) => void }) {
  const selectIdentifier = useId();

  function choosePeriod(period: ReportPeriod) {
    onChange(period === "custom" ? { period, range: filter.range } : { period, range: presetRange(period) });
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <label htmlFor={selectIdentifier} className="whitespace-nowrap text-xs text-[var(--color-icon-secondary)]">
          Report period
        </label>
        <div className="relative w-48">
          <select
            id={selectIdentifier}
            value={filter.period}
            onChange={(event) => choosePeriod(event.target.value as ReportPeriod)}
            className={joinClasses(FIELD_BASE_CLASSES, FIELD_SIZE_CLASSES.sm, "w-full appearance-none pr-8")}
          >
            {REPORT_PERIODS.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-icon-secondary)]" aria-hidden="true" />
        </div>
      </div>
      <DateFilterField label="From" value={filter.range.from} allowEmpty onCommit={(from) => onChange({ period: "custom", range: { from, to: filter.range.to } })} />
      <DateFilterField label="To" value={filter.range.to} allowEmpty onCommit={(to) => onChange({ period: "custom", range: { from: filter.range.from, to } })} />
    </>
  );
}
