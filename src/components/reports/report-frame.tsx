import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { formatRunTime } from "@/lib/reports/dates";
import { BUILT_REPORTS, type ReportIdentifier } from "@/lib/reports/report-list";

type ReportFrameProperties = {
  report: ReportIdentifier;
  title: string;
  /** The filters' query string (`asOf=2026-11-27`), kept by the tabs to reports of the same kind; empty for the defaults. */
  query: string;
  filters: ReactNode;
  companyLabel: string;
  dateLine: string;
  /** When the answer shown arrived, for the footer; null before the first one. */
  receivedAt: Date | null;
  /** A newer answer is on its way: the old one stays, dimmed a little. */
  updating: boolean;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  children: ReactNode;
};

/**
 * The page around every report (the old app's, with QuickBooks' order where
 * they differ): a grey header with the way back, the report tabs, the title
 * and the filters; then the report card, its toolbar (Expand all, Collapse
 * all, Print), its heading (report, company, date), the table, and the
 * basis line.
 */
export function ReportFrame({ report, title, query, filters, companyLabel, dateLine, receivedAt, updating, onExpandAll, onCollapseAll, children }: ReportFrameProperties) {
  return (
    <main className="min-h-full bg-[var(--color-container-background-primary)] text-sm text-[var(--color-text-primary)]">
      <header className="header-reports flex flex-col items-start justify-center bg-[var(--color-container-background-secondary)] px-7 py-3">
        <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-[var(--color-icon-secondary)]">
          <span aria-hidden="true">‹</span>
          <Link href="/reports" className="text-[var(--color-link-text)] hover:underline">
            Standard Reports
          </Link>
        </nav>
        <nav aria-label="Reports" className="mb-6 flex w-full items-center gap-1 border-b border-[var(--color-divider-tertiary)]">
          {BUILT_REPORTS.map((item) => {
            const current = item.identifier === report;
            const sameFilters = item.filters === BUILT_REPORTS.find((built) => built.identifier === report)?.filters;
            return (
              <Link
                key={item.identifier}
                href={query === "" || !sameFilters ? item.href : `${item.href}?${query}`}
                aria-current={current ? "page" : undefined}
                className={`-mb-px border-b-2 px-3 py-1.5 text-xs font-medium transition-colors ${
                  current
                    ? "border-[var(--color-ui-primary)] text-[var(--color-text-primary)]"
                    : "border-transparent text-[var(--color-icon-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <h1 className="mb-2 text-2xl text-[var(--color-text-primary)]">{title}</h1>
        <div className="flex items-end justify-start gap-5">{filters}</div>
      </header>

      <div className="mx-[30px] mb-[30px] px-[15px] pb-[15px]">
        <section
          aria-label={title}
          aria-busy={updating}
          className="report-print-card mx-auto mt-8 w-full max-w-[840px] rounded border border-[var(--color-divider-tertiary)] bg-[var(--color-container-background-primary)] p-5 shadow-sm"
        >
          <div className="no-print mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={onExpandAll}>
                Expand all
              </Button>
              <Button variant="ghost" size="sm" onClick={onCollapseAll}>
                Collapse all
              </Button>
            </div>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              Print
            </Button>
          </div>
          <div className="mb-4 text-center">
            <h2 className="mb-2 text-[28px] font-medium text-[var(--color-text-global)]">{title}</h2>
            <p className="mb-2 text-base text-[var(--color-text-primary)]">{companyLabel}</p>
            <p className="text-xs text-[var(--color-icon-secondary)]">{dateLine}</p>
          </div>
          <div className={`transition-opacity motion-reduce:transition-none ${updating ? "opacity-60" : "opacity-100"}`}>{children}</div>
          {receivedAt ? (
            <p className="mt-4 text-center text-xs text-[var(--color-icon-secondary)]">
              Accrual basis <span aria-hidden="true">|</span> {formatRunTime(receivedAt)}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
