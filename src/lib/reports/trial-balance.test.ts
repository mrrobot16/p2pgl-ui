import { describe, expect, test } from "bun:test";

import { addAmounts } from "@/lib/money/amounts";
import { formatLongDate, isIsoDate, todayIsoDate } from "@/lib/reports/dates";
import { trialBalanceReport } from "@/lib/reports/trial-balance";

// gl-node's answer for a small company's books.
const answer = {
  at: "2026-12-31",
  totalDebit: "1290.75",
  totalCredit: "1290.75",
  exact: true,
  rows: [
    { account: "Assets:Bank", debit: "250.50", credit: "0" },
    { account: "Assets:Bank:Checking", debit: "1000.00", credit: "0" },
    { account: "Equity:Opening-Balances", debit: "0", credit: "1000.00" },
    { account: "Expenses:Office:Supplies", debit: "40.25", credit: "0" },
    { account: "Income:Sales", debit: "0", credit: "250.50" },
    { account: "Liabilities:Card", debit: "0", credit: "40.25" }
  ]
};

const bare = (number: string) => ({ number, currency: "" });

describe("trialBalanceReport", () => {
  test("sections in order, each with its debit and credit totals", () => {
    const report = trialBalanceReport(answer);
    expect(report.sections.map((section) => [section.root, section.total])).toEqual([
      ["Assets", [[bare("1250.5")], [bare("0")]]],
      ["Liabilities", [[bare("0")], [bare("40.25")]]],
      ["Equity", [[bare("0")], [bare("1000")]]],
      ["Income", [[bare("0")], [bare("250.5")]]],
      ["Expenses", [[bare("40.25")], [bare("0")]]]
    ]);
  });

  test("the sections add up to gl-node's own totals", () => {
    const report = trialBalanceReport(answer);
    expect(addAmounts(...report.sections.map((section) => section.total[0]))).toEqual([report.totalDebit]);
    expect(addAmounts(...report.sections.map((section) => section.total[1]))).toEqual([report.totalCredit]);
  });

  test("names no currency, since gl-node adds an account's currencies together", () => {
    const report = trialBalanceReport(answer);
    expect(report.totalDebit).toEqual(bare("1290.75"));
    expect(report.sections[0].nodes[0].own?.[0]).toEqual([bare("250.50")]);
  });

  test("shows the totals it adds up only when gl-node says the report is exact", () => {
    expect(trialBalanceReport(answer).showAddedTotals).toBe(true);
    expect(trialBalanceReport({ ...answer, exact: false }).showAddedTotals).toBe(false);
  });
});

describe("dates", () => {
  test("today is the person's own calendar day", () => {
    expect(todayIsoDate(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });

  test("only real dates written YYYY-MM-DD count", () => {
    expect(isIsoDate("2028-02-29")).toBe(true);
    expect(isIsoDate("2026-02-29")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
    expect(isIsoDate("26-1-1")).toBe(false);
    expect(isIsoDate(null)).toBe(false);
  });

  test("a long date reads as the old app's", () => {
    expect(formatLongDate("2026-11-27")).toBe("November 27, 2026");
  });
});
