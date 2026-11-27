import type { BalanceSheetQuery } from "@/graphql/generated/ledger";
import { addAmounts, type Amount } from "@/lib/money/amounts";
import { buildReportSections, type ReportLine, type ReportSection } from "@/lib/reports/account-tree";

/**
 * gl-node closes the books into this equity row: every year's income less
 * expenses, as stored (negative for a profit). The screen shows it as the
 * *Net Income* row, not as an account (docs/parity/reports.md).
 */
export const NET_INCOME_ACCOUNT = "Equity:Net-Income";

/** One column (Total) until *Display columns by* is built. */
const COLUMN_COUNT = 1;

export type BalanceSheetReport = {
  at: string;
  assets: ReportSection;
  liabilities: ReportSection;
  /** Equity's accounts, without the Net Income row. */
  equity: ReportSection;
  /** gl-node's `Equity:Net-Income` figures, per column; empty when the books have no income or expenses yet. */
  netIncome: Amount[][];
  /** Equity's accounts and Net Income, per column, in stored signs. */
  totalEquity: Amount[][];
  totalLiabilitiesAndEquity: Amount[][];
  /** Whether the screen may show totals it adds up itself; false when gl-node rounded a figure. */
  showAddedTotals: boolean;
};

type AccountBalances = BalanceSheetQuery["balanceSheet"]["assets"];

function linesOf(balances: AccountBalances): ReportLine[] {
  return balances.map((balance) => ({ account: balance.account, columns: [balance.balances] }));
}

/** A statement section always shows, empty or not (as the old app's). */
function sectionOf(root: string, lines: ReportLine[]): ReportSection {
  const sections = buildReportSections(lines, COLUMN_COUNT);
  if (sections.length === 0) return { root, nodes: [], total: [[]] };
  // Every row gl-node puts in a list shares its root; join any other, to lose nothing.
  return { root, nodes: sections.flatMap((section) => section.nodes), total: [addAmounts(...sections.map((section) => section.total[0]))] };
}

/** gl-node's balance sheet as the screen's sections. Every total adds up rows of this one answer. */
export function balanceSheetReport(answer: BalanceSheetQuery["balanceSheet"]): BalanceSheetReport {
  const equityLines = linesOf(answer.equity);
  const netIncome = equityLines.filter((line) => line.account === NET_INCOME_ACCOUNT).flatMap((line) => line.columns[0]);
  const liabilities = sectionOf("Liabilities", linesOf(answer.liabilities));
  const equity = sectionOf(
    "Equity",
    equityLines.filter((line) => line.account !== NET_INCOME_ACCOUNT)
  );
  const totalEquity = addAmounts(equity.total[0], netIncome);
  return {
    at: answer.at,
    assets: sectionOf("Assets", linesOf(answer.assets)),
    liabilities,
    equity,
    netIncome: [netIncome],
    totalEquity: [totalEquity],
    totalLiabilitiesAndEquity: [addAmounts(liabilities.total[0], totalEquity)],
    showAddedTotals: answer.exact
  };
}
