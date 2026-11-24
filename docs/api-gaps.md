# What the UI needs and gl-node lacks

Status: 2026-11-24, from the first four areas' parity checklists. For the
session that builds gl-node's API (openledger-v2 entry 011 and after). Each
line names the screen that waits for it; the screen shows nothing in its
place until it exists.

Already planned in 011 (listed so the screens can point at them):

| Need | Screens waiting | 011 unit |
|---|---|---|
| `me`: the caller's name and role, the ledger's label | Top header (name, avatar), company picker label, report headers, hiding what a key's role cannot do | 2 |
| Account metadata: category (13), detail type, code, display name | Chart of accounts (Account type, Detail type, filters, sorting by type); Balance Sheet's Bank Accounts / Other Current Assets / Fixed Assets sections; which accounts are bank and credit-card accounts | 3 |
| Entry metadata: reference number, type | Report drill-down's Ref # column; Posted tab's "Expense 11/20/2026" link text | 4 |
| `register` | Chart of accounts' View register; bank transactions' Go to bank register; Posted tab's link | 6 |
| P&L Detail | Chart of accounts' Run report for income and expense accounts | 7 |
| Corrections (014) | Bank transactions' Undo on posted rows; chart of accounts' Edit, Make inactive by correction | 014 |
| Store (015): vendors, customers, products, attachments | Bank transactions' From/To picker, Product/Service, attachments | 015 |
| Bank rules and suggestions | Bank transactions' Create rule and category suggestions | 011 bank feed |

Not in 011's plan yet:

1. **Ignored bank transactions, listed and restored.** The Excluded tab
   lists what was excluded (date, description, amount, the reason) and
   *Undo* puts one back in the inbox. gl-node's inbox has
   `ignoreBankTransactions` but no query for ignored items and no way back.
   Wanted: `ignoredBankTransactions(itemId, first, offset)` and
   `restoreBankTransactions(transactionIds)`.
2. **The inbox by bank account.** The account cards and the account picker
   show each account's waiting count, and the table shows one account's
   transactions. `bankInbox` filters by bank (`itemId`), not by account.
   Wanted: an `accountId` argument, and the count per account (or
   `total` per account in one call).
3. **The bank's own balance.** Each account card shows *Bank: $x* beside
   *Posted: $y*. Plaid returns balances; gl-node does not pass them on.
   Wanted: `BankAccount.currentBalance` (and when it was read).
4. **Splitting a bank transaction.** The old *Split* posts one bank line
   against several accounts with their own amounts and memos.
   `classifyBankTransactions` takes one account. Wanted: `ClassifyInput`
   with lines (`account`, `amount`, `narration`) that must add up to the
   bank amount.
5. **Booked bank transactions of an account.** The Posted tab lists what was
   booked from the feed for one account. Today that is `journal(account)`
   filtered in the browser by a `^plaid-…` link, a page of 100 at a time.
   Fine to start; a filter on links (`journal(link: "plaid-")`) would avoid
   paging through hand entries.
6. **A ledger created ready for people's keys.** Creating a company calls
   `addLedger`, then `grantAccess` on the new ledger. `grantAccess` needs a
   ledger that signs, and `addLedger(name)` with no settings makes one with
   no mesh. The UI will pass `settings: '{"signing":{"enabled":true}}'`;
   please confirm that is the intended way, or give `addLedger` a flag.
7. **Report columns in one request.** The old reports show a column per
   week, month, quarter or year, or a comparison with another period. The
   UI can ask for one report per column, about seven per request under the
   query-cost limit. Fine to start; `incomeStatement` taking a list of
   periods would make a twelve-month report one call.
