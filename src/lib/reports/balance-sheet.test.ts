import { describe, expect, test } from "bun:test";

import { addAmounts } from "@/lib/money/amounts";
import { balanceSheetReport } from "@/lib/reports/balance-sheet";

const usd = (number: string) => ({ number, currency: "USD" });
const balance = (account: string, number: string) => ({ account, balances: [usd(number)] });

// gl-node's answer for a small company's books (stored signs).
const answer = {
  at: "2026-12-31",
  exact: true,
  assets: [balance("Assets:Bank", "250.50"), balance("Assets:Bank:Checking", "1000.00")],
  liabilities: [balance("Liabilities:Card", "-40.25")],
  equity: [balance("Equity:Opening-Balances", "-1000.00"), balance("Equity:Net-Income", "-210.25")]
};

describe("balanceSheetReport", () => {
  test("takes gl-node's Equity:Net-Income out of the accounts, as the Net Income row", () => {
    const report = balanceSheetReport(answer);
    expect(report.equity.nodes.map((node) => node.name)).toEqual(["Equity:Opening-Balances"]);
    expect(report.netIncome).toEqual([[usd("-210.25")]]);
  });

  test("Total for Equity counts Net Income; Liabilities and Equity add up", () => {
    const report = balanceSheetReport(answer);
    expect(report.totalEquity).toEqual([[usd("-1210.25")]]);
    expect(report.totalLiabilitiesAndEquity).toEqual([[usd("-1250.5")]]);
    expect(report.assets.total).toEqual([[usd("1250.5")]]);
  });

  test("assets, liabilities and equity add up to zero in stored signs (one currency)", () => {
    const report = balanceSheetReport(answer);
    expect(addAmounts(report.assets.total[0], report.totalLiabilitiesAndEquity[0])).toEqual([usd("0")]);
  });

  test("empty books still have the three sections, with nothing in them", () => {
    const report = balanceSheetReport({ at: "2025-01-01", exact: true, assets: [], liabilities: [], equity: [] });
    expect([report.assets.root, report.liabilities.root, report.equity.root]).toEqual(["Assets", "Liabilities", "Equity"]);
    expect(report.assets.nodes).toEqual([]);
    expect(report.netIncome).toEqual([[]]);
    expect(report.totalLiabilitiesAndEquity).toEqual([[]]);
  });

  test("shows the totals it adds up only when gl-node says the report is exact", () => {
    expect(balanceSheetReport({ ...answer, exact: false }).showAddedTotals).toBe(false);
  });
});
