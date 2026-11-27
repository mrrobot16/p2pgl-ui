# Parity: reports

Status: checklist written 2026-11-24, report totals ruled on 2026-11-27
(gl-node session). Built: Standard Reports, the shared frame and the Trial
Balance (2026-11-27). To build: Balance Sheet, Profit and Loss, periods,
columns, compare, drill-down.

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

- [x] Title *Standard Reports* (24px semibold), page padding 20px
- [x] A plain list (max width 576px, row dividers), each row the report's
      name and a small trailing icon, link colour on hover
- [ ] Rows: Profit and Loss (`BarChart2`), Balance Sheet (`Scale`), Trial
      Balance (`ListChecks`)
- [ ] P&L Detail, By Payee, A/R & A/P Aging: **waiting:** 011 unit 7
      (hidden until then)
- [x] *Reports* on the side rail (`BookOpen`, as the old app), active on
      every `/reports` page
- [x] QuickBooks' Standard reports page (collapsible groups, favourite
      stars, a search box, the Custom and Management reports sub-menu):
      **left out** while there are three reports; the old plain list stays

## Shared report frame

- [x] Breadcrumb *‹ Standard Reports* (link)
- [x] Tab row of the backed reports; the current one underlined; tabs keep
      the period in their link
- [x] Page title, then the filter row (`header-filters`)
- [x] Report card: max 840px, centred, hairline border; a toolbar row at
      its top (QuickBooks): *Expand all* / *Collapse all* on the left, the
      *Print* button (secondary, small) on the right, both hidden when
      printing. QuickBooks' Compact / Normal view, refresh, email, export
      and more menu: **left out** (the old app has none of them; email and
      export need gl-node)
- [x] Card heading, QuickBooks' order: the report's name, then the active
      company's label, then the date line. **changed:** the old app put the
      label first and showed a placeholder, *John Doe* (plan question 3,
      answered). The label is the ledger name until `me` ships
- [x] Column header row: *Account*, then the value columns (QuickBooks;
      the old app left the first header blank)
- [x] Sections are collapsible rows (chevron, Enter and Space toggle);
      accounts nest by their `:` segments with per-level indent; a parent
      with children collapses its subtree
- [x] A parent, as QuickBooks shows it: a heading row (its own amount on
      it, if it has a row from gl-node), its children, then *Total for
      <parent>*. Collapsed, a section or parent shows its total on its own
      heading row and no total row (QuickBooks; the old app showed parents
      with their own amount only and no subtotal)
- [x] Footer under the table: *Accrual basis* | the date and time the
      answer arrived (QuickBooks). *Add note*: **left out** (needs storage)
- [x] A row from gl-node is one account's own postings: a parent's row
      doesn't include its children, and an account with no postings in the
      range has no row. A parent's subtotal is its own row (if any) plus
      every row under it; a parent with no row (an account without postings,
      or a path segment that is no account) is a heading the UI draws, shown
      only when a row sits under it
- [x] Totals and subtotals are exact sums (`big.js`) of the rows of one
      answer, per currency, in stored signs (Assets and Expenses positive;
      Income, Liabilities, Equity negative); the sign is flipped for display
      only, after adding up (`docs/plan.md`, *Report totals*)
- [ ] Amounts as `$1,234.56`; rows with zero left out
- [x] Filters live in the URL, so a report can be shared and reloaded.
      **changed:** the address changes through `history.replaceState`
      (which `useSearchParams` follows), not `router.replace`: in the
      static export a search-only `router.replace` never commits
- [ ] Loading: the card with its heading and skeleton rows; an error: the
      message in the card; an empty ledger: the sections with no rows and
      zero totals, as the old app shows
- [x] **changed:** amounts are exact decimals from gl-node; a report
      gl-node marks `exact: false` shows its rows with no totals the UI
      would add up (gl-node's own `totalDebit`, `totalCredit` and `net`
      still show), and a note that figures were rounded once
- [ ] **changed:** more than one currency: each figure is shown with its
      own currency; totals per currency, never converted (the old app was
      USD only)
- [x] Every total comes from one answer; figures from two requests are
      never mixed (each column of a columnar report is its own answer)

## Trial Balance (`/reports/trial-balance`)

- [x] *As of* date field, default today, in the URL as `?asOf=`
- [x] Date line *As of YYYY-MM-DD*
- [x] Columns: *Account*, *Debit*, *Credit*
- [x] Sections Assets, Liabilities, Equity, Income, Expenses, each with
      *Total for <section>* in both columns; a section with no rows is left
      out
- [x] Bottom *Total* row (debit and credit totals from gl-node)
- [x] **changed:** amounts without a currency sign. gl-node's trial
      balance adds every currency of an account into one figure with no
      currency named, so the UI can't say which it is (the old app showed
      `$`). Per-currency rows: **waiting:** `docs/api-gaps.md` item 11
- [x] The red notice when debits and credits differ: **left out.**
      Beancount refuses an unbalanced transaction, so in one currency the
      totals always match; with several, the figures differ by design (the
      gl-node session's ruling on the balance sheet's warning, 2026-11-27)
- [x] An account with debit 0 shows `0.00` in that column, as the old app
- [x] Rows from `trialBalance(at)`; section from the account's root
      (**waiting:** account categories only for finer grouping, which the
      old trial balance doesn't use)
- [x] Clicking an amount: **left out** (the old trial balance's drill does
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
- [ ] No "out of balance" warning from assets + liabilities + equity: with
      a transaction that changes currency, the per-currency sums are
      uneven by design (gl-node session, 2026-11-27)
- [ ] Net Income: **changed:** gl-node puts the books' whole net income in
      equity as `Equity:Net-Income`; the old app showed net income from the
      period's *From* date to *To*. Shown as the *Net Income* row (not as an
      account row), with gl-node's figure, so the sheet balances to the
      cent
- [ ] *Retained Earnings* (income before this fiscal year) split from *Net
      Income* (this fiscal year), as QuickBooks shows: **waiting:** a fiscal
      year start and the split on `balanceSheet` (`docs/api-gaps.md` item
      10); until then the one *Net Income* row above
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
- [ ] *Net Income* is gl-node's `net`, never a sum the UI made. As in the
      old app (no Cost of Goods Sold or Other Income categories yet),
      *Gross Profit* is *Total for Income* and *Net Operating Income* is
      `net`; Cost of Goods Sold and Other Income/Expense sections:
      **waiting:** account categories (011 unit 3)
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

- [x] Trial Balance (2026-11-27). bun test: the account tree, parent rows
      and headings, exact sums per currency, formatting, dates. Playwright
      on the small seeded company (`tests/e2e/app/reports.spec.ts`): rows,
      section and parent totals; the sections add up to gl-node's
      `totalDebit` and `totalCredit`; the date in the URL survives a
      reload; collapsing; a refused key; print hides the controls. Budgets
      on the large one (10,000 entries): content in 445 ms, LCP 296 ms, CLS
      0, one request to gl-node; 229.4 KB first-load JavaScript. The
      `exact: false` screen is unit-tested only: gl-node rounds only with
      amounts at widely different scales, which the seeded books don't have
- [ ] bun test: period presets (week starting Monday, quarter edges, leap
      years), compare ranges, columnar periods and the 60 cap, the account
      tree and parent rows, decimal sums, URL round trip
- [ ] Playwright against a seeded gl-node: each report's totals equal
      gl-node's for the same dates; filters in the URL survive a reload;
      drill-down lists the entries; print hides the controls
- [ ] The totals the UI adds up, on a seeded single-currency ledger: Total
      Income − Total Expenses (display signs) equals `net`; assets +
      liabilities + equity (stored signs) is 0; the trial balance's sums
      match `totalDebit` and `totalCredit`; an `exact: false` answer shows
      no added-up totals
