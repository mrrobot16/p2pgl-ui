# Product

<!-- impeccable:product-schema 1 -->

Carried over from the old app (`newgl-ui`'s PRODUCT.md), with the backend
facts changed to gl-node. The look, users and principles are unchanged:
this app is the old one rewritten on a new backend, so a user of the old
app would not notice the change (`docs/plan.md`).

## Platform

web

## Users

Small business owners doing their own bookkeeping -- one owner/operator per
company, managing their own bank transactions, reconciliation, and reports
without an external bookkeeper in the loop -- and accountants serving
several companies. The company picker switches between companies, but the
primary user is the owner of those books.

## Product Purpose

A general ledger accounting workspace: bank transactions with
rule-based categorization, reconciliation, double-entry journal entries,
chart of accounts, and financial reports (P&L, P&L Detail, Balance Sheet,
Trial Balance, Aging, By Payee). Every company's books are a Beancount
(`.bean`) ledger the company owns, signed and replicated by gl-node.

## Positioning

The ledger is a real, plain-text Beancount file you fully own --
downloadable, diffable, and usable outside this app (Beancount, Fava) --
not a black-box database locked inside a SaaS vendor. A competitor like
QuickBooks or Xero could not truthfully make the same data-ownership claim.

## Operating Context

- A company is a gl-node ledger: a node URL, a ledger name and a key, kept
  in the browser. One browser can hold several companies -- switching
  companies must never leak data across them.
- The browser calls gl-node's GraphQL API directly; there is no server of
  this app's own.
- The app is rolled out area by area as gl-node gains the queries behind
  each screen; an area that isn't backed yet is not shown.

## Capabilities and Constraints

- Backed by gl-node (Rust, GraphQL): signed, append-only, replicated
  ledgers. A correction is a new record, never a rewrite.
- Company-scoped data isolation is a hard constraint, not a preference.
- Amounts are exact decimals end to end.

## Product Principles

- Data ownership over lock-in: the user's ledger is always a real file they
  can take with them.
- One company's data must never be visible while a different company is
  active -- switching companies is a hard boundary, not a filter.
- Prefer the plain-text ledger as source of truth; the UI is a workspace over
  it, not a replacement for it.
- Small-business-owner-first: workflows should not assume bookkeeping
  expertise the primary user doesn't have.
- Familiarity over novelty: the old app's QuickBooks-familiar look is kept
  screen for screen; changes come later, from feedback.
