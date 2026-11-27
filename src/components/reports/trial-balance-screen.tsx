"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { ReportBody } from "@/components/reports/report-body";
import { ReportFrame } from "@/components/reports/report-frame";
import { ReportTable, sectionKey } from "@/components/reports/report-table";
import { InputField } from "@/components/ui/input-field";
import { TrialBalanceDocument } from "@/graphql/generated/ledger";
import { useCompanies } from "@/lib/companies/use-companies";
import { useLedgerQuery } from "@/lib/gl-node/use-ledger-query";
import { formatAmount } from "@/lib/money/format-amount";
import { parentNames } from "@/lib/reports/account-tree";
import { isIsoDate, todayIsoDate } from "@/lib/reports/dates";
import { trialBalanceReport } from "@/lib/reports/trial-balance";

const PATH = "/reports/trial-balance";
const COLUMN_LABELS = ["Debit", "Credit"] as const;

// A date typed into the field is asked for once typing stops, not per
// keystroke (a year typed digit by digit is a valid date at each step).
const TYPING_PAUSE_MILLISECONDS = 500;

export function TrialBalanceScreen() {
  // useSearchParams needs a boundary in a static export.
  return (
    <Suspense fallback={null}>
      <TrialBalanceContent />
    </Suspense>
  );
}

function TrialBalanceContent() {
  const searchParameters = useSearchParams();
  const { active } = useCompanies();
  const requested = searchParameters.get("asOf");
  const asOf = isIsoDate(requested) ? requested : todayIsoDate();
  const query = isIsoDate(requested) ? `asOf=${requested}` : "";

  // The field keeps what is typed; the address (and the question to the
  // node) follows once it is a whole date and typing has paused. The
  // address changes through the History API, which Next's useSearchParams
  // follows: in a static export router.replace would ask the server for
  // the page again, and a filter is the browser's alone.
  const [fieldValue, setFieldValue] = useState(asOf);
  const [shownAsOf, setShownAsOf] = useState(asOf);
  if (asOf !== shownAsOf) {
    setShownAsOf(asOf);
    setFieldValue(asOf);
  }
  useEffect(() => {
    if (!isIsoDate(fieldValue) || fieldValue === asOf) return;
    const timer = window.setTimeout(() => {
      window.history.replaceState(null, "", fieldValue === todayIsoDate() ? PATH : `${PATH}?asOf=${fieldValue}`);
    }, TYPING_PAUSE_MILLISECONDS);
    return () => window.clearTimeout(timer);
  }, [fieldValue, asOf]);

  const answer = useLedgerQuery(TrialBalanceDocument, { at: asOf });
  const report = answer.data ? trialBalanceReport(answer.data.trialBalance) : null;
  const [collapsedNames, setCollapsedNames] = useState<ReadonlySet<string>>(new Set());

  function toggle(name: string) {
    setCollapsedNames((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function collapseAll() {
    if (!report) return;
    setCollapsedNames(new Set(report.sections.flatMap((section) => [sectionKey(section.root), ...parentNames(section.nodes)])));
  }

  return (
    <ReportFrame
      report="trial-balance"
      title="Trial Balance"
      query={query}
      companyLabel={active?.label ?? ""}
      dateLine={`As of ${report?.at ?? asOf}`}
      receivedAt={answer.receivedAt}
      updating={answer.loading && report !== null}
      onExpandAll={() => setCollapsedNames(new Set())}
      onCollapseAll={collapseAll}
      filters={<InputField label="As of" type="date" size="sm" value={fieldValue} onChange={(event) => setFieldValue(event.target.value)} />}
    >
      <ReportBody columnCount={COLUMN_LABELS.length} answer={answer} nodeUrl={active?.nodeUrl ?? ""} roundedNote={report !== null && !report.showAddedTotals}>
        {report ? (
          <ReportTable
            columnLabels={COLUMN_LABELS}
            sections={report.sections}
            displaySign={() => 1}
            showTotals={report.showAddedTotals}
            collapsedNames={collapsedNames}
            onToggle={toggle}
            closingRows={
              <tr className="border-t-2 border-[var(--color-divider-tertiary)] bg-[var(--color-report-row-alt)]">
                <td className="px-3 py-1 font-bold text-[var(--color-text-primary)]">Total</td>
                <td className="px-3 py-1 text-right font-bold tabular-nums text-[var(--color-text-primary)]">{formatAmount(report.totalDebit)}</td>
                <td className="px-3 py-1 text-right font-bold tabular-nums text-[var(--color-text-primary)]">{formatAmount(report.totalCredit)}</td>
              </tr>
            }
          />
        ) : null}
      </ReportBody>
    </ReportFrame>
  );
}
