"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { ReportBody } from "@/components/reports/report-body";
import { DateFilterField, replaceReportQuery } from "@/components/reports/report-filters";
import { ReportFrame } from "@/components/reports/report-frame";
import { ReportTable, blockKeys, type SectionBlock } from "@/components/reports/report-table";
import { TrialBalanceDocument } from "@/graphql/generated/ledger";
import { useCompanies } from "@/lib/companies/use-companies";
import { useLedgerQuery } from "@/lib/gl-node/use-ledger-query";
import { formatAmount } from "@/lib/money/format-amount";
import { parentNames } from "@/lib/reports/account-tree";
import { isIsoDate, todayIsoDate } from "@/lib/reports/dates";
import { trialBalanceReport } from "@/lib/reports/trial-balance";
import { useCollapsedNames } from "@/lib/reports/use-collapsed-names";

const PATH = "/reports/trial-balance";
const COLUMN_LABELS = ["Debit", "Credit"] as const;

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

  const answer = useLedgerQuery(TrialBalanceDocument, { at: asOf });
  const report = answer.data ? trialBalanceReport(answer.data.trialBalance) : null;
  // Accounts by section, in their stored signs: debits and credits are both positive.
  const blocks: SectionBlock[] = (report?.sections ?? []).map((section) => ({ kind: "section", key: section.root, label: section.root, nodes: section.nodes, total: section.total, sign: 1 }));
  const collapsed = useCollapsedNames();

  return (
    <ReportFrame
      report="trial-balance"
      title="Trial Balance"
      query={query}
      companyLabel={active?.label ?? ""}
      dateLine={`As of ${report?.at ?? asOf}`}
      receivedAt={answer.receivedAt}
      updating={answer.loading && report !== null}
      onExpandAll={collapsed.expandAll}
      onCollapseAll={() => collapsed.collapse([...blockKeys(blocks), ...blocks.flatMap((block) => parentNames(block.nodes))])}
      filters={<DateFilterField label="As of" value={asOf} onCommit={(date) => date && replaceReportQuery(PATH, date === todayIsoDate() ? "" : `asOf=${date}`)} />}
    >
      <ReportBody columnCount={COLUMN_LABELS.length} answer={answer} nodeUrl={active?.nodeUrl ?? ""} roundedNote={report !== null && !report.showAddedTotals ? "The node rounded some figures once, so the section totals are left out: adding rounded figures up could be off. The bottom totals are the node's own." : null}>
        {report ? (
          <ReportTable
            columnLabels={COLUMN_LABELS}
            blocks={blocks}
            showTotals={report.showAddedTotals}
            collapsedNames={collapsed.names}
            onToggle={collapsed.toggle}
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
