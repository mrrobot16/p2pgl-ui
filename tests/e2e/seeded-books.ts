import { appendFile } from "node:fs/promises";
import { join } from "node:path";

import type { TestCompany } from "@tests/e2e/companies";

/**
 * Books written straight into a ledger's `.bean` while gl-node is stopped
 * (docs/plan.md, Testing: seeding goes through the `.bean`, never the API).
 * gl-node adopts and signs them at boot. Entries carry no `openledger-*`
 * metadata, and every account is opened on or before its first use.
 */

/** Where gl-node keeps a company's books, under the test node's folder. */
export function ledgerFilePath(dataDirectory: string, ledgerName: string): string {
  return join(dataDirectory, "ledgers", ledgerName, "ledger.bean");
}

/**
 * A small company with known figures, one currency (USD). As of any day
 * from 2026-03-31 until 2099-01-14 the trial balance is:
 *
 * | Account                       | Debit   | Credit  |
 * |-------------------------------|---------|---------|
 * | Assets:Bank                   |  250.50 |         |
 * | Assets:Bank:Checking          |  800.00 |         |
 * | Liabilities:Card              |         |   40.25 |
 * | Equity:Opening-Balances       |         | 1000.00 |
 * | Income:Sales                  |         |  250.50 |
 * | Income:Services:Consulting    |         |  300.00 |
 * | Expenses:Office:Rent          |  500.00 |         |
 * | Expenses:Office:Supplies      |   40.25 |         |
 * | Total                         | 1590.75 | 1590.75 |
 *
 * `Assets:Bank` has a row of its own and one under it; `Expenses:Office`
 * and `Income:Services` are headings with no row. One more entry, on
 * 2099-01-15, adds 19.75 to Supplies and the Card, for the date filter.
 */
export const SMALL_BOOKS = `
2026-01-01 open Assets:Bank USD
2026-01-01 open Assets:Bank:Checking USD
2026-01-01 open Liabilities:Card USD
2026-01-01 open Equity:Opening-Balances USD
2026-01-01 open Income:Sales USD
2026-01-01 open Income:Services:Consulting USD
2026-01-01 open Expenses:Office:Rent USD
2026-01-01 open Expenses:Office:Supplies USD

2026-01-02 * "Owner" "Opening balance"
  Assets:Bank:Checking  1000.00 USD
  Equity:Opening-Balances  -1000.00 USD

2026-02-03 * "Customer" "Sale"
  Assets:Bank  250.50 USD
  Income:Sales  -250.50 USD

2026-02-04 * "Shop" "Paper"
  Expenses:Office:Supplies  40.25 USD
  Liabilities:Card  -40.25 USD

2026-03-10 * "Client" "Advice"
  Assets:Bank:Checking  300.00 USD
  Income:Services:Consulting  -300.00 USD

2026-03-31 * "Landlord" "March rent"
  Expenses:Office:Rent  500.00 USD
  Assets:Bank:Checking  -500.00 USD

2099-01-15 * "Shop" "Toner"
  Expenses:Office:Supplies  19.75 USD
  Liabilities:Card  -19.75 USD
`;

const LARGE_ACCOUNTS = {
  bank: ["Assets:Bank:Checking", "Assets:Bank:Savings", "Assets:Cash"],
  income: ["Income:Sales:Products", "Income:Sales:Services", "Income:Interest", "Income:Other"],
  expenses: [
    "Expenses:Office:Rent",
    "Expenses:Office:Supplies",
    "Expenses:Office:Utilities",
    "Expenses:Travel:Airfare",
    "Expenses:Travel:Hotels",
    "Expenses:Travel:Meals",
    "Expenses:Payroll:Wages",
    "Expenses:Payroll:Taxes",
    "Expenses:Software",
    "Expenses:Insurance",
    "Expenses:Marketing:Ads",
    "Expenses:Marketing:Events",
    "Expenses:Bank-Fees",
    "Expenses:Repairs"
  ],
  card: ["Liabilities:Card:Visa", "Liabilities:Card:Amex"]
};

/**
 * A large company for the speed budgets: `entryCount` entries over three
 * years, money in from the income accounts and out to the expenses, by
 * bank and card. The same count always writes the same books.
 */
export function largeBooks(entryCount: number): string {
  const lines = ["2024-01-01 open Equity:Opening-Balances USD"];
  for (const account of [...LARGE_ACCOUNTS.bank, ...LARGE_ACCOUNTS.income, ...LARGE_ACCOUNTS.expenses, ...LARGE_ACCOUNTS.card]) {
    lines.push(`2024-01-01 open ${account} USD`);
  }
  lines.push("", '2024-01-02 * "Owner" "Opening balance"', "  Assets:Bank:Checking  250000.00 USD", "  Equity:Opening-Balances  -250000.00 USD");

  // A fixed sequence (a linear congruential generator), not Math.random.
  let seed = 20260101;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed;
  };
  const start = Date.UTC(2024, 0, 3);
  const dayCount = 1000;
  for (let entry = 0; entry < entryCount; entry += 1) {
    const day = new Date(start + Math.floor((entry * dayCount) / entryCount) * 86_400_000).toISOString().slice(0, 10);
    const cents = 100 + (next() % 250_000);
    const amount = `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
    const moneyIn = next() % 4 === 0;
    const pick = (accounts: string[]) => accounts[next() % accounts.length];
    if (moneyIn) {
      lines.push("", `${day} * "Customer ${entry % 97}" "Payment ${entry}"`, `  ${pick(LARGE_ACCOUNTS.bank)}  ${amount} USD`, `  ${pick(LARGE_ACCOUNTS.income)}  -${amount} USD`);
    } else {
      const from = next() % 3 === 0 ? pick(LARGE_ACCOUNTS.card) : pick(LARGE_ACCOUNTS.bank);
      lines.push("", `${day} * "Vendor ${entry % 89}" "Purchase ${entry}"`, `  ${pick(LARGE_ACCOUNTS.expenses)}  ${amount} USD`, `  ${from}  -${amount} USD`);
    }
  }
  return `\n${lines.join("\n")}\n`;
}

/** Appends books to a ledger's `.bean` (gl-node must be stopped). */
export async function writeBooks(dataDirectory: string, ledgerName: string, books: string): Promise<void> {
  await appendFile(ledgerFilePath(dataDirectory, ledgerName), books);
}

/** How the global setup hands the seeded companies to the test workers. */
export const SEEDED_COMPANIES_VARIABLE = "E2E_SEEDED_COMPANIES";

/** A company the global setup seeded: `small` (known figures) or `large` (for the budgets). Each has a READ key. */
export function seededCompany(which: "small" | "large"): TestCompany {
  const raw = process.env[SEEDED_COMPANIES_VARIABLE];
  if (!raw) throw new Error("No seeded companies: the end-to-end tests seed them in their global setup.");
  return (JSON.parse(raw) as Record<"small" | "large", TestCompany>)[which];
}
