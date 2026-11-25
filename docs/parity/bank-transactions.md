# Parity: bank transactions

Status: checklist written 2026-11-24; nothing built.

Old app: `src/app/(app)/all-apps/bank-transactions/page.tsx`,
`src/components/accounting/bank-transactions-page.tsx` and its parts
(`bank-txn-detail-form.tsx`, `split-transaction-modal.tsx`,
`bank-txn-suggestions.tsx`, `bank-txn-row-suggestion.tsx`).

**The model changed.** The old screen kept its Pending queue in the
browser's localStorage, filled by hand or with sample data; there was no
bank feed (*Link account* said it wasn't available). Here the Pending tab is
gl-node's bank inbox, filled from Plaid (entry 008), and connecting a bank
is real. So this screen gains a flow the old one never had: connecting a
bank and mapping its accounts. That flow has no old screen to copy; it is
built from the old app's own parts (split button, side modal, select,
toasts) and goes through the impeccable skill as new work inside the old
visual language.

gl-node: `connectedBanks`, `bankInbox(itemId, first, offset)`,
`classifyBankTransactions`, `ignoreBankTransactions`,
`createPlaidLinkToken`, `connectBank`, `mapBankAccount`,
`unmapBankAccount`, `refreshBankAccounts`, `disconnectBank`,
`fetchBankTransactions`, `account(name)`, `accounts`,
`journal(account, …)`. The inbox needs a write key; connecting and mapping
need an admin key.

Marks: `[ ]` to build, `[x]` built and checked, **waiting:** a gl-node API,
**left out:** an old placeholder or a local-only feature with no place now,
**changed:** must differ, **new:** not in the old app.

## Route and header

- [ ] `/app/banking` (the old `/all-apps/bank-transactions`; see CLAUDE.md), page title *Bank Transactions*, inside
      the All apps sub menu
- [ ] Page header: *Accounting / Bank transactions*, title *Bank
      transactions*
- [ ] Quick-add menu (new expense, deposit, …): **waiting:** entry forms
- [ ] *Link account* split button: **changed:** opens Plaid Link
      (`createPlaidLinkToken`, then `connectBank` with the public token);
      success toast names the bank; then the mapping panel (below). Its ▾
      lists the connected banks for *Log in again* (`createPlaidLinkToken(itemId)`,
      when Plaid reports `ITEM_LOGIN_REQUIRED` or a consent notice),
      *Refresh accounts* (`refreshBankAccounts`) and *Disconnect*
      (`disconnectBank`, with the old confirm dialog)

## Connecting and mapping (new)

- [ ] Plaid Link loaded from Plaid's script only when needed
- [ ] OAuth banks: the link token kept in sessionStorage before Link opens;
      a return page (`/plaid-oauth`) reopens Link with
      `receivedRedirectUri`; the node's `plaid.redirectUri` points there
- [ ] Mapping panel (the old side modal): each bank account by name and
      last digits, type, a select of open ledger accounts (`accounts`), an
      *Import from* date; *Save* calls `mapBankAccount`; *Stop importing*
      calls `unmapBankAccount`
- [ ] Errors from the node shown in the panel: `PLAID_NOT_ENABLED` (*Bank
      connections aren't set up on this node.*), `FORBIDDEN` (*Connecting a
      bank needs an admin key.*), Plaid's own messages
- [ ] A bank needing a new login shows a notice on its card with *Log in
      again*

## Account selector and cards

- [ ] The accounts are the ledger accounts mapped to a connected bank
      (**changed:** the old app listed every Bank and Credit Card category
      account; **waiting:** account categories to list unmapped bank
      accounts too)
- [ ] Selector button: round green icon (`Landmark`, `CreditCard` for a
      credit account by Plaid's type), the account's name, chevron
- [ ] Selector menu (460px): *Search by account name* (focused),
      *Hide account cards* / *Show account cards*, *Reorder accounts*
      (**left out**, toast in the old app); one row per account: icon, name
      and Plaid subtype, *Bank balance: $x* (**waiting:** bank balance,
      `docs/api-gaps.md` item 3), *N Transactions* waiting (99+ cap), date
      of the latest booked entry; *No accounts match "x".*
- [ ] Pencil (*Edit <account>*): **later** (account editing)
- [ ] *Last Reconciled: <date> [<account>]* / *Last Reconcile Not Found*
      link in red: **waiting:** reconciliation
- [ ] Cards, three per row, *Show all N accounts* / *Show fewer accounts*;
      the selected card has a 2px green border and stays visible when
      collapsed
- [ ] Card: name, waiting count badge, *Bank: $x* (**waiting:** bank
      balance), *Posted: $y* from `account(name)`, refresh icon and the
      latest booked date
- [ ] Waiting count per account: from the inbox, counted in the browser
      until `bankInbox` filters by account (`docs/api-gaps.md` item 2)

## Tabs and toolbar

- [ ] Segmented tabs *Pending (N)*, *Posted*, *Excluded*
- [ ] *Add transaction* and its inline form: **left out** (local-only rows
      in the old app; a hand entry belongs to the entry forms or drafts)
- [ ] *Load sample transactions*: **left out** (dev-only local data)
- [ ] *Go to bank register*: **waiting:** `register`
- [ ] **new:** *Update* (plan question 5, answered): calls
      `fetchBankTransactions` for every connected bank, then reloads the
      inbox; a toast says what came in (*N new transactions*, or *You're up
      to date*). Admin keys; a refusal (`FORBIDDEN`) says it needs an admin
      key
- [ ] Search (320px) over the description and payee
- [ ] *Filter by date*: All dates, Last 30 days, This month, This year
      (Pending and Posted)
- [ ] *Filter transactions*: All transactions (N), Categorized (N),
      Uncategorized (N) (Pending and Posted)
- [ ] Pager: *a-b of N*, previous, *Page [n] of M*, next; 50 per page;
      resets to page 1 when the tab, search, filters or account change
- [ ] Print, Export, Settings icon buttons: **left out** (they do nothing
      in the old app)

## Pending tab (the inbox)

- [ ] Columns: checkbox, *Date*, *Bank description*, *Spent*, *Received*,
      attachments, comments, *From/To*, *Purpose*, *Match/Categorize*,
      *Action*
- [ ] Rows from `bankInbox`, oldest first as gl-node returns them (the old
      app showed newest first: **changed** only if the maintainer wants
      newest first, decide when building); 50 a page from up to 1,000
      fetched
- [ ] *Date* `MM/DD/YYYY`; *Bank description*: the payee (Plaid's merchant)
      on the first line, the bank's description below in the small red
      uppercase line
- [ ] *Spent* / *Received* from the amount's sign (money out is negative)
- [ ] Attachments column (paperclip, upload): **waiting:** the store's
      files
- [ ] Comments column: **left out** (disabled in the old app)
- [ ] *From/To*: **waiting:** vendors and customers (store). Until then
      the payee Plaid gave is shown and sent with the booking
- [ ] *Purpose* (Business / Personal): **waiting:** somewhere to keep it
      (entry metadata)
- [ ] *Match/Categorize*: a select of open Income and Expenses accounts
      (**changed:** the old list was the Expense, Other Expense, Income and
      Other Income categories; **waiting:** categories to match it exactly)
      with each account's root as its right label; the choice is kept for
      the session until posted
- [ ] Category suggestions and the new-vendor marker: **waiting:** bank
      rules and suggestions
- [ ] *Post*: `classifyBankTransactions` with the account, payee and
      narration; *Select a category first* when none; toast *Transaction
      posted*; a refused one shows its code's message
      (`ALREADY_BOOKED`, `ACCOUNT_NOT_MAPPED`, `ACCOUNT_NOT_OPEN`, …)
- [ ] ▾ *Split*: **waiting:** split booking (`docs/api-gaps.md` item 4);
      *Create rule*: **waiting:** bank rules; *Exclude*:
      `ignoreBankTransactions`, toast *Transaction excluded*
- [ ] Row expands into the detail form: *Bank account*, *Transaction type*,
      *Date*, *Full bank description*, category, *Memo* (sent as the
      narration), *Post*, *Exclude*, close. *Purpose*, *From/To*,
      *Product/Service*, *Files*, *Show suggestions*: **waiting** as above
- [ ] Empty: *No pending transactions.*; loading: *Loading…*

## Posted tab

- [ ] Rows: entries of the selected account booked from the feed
      (`journal(account)` with a `plaid-…` link), newest first
- [ ] Columns: checkbox, *Date* (sort arrow), *Bank description*, *Spent*,
      *Received*, comments (**left out**), *From/To*, *Purpose*
      (**waiting**), *Match/Category* (the other account, *Split* when
      several), *Transaction Posted*, *Action*
- [ ] *Transaction Posted* link to the register: **waiting:** `register`
      and entry type metadata; shows the date until then
- [ ] Row expands: *Description* (*<account> shows this as <b>x</b>*) and
      *Memo*
- [ ] *Undo*: **waiting:** corrections (014)
- [ ] Empty: *No posted transactions.*

## Excluded tab

- [ ] Columns: checkbox, *Date*, *Bank description*, *Amount*, *Action*
- [ ] Rows and *Undo*: **waiting:** listing and restoring ignored items
      (`docs/api-gaps.md` item 1). Until then the tab shows only what was
      excluded in this session, from the answers to `ignoreBankTransactions`,
      with no Undo — or the tab waits: decide when building, with the
      maintainer
- [ ] *Delete* (local rows in the old app): **left out**

## Selection bar

- [ ] Dark sticky bar at the bottom when rows are selected: *N money out
      transactions -$x* / *N money in transactions $x* / *N transactions*;
      close (*Clear selection*)
- [ ] Pending: *Post* (one `classifyBankTransactions` call for up to 200;
      toast *N transactions posted*, *K still need a category.*, or
      *Nothing was posted*) and *Exclude* (one `ignoreBankTransactions`
      call; *N transactions excluded*)
- [ ] Posted: *Undo* (**waiting:** corrections), *Edit* and *New message*
      (**left out**, disabled in the old app)
- [ ] Excluded: *Undo* (**waiting**, as above)

## States and roles

- [ ] No connected bank: **changed** from the old *No bank or credit card
      accounts yet. Add one from Chart of Accounts.* to a line with *Link
      account*; wording for the maintainer to approve
- [ ] A read key: the inbox is refused (`FORBIDDEN`): the page says the key
      can't see the bank inbox; **waiting:** `me` to say it before asking
- [ ] Plaid not enabled on this node: the page says so instead of *Link
      account*

## Proof

- [ ] bun test: spent and received from signed amounts, the selection
      summary, filters and counts, page maths, booking result messages
- [ ] Playwright against a local gl-node with Plaid sandbox credentials:
      connect a sandbox bank (`connectSandboxBank`), map an account, fetch,
      post one row and see it in Posted and in the account's balance,
      exclude one, post several from the selection bar. Skipped, and
      reported, without credentials
