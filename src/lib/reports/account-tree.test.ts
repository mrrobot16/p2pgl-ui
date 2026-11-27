import { describe, expect, test } from "bun:test";

import { buildReportSections, parentNames, reportRows, type ReportLine } from "@/lib/reports/account-tree";

const usd = (number: string) => ({ number, currency: "USD" });
const line = (account: string, ...numbers: string[]): ReportLine => ({ account, columns: numbers.map((number) => [usd(number)]) });

describe("buildReportSections", () => {
  test("puts sections in the statement's order, other roots after by name", () => {
    const sections = buildReportSections(
      [line("Income:Sales", "-5"), line("Zebra:Thing", "1"), line("Assets:Cash", "5"), line("Expenses:Rent", "2"), line("Equity:Opening", "-1"), line("Liabilities:Card", "-1")],
      1
    );
    expect(sections.map((section) => section.root)).toEqual(["Assets", "Liabilities", "Equity", "Income", "Expenses", "Zebra"]);
  });

  test("nests accounts by their parts; a parent's total is its own row plus every row under it", () => {
    const [assets] = buildReportSections([line("Assets:Bank", "250.50"), line("Assets:Bank:Checking", "1000.00"), line("Assets:Bank:Savings:Joint", "0.25")], 1);
    const [bank] = assets.nodes;
    expect(bank.label).toBe("Bank");
    expect(bank.own).toEqual([[usd("250.50")]]);
    expect(bank.children.map((child) => child.label)).toEqual(["Checking", "Savings"]);
    expect(bank.total).toEqual([[usd("1250.75")]]);
    expect(assets.total).toEqual([[usd("1250.75")]]);
  });

  test("a parent with no row of its own is a heading: no own figures, its children's total", () => {
    const [expenses] = buildReportSections([line("Expenses:Office:Supplies", "40.25"), line("Expenses:Office:Rent", "500")], 1);
    const [office] = expenses.nodes;
    expect(office.own).toBeNull();
    expect(office.name).toBe("Expenses:Office");
    expect(office.total).toEqual([[usd("540.25")]]);
    expect(office.children.map((child) => [child.label, child.depth])).toEqual([
      ["Rent", 1],
      ["Supplies", 1]
    ]);
  });

  test("adds in stored signs: liabilities stay negative", () => {
    const [liabilities] = buildReportSections([line("Liabilities:Card", "-40.25"), line("Liabilities:Loan", "-100")], 1);
    expect(liabilities.total).toEqual([[usd("-140.25")]]);
  });

  test("leaves out rows that are zero in every column, and keeps one zero only in some", () => {
    const sections = buildReportSections([line("Assets:Empty", "0", "0.00"), line("Assets:Half", "0", "3")], 2);
    expect(sections[0].nodes.map((node) => node.label)).toEqual(["Half"]);
    expect(sections[0].total).toEqual([[usd("0")], [usd("3")]]);
  });

  test("adds each currency on its own", () => {
    const [assets] = buildReportSections(
      [
        { account: "Assets:Cash", columns: [[usd("10"), { number: "5", currency: "EUR" }]] },
        { account: "Assets:Bank", columns: [[usd("1")]] }
      ],
      1
    );
    expect(assets.total).toEqual([[usd("11"), { number: "5", currency: "EUR" }]]);
  });

  test("of no rows is no sections", () => {
    expect(buildReportSections([], 1)).toEqual([]);
  });
});

describe("reportRows", () => {
  const [section] = buildReportSections([line("Expenses:Office", "10"), line("Expenses:Office:Supplies", "40"), line("Expenses:Rent", "500")], 1);

  test("an open parent: its heading, its accounts, then its total", () => {
    expect(reportRows(section.nodes, new Set(), true).map((row) => [row.kind, row.node.label])).toEqual([
      ["parent", "Office"],
      ["account", "Supplies"],
      ["parentTotal", "Office"],
      ["account", "Rent"]
    ]);
  });

  test("a collapsed parent is its heading alone", () => {
    const rows = reportRows(section.nodes, new Set(["Expenses:Office"]), true);
    expect(rows.map((row) => [row.kind, row.node.label, row.collapsed])).toEqual([
      ["parent", "Office", true],
      ["account", "Rent", false]
    ]);
  });

  test("without totals, no total rows", () => {
    expect(reportRows(section.nodes, new Set(), false).map((row) => row.kind)).toEqual(["parent", "account", "account"]);
  });

  test("parentNames lists every parent, nested ones too", () => {
    const [nested] = buildReportSections([line("Expenses:Office:Supplies:Paper", "1"), line("Expenses:Rent", "2")], 1);
    expect(parentNames(nested.nodes)).toEqual(["Expenses:Office", "Expenses:Office:Supplies"]);
  });
});
