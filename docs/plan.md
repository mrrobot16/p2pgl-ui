# Plan: the OpenLedger web UI on gl-node

Status: draft, 2026-11-24, for the maintainer's review before any code.

The decisions behind this app are in openledger-v2's
`docs/build-log/011-web-ui-on-gl-node/` (intent.md decisions 4, 7, 10, 11, 12
and 13 above all). This file is this repo's own plan: how the app is built,
in what order, and what it waits for.

## What it is

A new web app, written from scratch, with the old app's features and its
UI/UX unchanged, so that someone who used the old app would not notice the
backend changed. The old app (`.do_not_commit_ignore/newgl-ui`, read-only)
is the reference for every screen: its layout, copy, colours, themes, font
stack and icons. The product's name is **newGL** (maintainer, 2026-11-25;
the old app said *New GL*). The backend is gl-node's GraphQL API; this repo
never edits openledger-v2.

## Architecture

- **Next.js static export** (`output: "export"`), no server routes, no
  middleware; deployed on Vercel later. Every page is a client page.
- **The browser calls gl-node directly:** `https://<node>/ledgers/<name>/graphql`
  for a company's books, `https://<node>/node/graphql` with the operator key
  only to create a company. Each request sends `X-Api-Key`.
- **A typed client generated from the two schema files.** graphql-codegen
  reads `docs/api/schema.graphql` and `docs/api/node-schema.graphql` from
  openledger-v2 (path set in one place, `codegen.ts`) and our `.graphql`
  operation files, and writes typed operations (as strings, so no GraphQL
  library ships to the browser). The generated files are committed: a
  build, on Vercel too, never needs openledger-v2. One small `fetch`
  wrapper sends them (`src/lib/gl-node/client.ts`). No Apollo, no urql.
- **Companies live in `sessionStorage`:** each one is a node URL, a ledger
  name, a key and a display label. The picker switches between them.
  Switching is a hard boundary: the page reloads, so nothing fetched for the
  previous company survives. The operator key is used for one create and
  never stored.
- **Sign-in is pasting a key.** The sign-in screen sits behind one interface
  (`signIn(company) → session`), so entry 013's email and password can
  replace the form without touching the screens behind it.
- **Nothing on screen is a stub.** A screen, button, column or menu item
  appears only once gl-node has the query behind it. Where the old app shows
  a placeholder (a disabled button, a "isn't available yet" toast), we leave
  it out too. Areas that aren't backed stay out of the navigation.
- **Money is exact.** gl-node sends amounts as decimal strings. They are
  never turned into JavaScript numbers. Sums the screen makes itself (parent
  account rollups, section subtotals) use a decimal library, and formatting
  works on the string.
- **Report totals are added up from one answer** (gl-node session,
  2026-11-27, checked in `crates/ledger/src/read_model.rs`). The node gives
  `totalDebit` and `totalCredit` on the trial balance and `net` on the
  income statement; every other total (Total for Assets, Liabilities,
  Equity, Liabilities and Equity, Income, Expenses, and parent accounts) is
  the UI's exact sum of rows, under these rules:
  - A row is one account's own postings only: a parent's row doesn't
    include its children, and an account with no postings in the range has
    no row. A parent's subtotal is its own row (if any) plus every row
    under it; a parent with no row is a heading the UI draws.
  - Rows carry their stored sign: Assets and Expenses positive; Income,
    Liabilities and Equity (`Equity:Net-Income` included) negative. Add up
    first, then flip the sign for display only.
  - `net` is −(sum of income + sum of expenses). Net Income on screen is
    always the node's `net`, never a sum the UI made.
  - Each currency is added up on its own, with no conversion. A
    transaction that changes currency (a price or cost) leaves the
    per-currency sums uneven, so no "out of balance" warning is ever built
    from assets + liabilities + equity.
  - When an answer says `exact: false`, its rows show without any totals:
    a rounded row is the exact figure rounded once, so a sum of rows could
    be off.
  - Every total comes from a single answer; figures from two requests are
    never mixed, since the books may change between them. A report column
    is one answer, so its totals come from that column's report.
- **Accounts get their categories later.** The old screens group accounts by
  13 QuickBooks-style categories. gl-node will carry them as account
  metadata (011 unit 3). Until then, an account's section comes from its
  Beancount root (`Assets`, `Liabilities`, `Equity`, `Income`, `Expenses`),
  and anything that needs the finer category waits.

## Stack

| Piece | Choice | Why |
|---|---|---|
| Framework | Next.js 16, React 19, TypeScript | The old app's versions |
| Package manager, scripts and test runner | Bun: `bun install`, `bun run`, `bun test`, `bunx`; never npm, yarn, pnpm or npx; lockfile `bun.lock`. Enforced: other installers and launchers are refused (CLAUDE.md, Tooling). Next itself runs on Node, launched by Bun (the Bun runtime was measured slower and less reliable) | Decided |
| Styling | Tailwind CSS 3.4, CSS variables for tokens | The old app's version, so its tokens and overrides carry over as they are |
| Icons | lucide-react | The old app's |
| Themes | next-themes, `class` attribute | The old app's mechanism |
| GraphQL | `@graphql-codegen/cli` with `typescript`, `typescript-operations` and `typed-document-node` | Typed operations over plain `fetch` |
| Decimals | `big.js` | Small and exact; enough for adding and comparing amounts |
| End-to-end tests | Playwright | Decided |
| Lint | ESLint with Next's config, plus `id-length` (minimum 2), a rule against one-letter generic type parameters, and `no-restricted-imports` (no `./` or `../`) | The code-style rules |

## Layout of the repo

```
src/app/                    routes (static export)
src/components/ui/          buttons, inputs, selects, modals, tables, toasts
src/components/layout/      app shell, side rail, top header, flyouts, page header
src/components/<area>/      each area's screens
src/graphql/ledger/         operations against a ledger's endpoint (.graphql)
src/graphql/node/           operations against the node endpoint (.graphql)
src/graphql/generated/      codegen output (generated, not edited by hand)
src/lib/companies/          the company list, the active company, switching
src/lib/gl-node/            the fetch wrapper and error handling
src/lib/money/              decimal sums and formatting
src/styles/                 tokens (light and dark) and shell rules
tests/e2e/                  Playwright flows and the gl-node harness
docs/parity/<area>.md       what the old screen does, ticked as it is built
docs/api-gaps.md            what the UI needs and gl-node lacks
```

Imports are absolute (`@/…`) everywhere.

## Errors from gl-node

One place turns gl-node's answers into what the screen shows:

- **HTTP 401** (unknown key, or a ledger name the node does not serve):
  the company's key is refused. The app goes to the sign-in screen for that
  company, with its node and ledger filled in.
- **A GraphQL error coded `FORBIDDEN`:** the key's role is too low. The
  action shows the old app's error toast with a plain message.
- **Network failure** (node down, CORS refused, a plain-HTTP node from an
  HTTPS page): "Can't reach <node>". With a hint to check the node's
  `cors.allowedOrigins` when the browser reports a CORS failure.
- **HTTP 429** (`RATE_LIMITED`, 60 GraphQL requests a minute per address,
  counted separately for each company and for the node endpoint):
  "Too many requests, try again in a moment"; back off, never poll fast.
- **`PLAID_NOT_ENABLED`:** this server doesn't hold the company's bank
  feed (Plaid is set per company per server). Until `me` hides the bank
  screens there, it reads: *This server doesn't hold this company's bank
  feed.*
- **With the operator key only:** HTTP 404 `NO_SUCH_LEDGER` (no company by
  that name) and HTTP 503 `LEDGER_NOT_SERVED` (the company exists but failed
  to start), each with its own plain message.
- **Other GraphQL errors:** shown with the error's message, as the old app
  shows its API's messages.

## The key's role (gl-node 0.5.0, until `me`)

0.5.0 can't say which person or role a key has, and the role isn't worked
out any other way (no probing with `accessList` or `bankInbox`). Every
screen is shown; an action the key's role doesn't allow comes back
`FORBIDDEN`, nothing runs, and the screen says "Your key can't do this"
where it happened. When gl-node ships `me`, screens start hiding what a
role can't do.

## `me` (gl-node unit 2: decided, built once it ships)

`me: Me!` answers any key: `ledger`, `label`, `role` (`READ`, `WRITE`,
`ADMIN`, `OPERATOR`), `userId` and `name` (none for the operator key),
`expires`, and `allowedFields`. Answered by the gl-node session on
2026-11-25:

- **Fetched once per company per tab:** at sign-in (in place of `health`)
  and on switching, and kept. At sign-in it goes alone. Later it may share
  a screen's first request, but only with fields `allowedFields` lists:
  the role check covers the whole request before anything runs, so one
  unlisted field makes the whole request `FORBIDDEN`, `me` included.
- **`allowedFields` decides what shows:** anything not listed is hidden.
  It lists bare root field names, unique across queries and mutations (a
  gl-node test keeps them so). It leaves out what the role forbids, and
  also what this server's settings refuse:
  - the bank fields appear only on the server that holds the company's
    bank feed (Plaid is set per company per server; the others answer
    `PLAID_NOT_ENABLED`), so the same key can see the bank screens on one
    server and not another;
  - the sandbox tools appear only where that Plaid is in sandbox (never
    decided from the UI's own environment);
  - on a local node with auth off, the people fields are left out.

  A listed field can still fail on its arguments or on Plaid itself (a
  bank needing a new login), so those errors are still handled.
- **`label`** is the company's display name, a record in its books (the
  latest wins on every server). The picker and report headers show it,
  or the name as typed until one is set. `setLabel` (admin or operator;
  1 to 100 characters) sits in Settings, *Company name*; `addLedger(…,
  label)` lets create company ask for a business name first.
- **`name`** fills the account menu and the avatar's initials;
  *Operator* for the operator key.
- **`expires`** is the last day the key works, in UTC: it stops at 00:00
  UTC the next day. The account menu says *works until Dec 31*, and may
  add the local time of that 00:00 UTC.

## Navigation in the first stage

The rail keeps the old order and look, showing only what is backed:

| Old rail item | First stage |
|---|---|
| Logo, Home | Logo stays and opens Bank Transactions, as `/` does. Home is hidden until its dashboard is backed (register, entry forms), then comes back (question 2) |
| Reports | Shown: Standard Reports with Trial Balance, Balance Sheet, Profit and Loss |
| Accounting | Shown: Bank Transactions, Chart of Accounts |
| Expenses, Sales, More apps | Hidden: nothing in them is backed |
| Settings | Hidden: AI, Billing, Organization and Ledger are not backed |

## Order of work

Each step starts with its parity checklist and ends with its unit tests and
Playwright flows passing against a local gl-node. I stop for review at the
end of each step, and commit only when the maintainer says so.

1. **Scaffold.** Next.js, TypeScript, Tailwind, bun, static export,
   codegen wired to the two schema files, ESLint with the code-style rules,
   `bun test`, Playwright with the gl-node harness. Proof: `next build`
   exports, lint and both test runners pass on an empty app.
2. **App shell and themes** (`docs/parity/app-shell.md`). Tokens and the
   light and dark themes ported from the old
   `src/styles/tailwind-overrides.css` and `globals.css`; the UI kit (button, input, select, modal, table, toast,
   skeleton, badge, card, checkbox); side rail, top header, flyouts, page
   header, the All apps sub menu.
3. **Companies and sign-in** (`docs/parity/companies.md`). Add, pick,
   switch, create with the operator key, sign out. The first page that
   proves the browser-to-node path: CORS, a key, one call.
3b. **Sign-in to the 0.5.0 contract** (`docs/parity/companies.md`). The
    operator key's 404 and 503 answers; "Your key can't do this" for
    `FORBIDDEN`; the Companies screen only when
    `/node/graphql` answers with GraphQL (a server set up by the installer
    keeps it unreachable on purpose), otherwise the hint `sudo openledger
    company add NAME`; the new person's key from creating a company shown
    once, with a copy button.
4. **Reports** (`docs/parity/reports.md`, read). Standard Reports index,
   Trial Balance, Balance Sheet, Profit and Loss (`trialBalance`,
   `balanceSheet`, `incomeStatement`).
5. **Chart of accounts** (`docs/parity/chart-of-accounts.md`). The list
   and one account's balance (`accounts`, `account(name, at)`, read); open
   and close accounts (`openAccount`, `closeAccount`, write).
6. **Transactions** (`docs/parity/transactions.md`). The journal, paged
   on the node, 100 to 500 rows a page (`journal`), one transaction
   (`transaction`), read; entering one (`appendTransaction`, write; at most
   7 in one request). No editing, voiding or deleting: the ledger is
   signed and append-only, so a correction is a new, reversing entry.
7. **Bank transactions** (`docs/parity/bank-transactions.md`, write). The
   inbox (`bankInbox`), posting (`classifyBankTransactions`) and excluding
   (`ignoreBankTransactions`), the Update button.
8. **Banks** (`docs/parity/banks.md`, admin). Connected banks, Plaid Link
   (`createPlaidLinkToken`, `connectBank`), mapping accounts, refresh,
   fetch, sync, disconnect, webhooks. The sandbox tools
   (`connectSandboxBank`, `fireSandboxWebhook`, `resetSandboxLogin`) wait
   for `me`: only `allowedFields` can say a server's Plaid is in sandbox.
   Until `me` ships, a server without the company's bank feed answers
   `PLAID_NOT_ENABLED`, shown in plain words where it happens.
9. **People** (`docs/parity/people.md`, admin). `accessList`,
   `grantAccess` (the new key shown once, with a copy button and a line
   saying it can't be shown again), `revokeAccess`, `renameUser`.
10. **Node status** (`docs/parity/node-status.md`, read). `health`,
    `verify`, `peers`.
11. **Companies** (`docs/parity/companies-screen.md`, operator key, node
    endpoint). `ledgers`, `addLedger`, `removeLedger`, `restartLedger`,
    `inviteLedger`, `joinLedger`, `acceptLedger`; shown only where
    `/node/graphql` answers.

How a screen gets built: only once gl-node serves what it needs. No mock
data, no stand-ins, no workarounds. What a screen can't do goes in
`docs/api-gaps.md` as **blocked: needs endpoint X**, or as **needs a
decision** when it changes existing rows (register editing, void, delete,
batch edits, cleared and reconciled flags, overwriting the `.bean`,
restoring old versions): on an append-only ledger those need a product
decision before anyone designs an endpoint. Before building a new unit,
the node side writes down its exact GraphQL addition for us to comment on;
the screen is built once that unit ships.

Not in gl-node 0.5.0, so not built or faked: live updates
(`transactionAppended` is in the schema, but no WebSocket serves it:
refresh after an action, or poll slowly), `me` and a company display name
(the next node release; until then the company's name as typed), editing,
voiding or deleting transactions, and the store areas (vendors,
customers, invoices, bills, reconciliation, recurring, receipts, `.bean`
upload and download). When a step is blocked by one of these, it goes in
`docs/api-gaps.md`; that list sets the order of the next node releases.

## Performance

The frontend rules are the `performance` skill. Two of them are built in
(maintainer, 2026-11-25):

- **The React Compiler** memoizes components at build time, so big screens
  don't redraw what didn't change. Measured when it was turned on: clean
  builds 9 s before, 9 to 11 s after; first-load JavaScript up 2 to 5 KB
  a page (about 2%).
- **Budgets that fail a commit:** `bun run budget` (first-load JavaScript
  at most 250 KB gzipped per page) and `tests/e2e/app/budgets.spec.ts` (per
  screen: at most one gl-node request on opening, content within 2 s, LCP
  within 1.5 s, CLS within 0.05). From step 4, data screens are measured on
  a large test ledger.

## Testing

- **`bun test`** for logic with no browser: the account tree and rollups,
  decimal sums and formatting, report period presets and compare ranges,
  the company store, error mapping.
- **Playwright against a real gl-node.** A harness starts the gl-node
  binary (`GL_NODE_BINARY`, defaulting to openledger-v2's
  `target/release/gl-node`; this repo never builds it) on loopback with a
  temporary data folder, `cors.allowedOrigins: ["http://localhost:3000"]`
  and a generated operator key. Each flow creates its own company through
  the UI or the node endpoint. Totals on screen are checked against what
  gl-node returns for the same query. For report totals the UI adds up, a
  seeded single-currency ledger checks that Total Income − Total Expenses
  (display signs) equals `net`, that assets + liabilities + equity (stored
  signs) is 0, and that the trial balance's sums match `totalDebit` and
  `totalCredit`.
- **Seeding books goes through the `.bean`, never the API** (openledger-v2
  session, 2026-11-25). The API allows at most 7 `appendTransaction` a
  request and 60 requests a minute, so 10,000 entries would take about 24
  minutes and spend the tests' own request budget. Instead: create the
  company with `addLedger`, stop gl-node, append `open` lines then
  transactions (no `openledger-*` metadata; every account opened on or
  before its first use) to the ledger's `.bean` (the `ledgerPath` its
  `ledger.json` names), start gl-node again, and it adopts and signs them
  at boot. One `trialBalance` then checks the counts and totals. The large
  test ledger is written once and copied for each run.
- **The 60-a-minute limit is shared by the whole run, per company:**
  gl-node counts GraphQL requests per client address and per company
  (each `/ledgers/<name>/graphql`, and `/node/graphql`, has its own
  count), every Playwright worker is 127.0.0.1, and the limit can't be
  changed. Tests that share a company share its 60; tests mostly make
  their own company, and creating one costs one request on the node
  endpoint. If a run outgrows that, each worker gets its own gl-node. A rate-limit refusal
  in a test is a test-design problem, not a UI bug, and is reported as
  such.
- **Plaid** flows run in Plaid's sandbox when the gl-node under test has
  sandbox credentials, using `connectSandboxBank` to skip Link. Without
  credentials those flows are skipped, and the run says so.
- **Side by side with the old app.** Each screen is compared with the old
  one. Where the old app cannot run (it needs its Supabase backend), the
  comparison is against its code and the impeccable skill's screenshots of
  ours.

## Questions for the maintainer

1. **Themes.** *Answered 2026-11-24:* Light and Dark only, as the old menu
   offers. The old app's three hidden skins (Modern, America 250, Pretty)
   are not ported at all.
2. **Home.** *Answered 2026-11-24:* Home stays out of the rail until its
   dashboard is backed, and the logo and `/` open Bank Transactions. Home
   comes back later: its greeting, create actions and dashboard metrics
   are owed once the register and entry forms exist.
3. **Copy that names someone else.** *Answered 2026-11-24:* the chart of
   accounts' column reads *Balance* (not *QuickBooks balance*), and report
   headers show the active company's label (not the placeholder *John Doe*).
4. **Removing a company.** *Answered 2026-11-24:* the trash icon forgets the
   company in this browser only; the ledger stays on its node, untouched.
5. **Fetching bank transactions.** *Answered 2026-11-24:* yes, an *Update*
   button on Bank transactions calls `fetchBankTransactions` for every
   connected bank (admin keys).
6. **Report options that did nothing.** *Answered 2026-11-24:* they are
   left out, and *Display columns by* defaults to *Total only* (one Total
   column); its options are Total only, Weeks, Months, Quarter, Years.

## Risks

- **CORS and desk machines.** The app on Vercel is HTTPS; a node on a
  desk machine over plain HTTP is refused by the browser unless it is
  localhost. Local development is fine; real use needs an HTTPS node.
- **Query cost.** gl-node allows a weight of 4,096 per request and a report
  weighs 512, so at most about seven reports in one request. A columnar
  report (one column per month, say) is split into several requests.
- **Unknown role.** Until `me` exists, the app cannot tell a read key from
  an admin key, so an action can be shown and then refused (`FORBIDDEN`).
  The message must be clear; `me` fixes it.
- **sessionStorage ends with the tab.** Keys are pasted again in every new
  tab and after the browser closes. That is the decision for now; entry
  013's sign-in replaces it.
