import type { TrialBalanceQuery } from "@/graphql/generated/ledger";
import type { Amount } from "@/lib/money/amounts";
import { buildReportSections, type ReportLine, type ReportSection } from "@/lib/reports/account-tree";

/** The Debit and Credit columns. */
export const TRIAL_BALANCE_COLUMN_COUNT = 2;

export type TrialBalanceReport = {
  at: string;
  sections: ReportSection[];
  /** gl-node's own totals, always shown. */
  totalDebit: Amount;
  totalCredit: Amount;
  /**
   * Whether the screen may show totals it adds up itself (sections and
   * parents). A report gl-node marks inexact shows its rows and its own
   * totals only.
   */
  showAddedTotals: boolean;
};

/**
 * gl-node's trial balance as the screen's sections. gl-node adds every
 * currency of an account into one debit or credit figure and names none
 * (docs/api-gaps.md, item 11), so the amounts carry no currency.
 */
export function trialBalanceReport(answer: TrialBalanceQuery["trialBalance"]): TrialBalanceReport {
  const lines: ReportLine[] = answer.rows.map((row) => ({
    account: row.account,
    columns: [[{ number: row.debit, currency: "" }], [{ number: row.credit, currency: "" }]]
  }));
  return {
    at: answer.at,
    sections: buildReportSections(lines, TRIAL_BALANCE_COLUMN_COUNT),
    totalDebit: { number: answer.totalDebit, currency: "" },
    totalCredit: { number: answer.totalCredit, currency: "" },
    showAddedTotals: answer.exact
  };
}
