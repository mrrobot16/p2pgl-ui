# Parity: chart of accounts (read-only)

Status: checklist written 2026-11-24; nothing built.

Old app: `src/app/(app)/all-apps/chart-of-accounts/page.tsx`,
`src/components/settings/chart-of-accounts-page.tsx`,
`src/components/bank-register/add-account-modal.tsx`,
`src/lib/accounting/account-hierarchy.ts`, `src/constants/ui.ts`
(`ACCOUNT_CATEGORY_LABELS`).

gl-node: `accounts { name openedOn closedOn currencies }` for the list,
`trialBalance(at: today)` for every account's balance in one call (the
`accounts` query carries no balances).

This first stage is read-only, as decided: creating, editing and closing
accounts come later, even where gl-node could already do part of it
(`openAccount`, `closeAccount`).

Marks: `[ ]` to build, `[x]` built and checked, **waiting:** a gl-node API,
**left out:** an old placeholder, **later:** a write action, out of this
read-only stage.

## Route and frame

- [ ] `/all-apps/chart-of-accounts`, page title *Chart of Accounts*, inside
      the All apps sub menu
- [ ] Page header: breadcrumb *Accounting / Chart of accounts*, title
      *Chart of accounts*

## Breadcrumb row, right side

- [ ] *Jump to Last* (green pill): **later**; it jumps to the account last
      opened or edited, and nothing can be opened or edited yet
- [ ] *Feedback*: **left out** (toast *Feedback isn't available yet*)
- [ ] *Open in a new window* (`SquareArrowOutUpRight`): opens the same URL
      in a new tab
- [ ] *Toggle full screen* (`Maximize`); toast *Full screen isn't available
      in this browser* when it fails

## Title row actions

- [ ] *Reconcile Dashboard*: **waiting:** reconciliation (after 014)
- [ ] *Clean up* ▾: **left out** (toast *Clean up isn't available yet*)
- [ ] *Run report*: **left out** (toast)
- [ ] *New account* split button and *Import accounts*: **later**
      (and **waiting:** account categories for the type field)

## Toolbar

- [ ] *Filter by name or number* (246px, search icon): filters by the
      account's name; **waiting:** account codes (011 unit 3) for *number*
- [ ] *Filter by account type* (All + the 13 types): **waiting:** account
      categories; until then the select lists the five roots, the closest
      backed grouping, or is left out: decide when building, with the
      maintainer
- [ ] *-- Default Account Filter --* (the RightTool presets, stored in
      localStorage `newgl:chart-default-filter`): **waiting:** account
      categories and detail types
- [ ] *Batch edit*: **later**
- [ ] Export, Print, Settings icon buttons: **left out** (they do nothing
      in the old app)
- [ ] Pager *Previous · 1 - N · Next*, with Previous and Next greyed (the
      whole chart on one page, as in the old app)

## Table

- [ ] Fixed layout, min 1000px, scrolls sideways; column widths as the old
      table (2.8 / 26.2 / 24.2 / 18.2 / 9.9 / 8.7 / 10 %); 48px header and
      rows; hairline dividers between columns; row hover colour
- [ ] Select-all checkbox (`qbo-checkbox`, indeterminate when some) and a
      checkbox per account row; a rollup row that is not an account has a
      disabled checkbox. Selection does nothing else yet, as in the old app
- [ ] *Name*: the account's last segment, indented by depth (1.25rem per
      level), with a collapse chevron when it has children (*Expand* /
      *Collapse*)
- [ ] *Account type* (with the sort arrow): **waiting:** account
      categories; until then blank
- [ ] *Detail type*: **waiting:** account detail types; blank until then
- [ ] *Balance* header (**changed** from *QuickBooks balance*, plan
      question 3, answered). Values: the balance
      from `trialBalance(at: today)` in the account's normal direction; a
      parent shows the sum of its subtree (rollup); `$0.00` for none
- [ ] *Bank balance*: `--` for every account, as in the old app;
      **waiting:** the bank's own balance (`docs/api-gaps.md` item 3)
- [ ] *Action* header with the green *New* tag
- [ ] Order: the old app sorts by its 13 types (Bank, A/R, Other Current
      Assets, …); **waiting:** categories. Until then by root (Assets,
      Liabilities, Equity, Income, Expenses) and then by name
- [ ] Closed accounts (`closedOn` set) are left out, as the old app leaves
      out archived ones

## Row actions

- [ ] *View register*: **waiting:** `register` (011 unit 6)
- [ ] *Run report* for income and expense accounts (P&L Detail for that
      account): **waiting:** P&L Detail (011 unit 7)
- [ ] ▾ menu: *Link account* (disabled in the old app): **left out**;
      *Edit*, *Create subaccount*, *Make inactive (won't reduce usage)*:
      **later**; *Reconcile*: **waiting:** reconciliation
- [ ] With every row action waiting, the Action cell is empty for now

## States

- [ ] Loading: *Loading…* in the table body
- [ ] Error: the message in red in the table body (*Could not load the
      chart of accounts* when there is none)
- [ ] Empty ledger: the table with no rows and the pager at *0*
- [ ] **changed:** an account holding several currencies shows each
      balance with its currency

## Proof

- [ ] bun test: the rollup tree (parents, rollup rows for path segments,
      collapse), name filter, closed accounts left out, decimal rollups
- [ ] Playwright against a seeded gl-node: every open account listed,
      nested; balances equal gl-node's `account(name)` for a sample; filter
      by name; collapse and expand; new window and full screen buttons
