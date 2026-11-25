# Parity: reports

Status: checklist written 2026-11-24; nothing built.

Old app: `src/app/(app)/reports/*`, `src/components/reports/reports-page.tsx`
(Profit and Loss, Balance Sheet), `trial-balance-page.tsx`,
`report-section.tsx`, `report-account-rows.tsx`,
`src/lib/accounting/account-hierarchy.ts`, `drill-down.ts`,
`src/constants/reports.ts`, `src/constants/ui.ts`.

gl-node: `trialBalance(at)`, `balanceSheet(at)`, `incomeStatement(from, to)`,
`journal(account, from, to, limit, offset)`. The old app built every report
in the browser from all postings; here gl-node computes them, so the
screens group and format what it returns.

Marks: `[ ]` to build, `[x]` built and checked, **waiting:** a gl-node API,
**left out:** an old placeholder, **changed:** must differ.

## Standard Reports (`/reports`)

- [ ] Title *Standard Reports* (24px semibold), page padding 20px
- [ ] A plain list (max width 576px, row dividers), each row the report's
      name and a small trailing icon, link colour on hover
- [ ] Rows: Profit and Loss (`BarChart2`), Balance Sheet (`Scale`), Trial
      Balance (`ListChecks`)
- [ ] P&L Detail, By Payee, A/R & A/P Aging: **waiting:** 011 unit 7
      (hidden until then)

## Shared report frame

- [ ] Breadcrumb *‹ Standard Reports* (link)
- [ ] Tab row of the backed reports; the current one underlined; tabs keep
      the period in their link
- [ ] Page title, then the filter row (`header-filters`)
- [ ] Report card: max 840px, centred, hairline border, *Print* button
      (secondary, small, hidden when printing) calling the browser's print
- [ ] Card heading: the active company's label (28px) **changed:** the old
      one shows a placeholder, *John Doe* (plan question 3, answered); then
      the report's name, then its date line
- [ ] Sections are collapsible rows (chevron, Enter and Space toggle);
      accounts nest by their `:` segments with per-level indent; a parent
      with children collapses its subtree
- [ ] A real parent account with no balance of its own gets a row only when
      a child has one; a path segment that is not an account is a row with
      the children's sum
- [ ] Amounts as `$1,234.56`; rows with zero left out
- [ ] Filters live in the URL (`router.replace`), so a report can be
      shared and reloaded
- [ ] Loading: the card with its heading and skeleton rows; an error: the
      message in the card; an empty ledger: the sections with no rows and
      zero totals, as the old app shows
- [ ] **changed:** amounts are exact decimals from gl-node; a report or
      figure gl-node marks `exact: false` shows a note that it was rounded
      once
- [ ] **changed:** more than one currency: each figure is shown with its
      own currency; totals per currency (the old app was USD only)

## Trial Balance (`/reports/trial-balance`)

- [ ] *As of* date field, default today, in the URL as `?asOf=`
- [ ] Date line *As of YYYY-MM-DD*
- [ ] Columns: blank, *Debit*, *Credit*
- [ ] Sections Assets, Liabilities, Equity, Income, Expenses, each with
      *Total for <section>* in both columns; a section with no rows is left
      out
- [ ] Bottom *Total* row (debit and credit totals from gl-node)
- [ ] Red notice when debits and credits differ: *Debits ($x) and credits
      ($y) don't match — check for unposted or unbalanced entries.*
- [ ] Rows from `trialBalance(at)`; section from the account's root
      (**waiting:** account categories only for finer grouping, which the
      old trial balance doesn't use)
- [ ] Clicking an amount: **left out** (the old trial balance's drill does
      nothing)

## Balance Sheet (`/reports/balance-sheet`)

- [ ] Filters: *Report period* (presets below), *From*, *To*, *Display
      columns by*, *Compare to*; editing a date switches the period to
      Custom
- [ ] Date line *As of <Month D, YYYY>*
- [ ] Assets section: rows from `balanceSheet(to).assets`, *Total for
      Assets*
- [ ] Inside Assets, *Current Assets* › *Bank Accounts* with its total,
      other current assets, *Total for Current Assets*, then *Fixed Assets*
      with its total: **waiting:** account categories (011 unit 3); until
      then every asset is one list under Assets
- [ ] *Liabilities and Equity* section with nested *Liabilities* (total)
      and *Equity* (rows, *Net Income* row, *Total for Equity*), then
      *Total for Liabilities and Equity*
- [ ] Net Income: **changed:** gl-node puts the books' whole net income in
      equity as `Equity:Net-Income`; the old app showed net income from the
      period's *From* date to *To*. Shown as the *Net Income* row (not as an
      account row), with gl-node's figure, so the sheet balances to the
      cent
- [ ] Drill-down from an amount (below)

## Profit and Loss (`/reports/profit-loss`)

- [ ] Same filters as the Balance Sheet, plus *Accounting method* (Cash /
      Accrual): **waiting:** invoices and bills (015); cash and accrual
      differ only for them, so the toggle is left out until they exist,
      and the card says *Accrual basis*
- [ ] Date line: the range (*January 1-November 24, 2026*), *All dates*
      when neither date is set
- [ ] *Income* section (rows, *Total for Income*), *Gross Profit* row,
      *Expenses* section (rows, *Total for Expenses*), *Net Operating
      Income*, *Net Income*
- [ ] From `incomeStatement(from, to)`; *All dates* asks for the ledger's
      first to last date
- [ ] Drill-down from an amount (below)

## Report period presets (P&L and Balance Sheet)

- [ ] This year to date (default), All dates, Today, Yesterday, This week
      (from Monday), This month, This quarter, This year, Last week, Last
      month, Last quarter, Last year, Custom
- [ ] URL: `reportPeriod`, `from` and `to` only for Custom,
      `displayColumnsBy`, `compareTo`; defaults left out of the URL;
      unknown values fall back to the default

## Display columns by

- [ ] Weeks, Months, Quarter, Years: one column per period across the
      range, clipped at its edges, at most 60, labelled *Nov 3*, *Nov 2026*,
      *Q4 2026*, *2026*; P&L adds a *Total* column; Balance Sheet columns are
      as of each period's end
- [ ] One gl-node report per column, split into requests of at most seven
      (query cost); see `docs/api-gaps.md` item 7
- [ ] Customer (the old default), Employee, Product/Service, Vendor, Days:
      **left out** (inert in the old app: each shows the normal single
      column). *Total only* (one Total column) is the default instead
      (plan question 6, answered). Customer, Vendor and Product/Service come
      back with the store and dimensions

## Compare to

- [ ] Previous Year, Previous Period, Year-to-date, Previous year-to-date:
      columns *<range>*, *<compare label>*, *Change ($)*, *Change (%)*;
      percent change against a zero base is 0% or 100% as in the old app
- [ ] *Select Period* (none, the default)
- [ ] Custom period, % of Row, % of Column, % of Expense, % of Income:
      **left out** (inert in the old app)
- [ ] Columnar display wins over compare when both are set

## Drill-down (P&L and Balance Sheet)

- [ ] Clicking an amount opens the section's detail inside the card:
      *Back to Summary* › report › section
- [ ] One block per account: name (segments joined with ` › `), total, then
      a table *Date*, *Description*, *Ref #*, *Amount* and a *Total* row;
      *No transactions in this period.* when empty
- [ ] Section total at the bottom (*Total <section>*)
- [ ] Rows from `journal(account, from, to)`, paged by 100 until done;
      Description is the narration, else the payee
- [ ] *Ref #*: **waiting:** entry metadata (011 unit 4); shows *—* until
      then, as the old app does for an entry with none

## Proof

- [ ] bun test: period presets (week starting Monday, quarter edges, leap
      years), compare ranges, columnar periods and the 60 cap, the account
      tree and parent rows, decimal sums, URL round trip
- [ ] Playwright against a seeded gl-node: each report's totals equal
      gl-node's for the same dates; filters in the URL survive a reload;
      drill-down lists the entries; print hides the controls
