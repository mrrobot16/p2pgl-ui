"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { ReportBody } from "@/components/reports/report-body";
import { PeriodFilters, replaceReportQuery } from "@/components/reports/report-filters";
import { ReportFrame } from "@/components/reports/report-frame";
import { ReportTable, blockKeys, type ReportBlock, type SectionBlock } from "@/components/reports/report-table";
import { BalanceSheetDocument } from "@/graphql/generated/ledger";
import { useCompanies } from "@/lib/companies/use-companies";
import { useLedgerQuery } from "@/lib/gl-node/use-ledger-query";
import { parentNames, type ReportSection } from "@/lib/reports/account-tree";
import { balanceSheetReport, type BalanceSheetReport } from "@/lib/reports/balance-sheet";
import { formatLongDate } from "@/lib/reports/dates";
import { LATEST_DATE, periodQuery, readPeriodFilter } from "@/lib/reports/report-period";
import { useCollapsedNames } from "@/lib/reports/use-collapsed-names";

const PATH = "/reports/balance-sheet";
const COLUMN_LABELS = ["Total"] as const;

function sectionBlock(section: ReportSection, sign: 1 | -1, total = section.total): SectionBlock {
  return { kind: "section", key: section.root, label: section.root, nodes: section.nodes, total, sign };
}

/**
 * The statement's layout, as the old app's: Assets; then Liabilities and
 * Equity, holding Liabilities and Equity (its accounts, then the Net
 * Income row). Liabilities and Equity are stored negative and shown
 * positive.
 */
function balanceSheetBlocks(report: BalanceSheetReport): ReportBlock[] {
  const equity: SectionBlock = {
    ...sectionBlock(report.equity, -1, report.totalEquity),
    extraRows: [{ key: "net-income", label: "Net Income", figures: report.netIncome }]
  };
  return [
    sectionBlock(report.assets, 1),
    { kind: "group", key: "liabilities-and-equity", label: "Liabilities and Equity", sections: [sectionBlock(report.liabilities, -1), equity], total: report.totalLiabilitiesAndEquity, sign: -1 }
  ];
}

export function BalanceSheetScreen() {
  // useSearchParams needs a boundary in a static export.
  return (
    <Suspense fallback={null}>
      <BalanceSheetContent />
    </Suspense>
  );
}

function BalanceSheetContent() {
  const searchParameters = useSearchParams();
  const { active } = useCompanies();
  const filter = readPeriodFilter(new URLSearchParams(searchParameters.toString()));
  const query = periodQuery(filter);
  // A balance sheet is as of the period's last day; open-ended, as of everything in the books.
  const at = filter.range.to ?? LATEST_DATE;

  const answer = useLedgerQuery(BalanceSheetDocument, { at });
  const report = answer.data ? balanceSheetReport(answer.data.balanceSheet) : null;
  const blocks = report ? balanceSheetBlocks(report) : [];
  const collapsed = useCollapsedNames();
  const accountParents = report ? [report.assets, report.liabilities, report.equity].flatMap((section) => parentNames(section.nodes)) : [];

  return (
    <ReportFrame
      report="balance-sheet"
      title="Balance Sheet"
      query={query}
      companyLabel={active?.label ?? ""}
      dateLine={filter.range.to ? `As of ${formatLongDate(filter.range.to)}` : "All dates"}
      receivedAt={answer.receivedAt}
      updating={answer.loading && report !== null}
      onExpandAll={collapsed.expandAll}
      onCollapseAll={() => collapsed.collapse([...blockKeys(blocks), ...accountParents])}
      filters={<PeriodFilters filter={filter} onChange={(next) => replaceReportQuery(PATH, periodQuery(next))} />}
    >
      <ReportBody columnCount={COLUMN_LABELS.length} answer={answer} nodeUrl={active?.nodeUrl ?? ""} roundedNote={report !== null && !report.showAddedTotals ? "The node rounded some figures once, so the totals are left out: adding rounded figures up could be off." : null}>
        {report ? <ReportTable columnLabels={COLUMN_LABELS} blocks={blocks} showTotals={report.showAddedTotals} collapsedNames={collapsed.names} onToggle={collapsed.toggle} /> : null}
      </ReportBody>
    </ReportFrame>
  );
}
