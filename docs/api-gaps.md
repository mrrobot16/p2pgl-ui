# What the UI needs and gl-node lacks

Status: 2026-11-24, from the first four areas' parity checklists. For the
session that builds gl-node's API (openledger-v2 entry 011 and after). Each
line names the screen that waits for it; the screen shows nothing in its
place until it exists.

Each entry is labelled for the node side, which picks its next unit from
this list and writes down the exact GraphQL addition for us to comment on
before building it:

- **blocked: needs endpoint X**: a screen or action 0.5.0 can't do.
- **needs a decision**: it changes existing rows, which an append-only,
  signed ledger doesn't allow as such; it needs a product decision before
  anyone designs an endpoint.

## Needs a decision

Screens and actions of the old app (and QuickBooks) built around changing
rows. Listed so they aren't built as workarounds; each waits for a product
decision on how it works on an append-only ledger.

- Editing a posted transaction (the register's inline edit, the entry
  forms opened on an existing transaction)
- Voiding and deleting a transaction
- *Undo* on a posted bank transaction (bank transactions' Posted tab)
- Batch edits (batch actions on several rows at once)
- The cleared and reconciled flags, and reconciliation itself
- Overwriting the `.bean`, and restoring an old version

## Blocked: needs an endpoint

Already planned in 011 (listed so the screens can point at them):

| Need | Screens waiting | 011 unit |
|---|---|---|
| `me`: the caller's name and role, the ledger's label. *Schema decided 2026-11-25:* `me: Me!` (`ledger`, `label`, `role: CallerRole`, `userId`, `name`, `expires`, `allowedFields`), `setLabel(label)`, `LedgerInfo.label`, `addLedger(…, label)`; `allowedFields` also leaves out the bank fields where the server doesn't hold the bank feed, and the sandbox tools where Plaid isn't in sandbox (answers recorded in `docs/plan.md`, *`me`*); built once unit 2 ships | Top header (name, avatar), company picker label, report headers, hiding what a key's role cannot do | 2 |
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
   *Allowed (gl-node session, 2026-11-25):* the link is documented
   bank-feed data, so choosing rows by it is fine; page with *Load more*,
   and never show a count or total built from the rows loaded so far. A
   filter on links (`journal(link: "plaid-")`) would avoid paging through
   hand entries.
6. **A ledger created ready for people's keys.** Creating a company calls
   `addLedger`, then `grantAccess` on the new ledger. `grantAccess` needs a
   ledger that signs, and `addLedger(name)` with no settings makes one with
   no mesh. Signing alone (`settings: '{"signing":{"enabled":true}}'`) is
   refused at boot without a `p2p.meshId`, so the UI will call
   `addLedger(name, newMeshPorts: …)` (a mesh of its own, which signs).
   *Answered 2026-11-24 (openledger-v2 session):* yes, `addLedger(name,
   newMeshPorts: "4433-4532")` (the installer's UDP range, the UI's
   default), then `grantAccess` on `/ledgers/<new>/graphql` with the same
   operator key. A later gl-node change lets `addLedger(name)` use the
   node's own range; the UI drops the argument then.
7. **Report columns in one request.** The old reports show a column per
   week, month, quarter or year, or a comparison with another period. The
   UI can ask for one report per column, about seven per request under the
   query-cost limit. *Allowed (gl-node session, 2026-11-25):* every number
   still comes from the node; keep within 7 heavy fields a request and the
   rate limit. `incomeStatement` taking a list of periods would make a
   twelve-month report one call.
8. **The browser remembering CORS permission.** gl-node's CORS layer
   (`config.rs`, `cors_layer()`) sends no `Access-Control-Max-Age`, so
   Chrome repeats the permission check (preflight) every 5 seconds and most
   calls cost two round trips. Wanted: `.max_age(…)`, up to 2 hours.
   *Planned, gl-node unit 2:* preflight answers carry
   `Access-Control-Max-Age: 7200` (two hours, Chromium's most).

9. **The GraphQL rate limit is low for a UI, and per address.** gl-node
   allows 60 GraphQL requests a minute per client address, counted
   separately for each company and for the node endpoint
   (`GRAPHQL_RATE_LIMIT` in `rate_limit.rs`, not configurable). One person
   clicking through screens, opening drill-downs and refreshing cached
   data can reach it; and an office behind one public address, several
   accountants together, shares the 60. *Planned, gl-node unit 2c (after
   2b):* a request with a valid key counts against that key; requests
   without one stay counted per address. A refusal looks to the person like
   a broken screen. Wanted: a limit per key rather than per address for
   authenticated requests, or a higher or configurable one. Until then the
   UI keeps to one request per screen, caches answers, and never fetches
   per keystroke (the performance skill).

Until an item lands, its part of the UI stays out (no stubs) or uses the
slower fallback named above (openledger-v2 session, 2026-11-24).
