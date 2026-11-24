import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: string; output: string; }
  Decimal: { input: string; output: string; }
  TxId: { input: string; output: string; }
};

/** A role, as the admin API names it. */
export type AccessRole =
  /** Everything, including managing people and keys. */
  | 'ADMIN'
  /** Reports, balances, the journal: nothing that changes anything. */
  | 'READ'
  /** Read, and enter transactions and manage accounts. */
  | 'WRITE';

/**
 * An account of the ledger, as `accounts` lists it
 * (`docs/build-log/006-list-accounts`).
 */
export type Account = {
  __typename?: 'Account';
  /**
   * The date of the account's `close` when its last `open` or `close` by
   * date is a `close`; null while it is open. The record as it stands: a
   * posting dated after this `close` (a peer's, or one in the file) makes
   * it inert for this node's writes in that stretch (T98), and it still
   * shows here. A transaction dated before a future-dated `open` or
   * `close` is judged at its own date.
   */
  closedOn: Maybe<Scalars['Date']['output']>;
  /**
   * The currencies a transaction dated on or after the account's latest
   * `open` may use: the union over every `open` of it. Empty means any
   * currency. An earlier transaction is judged by the `open`s dated on or
   * before it.
   */
  currencies: Array<Scalars['String']['output']>;
  /** The account's name, e.g. `Assets:Cash`. */
  name: Scalars['String']['output'];
  /** The date of the account's earliest `open`. */
  openedOn: Scalars['Date']['output'];
};

/** An account and its balances (one per currency). */
export type AccountBalance = {
  __typename?: 'AccountBalance';
  account: Scalars['String']['output'];
  balances: Array<Amount>;
  /**
   * `true` when every figure in `balances` is exactly the account's sum.
   * `false` when one did not fit a `Decimal` at its usual scale and was
   * rounded once, half to even (T76) — reachable only through amounts at
   * widely different scales, such as `1000` plus `0.0000000000000000000000000001`.
   */
  exact: Scalars['Boolean']['output'];
};

/** A decimal amount with a currency (e.g., `1000.00 USD`). */
export type Amount = {
  __typename?: 'Amount';
  currency: Scalars['String']['output'];
  number: Scalars['Decimal']['output'];
};

/** Input for a monetary amount. */
export type AmountInput = {
  currency: Scalars['String']['input'];
  number: Scalars['Decimal']['input'];
};

/**
 * The payload of the `appendTransaction` mutation (M-10).
 *
 * Every field of [`Transaction`] is flattened in, so selections written
 * against the old payload keep working unchanged; `alreadyExisted` is the
 * added interim M-10 signal.
 */
export type AppendedTransaction = {
  __typename?: 'AppendedTransaction';
  /**
   * `true` means this exact economic content was **already in the ledger**
   * — possibly appended by another author — and **nothing new was
   * recorded** by this call (M-10).
   *
   * The content hash covers the economic body only; author, parents,
   * Lamport clock and signature are excluded. So an append whose body
   * already exists is a silent no-op that leaves the first writer's
   * envelope in place, and the mesh attributes the event to them.
   *
   * Callers SHOULD treat `true` as a **warning**, not a success: this event
   * may have been collapsed with an earlier identical one (two identical
   * same-day coffees become a single posting), or squatted by a peer that
   * predicted the content (recurring rent, salary) and published it first.
   * Distinguish a genuinely distinct event by varying the body — a link, a
   * tag, or a more specific narration.
   */
  alreadyExisted: Scalars['Boolean']['output'];
  /** Authoring peer's Iroh `EndpointId`. */
  author: Scalars['String']['output'];
  date: Scalars['Date']['output'];
  /**
   * The user id of the person who entered it through the API
   * (`entered-by`, `docs/build-log/002-users-and-roles`). None: entered
   * with a node's operator key, typed into the `.bean`, or written before
   * people had keys.
   */
  enteredBy: Maybe<Scalars['String']['output']>;
  /**
   * The name of the person in `enteredBy`, as this node's access list
   * knows it — their latest name, kept after their access is revoked. None
   * when no one entered it, or the node keeps no access list or has not
   * heard of them.
   */
  enteredByName: Maybe<Scalars['String']['output']>;
  /** `"*"` (complete) or `"!"` (incomplete). */
  flag: Scalars['String']['output'];
  links: Array<Scalars['String']['output']>;
  narration: Maybe<Scalars['String']['output']>;
  /** Parent `txid`s in the DAG. Empty for genesis transactions. */
  parents: Array<Scalars['TxId']['output']>;
  payee: Maybe<Scalars['String']['output']>;
  postings: Array<Posting>;
  /** Optional Ed25519 signature (hex), present when signing is enabled. */
  signature: Maybe<Scalars['String']['output']>;
  tags: Array<Scalars['String']['output']>;
  txid: Scalars['TxId']['output'];
};

/** A `balance` assertion that did not hold (§3.6, M-08). */
export type BalanceAssertionFailure = {
  __typename?: 'BalanceAssertionFailure';
  /** The asserted account. */
  account: Scalars['String']['output'];
  /** The amount the ledger actually holds on that date, as reported. */
  actual: Scalars['Decimal']['output'];
  /**
   * `true` when `actual` is exactly the sum; `false` when it was rounded
   * once (T76). The assertion itself is always judged on the exact sum,
   * so an assertion can fail even when `expected` equals a rounded
   * `actual`.
   */
  actualExact: Scalars['Boolean']['output'];
  /** The currency both figures are in. */
  currency: Scalars['String']['output'];
  /** The date the assertion is made for. */
  date: Scalars['Date']['output'];
  /** The amount the `balance` directive claims. */
  expected: Scalars['Decimal']['output'];
};

/**
 * Outcome of evaluating the ledger's `balance` assertions (§3.6, M-08).
 *
 * A `balance` directive asserts that an account holds an amount of one
 * currency on a date. Evaluation is read-only: failures are reported here and
 * never reject a transaction or alter a balance, and `pad` directives are not
 * synthesized into the balances an assertion is compared against.
 */
export type BalanceAssertionReport = {
  __typename?: 'BalanceAssertionReport';
  /** How many `balance` directives were evaluated. */
  evaluated: Scalars['Int']['output'];
  /** How many of them did not. */
  failed: Scalars['Int']['output'];
  /** The assertions that did not hold, with expected vs actual. */
  failures: Array<BalanceAssertionFailure>;
  /** Whether every evaluated assertion held. */
  ok: Scalars['Boolean']['output'];
  /** How many of them held. */
  passed: Scalars['Int']['output'];
};

/** Balance sheet: Assets, Liabilities, Equity at a point in time. */
export type BalanceSheet = {
  __typename?: 'BalanceSheet';
  assets: Array<AccountBalance>;
  at: Scalars['Date']['output'];
  equity: Array<AccountBalance>;
  /** `true` when every figure in the report is exact (T76). */
  exact: Scalars['Boolean']['output'];
  liabilities: Array<AccountBalance>;
};

export type BankAccount = {
  __typename?: 'BankAccount';
  accountId: Scalars['String']['output'];
  /** The first date imported (`mapBankAccount`'s `importFrom`). */
  importFrom: Maybe<Scalars['Date']['output']>;
  /**
   * The ledger account its transactions are imported to; null until an
   * admin maps it (`mapBankAccount`), and nothing is imported until then.
   */
  ledgerAccount: Maybe<Scalars['String']['output']>;
  mask: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  subtype: Maybe<Scalars['String']['output']>;
  /** Plaid's account type (`depository`, `credit`, `loan`, …). */
  type: Scalars['String']['output'];
};

/**
 * What became of one transaction of a `classifyBankTransactions` or
 * `ignoreBankTransactions`: done, or refused with a code — the others of
 * the call are done or refused on their own.
 */
export type BankBooking = {
  __typename?: 'BankBooking';
  /**
   * Why not: `NOT_IN_INBOX`, `ALREADY_BOOKED`, `BANK_TRANSACTION_IGNORED`,
   * `ALREADY_IGNORED`, `ACCOUNT_NOT_MAPPED`, `INVALID_INPUT`, or the
   * ledger's refusal of the entry (`ACCOUNT_NOT_OPEN`, …).
   */
  code: Maybe<Scalars['String']['output']>;
  message: Maybe<Scalars['String']['output']>;
  ok: Scalars['Boolean']['output'];
  transactionId: Scalars['String']['output'];
  /** The entry written, when booked. */
  txid: Maybe<Scalars['TxId']['output']>;
};

/** What one `fetchBankTransactions` did. */
export type BankFetch = {
  __typename?: 'BankFetch';
  /** Transactions put in the inbox. */
  added: Scalars['Int']['output'];
  /**
   * Transactions the books hold already (booked, or imported by
   * `syncBank`): skipped.
   */
  alreadyBooked: Scalars['Int']['output'];
  /** Transactions the inbox holds already, waiting or ignored: skipped. */
  alreadyInInbox: Scalars['Int']['output'];
  /** Transactions waiting in the inbox that Plaid removed: dropped there. */
  dropped: Scalars['Int']['output'];
  /**
   * What the accountant should look at: a booked transaction Plaid changed
   * or removed since, one without a currency or amount, one this node could
   * not read.
   */
  needsReview: Array<BankSyncNote>;
  /** Transactions dated before their account's `importFrom`: skipped. */
  skippedBeforeStart: Scalars['Int']['output'];
  /** Pending transactions, skipped: fetched once the bank posts them. */
  skippedPending: Scalars['Int']['output'];
  /**
   * Transactions of accounts not mapped to a ledger account: fetched once
   * `mapBankAccount` maps them.
   */
  skippedUnmapped: Scalars['Int']['output'];
  /**
   * Why the fetch stopped before the end, when it stopped once a page was
   * stored: what it did is kept, and the next fetch goes on from there.
   */
  stoppedBy: Maybe<Scalars['String']['output']>;
  /**
   * Transactions waiting in the inbox that Plaid changed since: updated
   * there.
   */
  updated: Scalars['Int']['output'];
};

/** A page of the inbox. */
export type BankInboxPage = {
  __typename?: 'BankInboxPage';
  /** How many transactions wait (of this bank, when one was asked for). */
  total: Scalars['Int']['output'];
  /** Oldest first, then by Plaid's id. */
  transactions: Array<InboxEntry>;
};

/** What one `syncBank` did. */
export type BankSync = {
  __typename?: 'BankSync';
  /**
   * Transactions whose entry (`^plaid-<transaction id>`) the books already
   * hold: skipped.
   */
  alreadyImported: Scalars['Int']['output'];
  /** Entries written, each flagged `!` for review. */
  imported: Scalars['Int']['output'];
  /**
   * Transactions the bank inbox holds (008), waiting or ignored: left to the
   * bookkeeper, not imported.
   */
  inInbox: Scalars['Int']['output'];
  /**
   * What the accountant should look at, one note per transaction: an
   * imported one Plaid changed or removed since, one the ledger refused
   * (and why), one without a currency or amount, one this node could not
   * read. Nothing is reversed or retried for them; enter what is needed
   * by hand.
   */
  needsReview: Array<BankSyncNote>;
  /** Transactions dated before their account's `importFrom`: skipped. */
  skippedBeforeStart: Scalars['Int']['output'];
  /** Pending transactions, skipped: imported once the bank posts them. */
  skippedPending: Scalars['Int']['output'];
  /**
   * Transactions of accounts not mapped to a ledger account: imported once
   * `mapBankAccount` maps them.
   */
  skippedUnmapped: Scalars['Int']['output'];
  /**
   * Why the sync stopped before the end, when it stopped once a page was
   * stored (Plaid unreachable, the node's disk): what it did is kept, and
   * the next sync goes on from its last page. Null when it finished.
   */
  stoppedBy: Maybe<Scalars['String']['output']>;
};

/** One transaction for review, and why. */
export type BankSyncNote = {
  __typename?: 'BankSyncNote';
  reason: Scalars['String']['output'];
  /** Plaid's transaction id, when there is one this node can repeat. */
  transactionId: Maybe<Scalars['String']['output']>;
};

/**
 * One transaction to book: the account it goes to (the other side of the
 * bank's), and the payee and narration when not Plaid's (an empty one
 * leaves it out).
 */
export type ClassifyInput = {
  account: Scalars['String']['input'];
  narration?: InputMaybe<Scalars['String']['input']>;
  payee?: InputMaybe<Scalars['String']['input']>;
  transactionId: Scalars['String']['input'];
};

/**
 * A bank connected through Plaid: its accounts as Plaid names them, with
 * only the last digits Plaid shows. Never a token or a full number.
 */
export type ConnectedBank = {
  __typename?: 'ConnectedBank';
  accounts: Array<BankAccount>;
  /**
   * The UTC date it was connected (`YYYY-MM-DD`); null when its
   * description could not be stored or read.
   */
  connectedOn: Maybe<Scalars['String']['output']>;
  institutionName: Maybe<Scalars['String']['output']>;
  /** Plaid's id for the connection; `disconnectBank` takes it. */
  itemId: Scalars['String']['output'];
  /**
   * Plaid's error code from the last sync Plaid refused — above all
   * `ITEM_LOGIN_REQUIRED`: open Link with `createPlaidLinkToken(itemId)`.
   * Null once a sync finishes.
   */
  lastErrorCode: Maybe<Scalars['String']['output']>;
  /**
   * Plaid's last consent notice for it, from a webhook —
   * `PENDING_EXPIRATION`, `PENDING_DISCONNECT` (log in again before access
   * ends), `USER_PERMISSION_REVOKED`, `USER_ACCOUNT_REVOKED`. A sync leaves
   * it; a repaired login clears it, as does logging in again through Link
   * with the public token passed to `connectBank`.
   */
  lastNotice: Maybe<Scalars['String']['output']>;
  /** When that notice came (RFC 3339, UTC). */
  lastNoticeAt: Maybe<Scalars['String']['output']>;
  /** When a sync of it last finished (RFC 3339, UTC); null before the first. */
  lastSyncedAt: Maybe<Scalars['String']['output']>;
};

/** What `grantAccess` returns: the person and, this once, their key. */
export type GrantedAccess = {
  __typename?: 'GrantedAccess';
  /** The last day the key is accepted; none, it does not expire. */
  expires: Maybe<Scalars['Date']['output']>;
  /**
   * The person's key, to send as `X-Api-Key`. Shown this once: the node
   * keeps only its SHA-256, so a lost key is replaced by a new grant.
   */
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
  role: AccessRole;
  userId: Scalars['String']['output'];
};

/** Node health status (matches REST `/health` per §2.9). */
export type Health = {
  __typename?: 'Health';
  heads: Scalars['Int']['output'];
  peers: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

/** One transaction to ignore, and why. */
export type IgnoreInput = {
  reason?: InputMaybe<Scalars['String']['input']>;
  transactionId: Scalars['String']['input'];
};

/** A bank transaction waiting to be booked. */
export type InboxEntry = {
  __typename?: 'InboxEntry';
  /** The bank account it is from: Plaid's id, its name and last digits. */
  accountId: Scalars['String']['output'];
  accountMask: Maybe<Scalars['String']['output']>;
  accountName: Maybe<Scalars['String']['output']>;
  /** As the bank account's posting carries it: money out is negative. */
  amount: Amount;
  /** Plaid's category (`FOOD_AND_DRINK`, …): a hint only. */
  category: Maybe<Scalars['String']['output']>;
  date: Scalars['Date']['output'];
  /** The bank's description. */
  description: Maybe<Scalars['String']['output']>;
  /** When it was fetched (RFC 3339, UTC). */
  fetchedAt: Scalars['String']['output'];
  institutionName: Maybe<Scalars['String']['output']>;
  itemId: Scalars['String']['output'];
  /**
   * The ledger account the bank account is mapped to now: the side of the
   * entry booking writes for the bank. Null once unmapped.
   */
  ledgerAccount: Maybe<Scalars['String']['output']>;
  /** Plaid's merchant name, when it has one. */
  payee: Maybe<Scalars['String']['output']>;
  /** Plaid's id for it; booking and ignoring take it. */
  transactionId: Scalars['String']['output'];
};

/** Income statement for a date range. */
export type IncomeStatement = {
  __typename?: 'IncomeStatement';
  /** `true` when every figure in the report, `net` included, is exact (T76). */
  exact: Scalars['Boolean']['output'];
  expenses: Array<AccountBalance>;
  from: Scalars['Date']['output'];
  income: Array<AccountBalance>;
  net: Array<Amount>;
  to: Scalars['Date']['output'];
};

export type MutationRoot = {
  __typename?: 'MutationRoot';
  /**
   * Append a balanced journal entry (FR-1, enforces I1–I3).
   *
   * Appends are idempotent by economic content (FR-1 AC4), so a body the
   * ledger already holds records nothing new. Check `alreadyExisted` on the
   * payload to tell that case apart from a fresh insert (M-10).
   */
  appendTransaction: AppendedTransaction;
  /**
   * Book transactions waiting in the bank inbox (008), up to 200 a call:
   * each one entry — the bank's mapped account with its amount, `account`
   * balancing it — flag `*`, link `^plaid-<id>`, entered by you; it then
   * leaves the inbox. Each is booked or refused on its own (`ok`, `code`).
   * A write key.
   */
  classifyBankTransactions: Array<BankBooking>;
  /** Close an account (FR-3 AC2). */
  closeAccount: Scalars['Boolean']['output'];
  /**
   * Connect the bank Plaid Link just linked: `publicToken` is what Link
   * returned. The node keeps the access token Plaid exchanges it for; this
   * returns the bank's accounts, never the token. Admin only.
   */
  connectBank: ConnectedBank;
  /**
   * Connect one of Plaid's sandbox test banks without Link, for demos
   * (007 step 6c); `ins_109508` is Plaid's "First Platypus Bank". Refused
   * (`PLAID_SANDBOX_ONLY`) unless `plaid.environment` is `sandbox`. Admin
   * only.
   */
  connectSandboxBank: ConnectedBank;
  /**
   * A link token for Plaid Link, which the client app opens to connect a
   * bank (007). With `itemId`, one that logs the person in again to that
   * connected bank instead (Plaid's update mode: an expired login,
   * `ITEM_LOGIN_REQUIRED`), keeping the connection and its history; pass the
   * public token Link hands back to `connectBank`, which keeps the bank as
   * it is and clears its `lastNotice`. Only on the node holding
   * this ledger's bank connections. Admin only.
   */
  createPlaidLinkToken: PlaidLinkToken;
  /**
   * Disconnect a bank: removed at Plaid first, then its token deleted
   * here. `false` when this ledger has no such bank. Admin only.
   */
  disconnectBank: Scalars['Boolean']['output'];
  /**
   * Fetch a bank's new posted transactions into the ledger's bank inbox,
   * writing nothing to the books (008): a bookkeeper books each from there.
   * Shares the bank's place at Plaid with `syncBank`: each transaction goes
   * to whichever runs first, never both. Admin only.
   */
  fetchBankTransactions: BankFetch;
  /**
   * Have Plaid's sandbox send a bank a webhook (007 step 6d), by default
   * `SYNC_UPDATES_AVAILABLE`, which has the node fetch it (`plaid.webhookImport`).
   * Sandbox only. Admin only.
   */
  fireSandboxWebhook: Scalars['Boolean']['output'];
  /**
   * Give a person access (`docs/build-log/002-users-and-roles`): a new
   * person when `userId` is left out — `name` then required — or, for
   * someone on the access list, a new role, expiry and key (their old key
   * stops working; `name` left out keeps theirs). The payload carries the
   * key this once: the node keeps only its hash. `expires` is the last day
   * the key is accepted. Admin only.
   */
  grantAccess: GrantedAccess;
  /**
   * Ignore transactions waiting in the bank inbox (008), up to 200 a call
   * — a transfer already entered by hand, a duplicate: each leaves the
   * inbox with the reason, is never booked and never fetched again. A
   * write key.
   */
  ignoreBankTransactions: Array<BankBooking>;
  /**
   * Import a bank account's transactions to `ledgerAccount`, an open
   * account of this ledger, those dated `importFrom` or later (default: the
   * day the account was opened) (007 step 6). Its earlier transactions
   * arrive at the next `syncBank`. Admin only.
   */
  mapBankAccount: ConnectedBank;
  /** Open an account (FR-3 AC1). */
  openAccount: Scalars['Boolean']['output'];
  /**
   * Read a connected bank's accounts from Plaid again: accounts the bank
   * added since it was connected appear (unmapped), known ones keep their
   * mappings (007 step 6c). Admin only.
   */
  refreshBankAccounts: ConnectedBank;
  /** Change a person's name; their role, expiry and key stay. Admin only. */
  renameUser: Scalars['Boolean']['output'];
  /**
   * Make a sandbox bank need a new login (`ITEM_LOGIN_REQUIRED` at its
   * next sync), to show logging in again (007 step 6c). Sandbox only.
   * Admin only.
   */
  resetSandboxLogin: Scalars['Boolean']['output'];
  /**
   * End a person's access: their key is refused on every node once the
   * record reaches it. Admin only.
   */
  revokeAccess: Scalars['Boolean']['output'];
  /**
   * Import a bank's new posted transactions: one entry each, flagged `!`,
   * against `plaid.suspenseAccount` (007 step 6). Run it again any time:
   * what the books hold already is skipped, and so is what the bank inbox
   * holds (008). Admin only.
   */
  syncBank: BankSync;
  /**
   * Stop importing a bank account: its mapping cleared (007 step 6c).
   * Refused while its bank syncs. Admin only.
   */
  unmapBankAccount: ConnectedBank;
  /**
   * Tell Plaid where to send webhooks (`plaid.webhookUrl`) for every bank
   * this ledger holds: those connected before it was set or since it
   * changed (007 step 6d). New banks get it through their link token. The
   * number of banks updated. Admin only.
   */
  updateBankWebhooks: Scalars['Int']['output'];
};


export type MutationRootAppendTransactionArgs = {
  input: TransactionInput;
};


export type MutationRootClassifyBankTransactionsArgs = {
  items: Array<ClassifyInput>;
};


export type MutationRootCloseAccountArgs = {
  date: Scalars['Date']['input'];
  name: Scalars['String']['input'];
};


export type MutationRootConnectBankArgs = {
  publicToken: Scalars['String']['input'];
};


export type MutationRootConnectSandboxBankArgs = {
  institutionId?: Scalars['String']['input'];
};


export type MutationRootCreatePlaidLinkTokenArgs = {
  itemId: InputMaybe<Scalars['String']['input']>;
};


export type MutationRootDisconnectBankArgs = {
  itemId: Scalars['String']['input'];
};


export type MutationRootFetchBankTransactionsArgs = {
  itemId: Scalars['String']['input'];
};


export type MutationRootFireSandboxWebhookArgs = {
  itemId: Scalars['String']['input'];
  webhookCode?: Scalars['String']['input'];
};


export type MutationRootGrantAccessArgs = {
  expires: InputMaybe<Scalars['Date']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  role: AccessRole;
  userId: InputMaybe<Scalars['String']['input']>;
};


export type MutationRootIgnoreBankTransactionsArgs = {
  items: Array<IgnoreInput>;
};


export type MutationRootMapBankAccountArgs = {
  accountId: Scalars['String']['input'];
  importFrom: InputMaybe<Scalars['Date']['input']>;
  itemId: Scalars['String']['input'];
  ledgerAccount: Scalars['String']['input'];
};


export type MutationRootOpenAccountArgs = {
  currencies: InputMaybe<Array<Scalars['String']['input']>>;
  date: Scalars['Date']['input'];
  name: Scalars['String']['input'];
};


export type MutationRootRefreshBankAccountsArgs = {
  itemId: Scalars['String']['input'];
};


export type MutationRootRenameUserArgs = {
  name: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRootResetSandboxLoginArgs = {
  itemId: Scalars['String']['input'];
};


export type MutationRootRevokeAccessArgs = {
  userId: Scalars['String']['input'];
};


export type MutationRootSyncBankArgs = {
  itemId: Scalars['String']['input'];
};


export type MutationRootUnmapBankAccountArgs = {
  accountId: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
};

/**
 * A currently-connected peer.
 *
 * Carried an `heads: [TxId!]!` field until the 0902 informational finding:
 * nothing ever wrote a head into the registry behind it, so the field reported
 * an empty list on every healthy mesh and read as "this peer has no history".
 * Head exchange happens over the anti-entropy ALPN session, which never
 * touches the peer registry, so the field was removed rather than papered
 * over — a client that needs remote heads needs a resolver backed by that
 * exchange, not this one returning `[]`.
 */
export type Peer = {
  __typename?: 'Peer';
  id: Scalars['String']['output'];
};

/** One person on the access list. */
export type PersonAccess = {
  __typename?: 'PersonAccess';
  /** Past its expiry day: the key is refused until a new grant. */
  expired: Scalars['Boolean']['output'];
  expires: Maybe<Scalars['Date']['output']>;
  name: Scalars['String']['output'];
  role: AccessRole;
  userId: Scalars['String']['output'];
};

/** What the client app opens Plaid Link with. Short-lived (Plaid: 4 hours). */
export type PlaidLinkToken = {
  __typename?: 'PlaidLinkToken';
  /** When Plaid stops accepting it (RFC 3339, from Plaid). */
  expiration: Scalars['String']['output'];
  linkToken: Scalars['String']['output'];
};

/** A single line in a journal entry — an account plus an amount. */
export type Posting = {
  __typename?: 'Posting';
  account: Scalars['String']['output'];
  amount: Amount;
  cost: Maybe<Amount>;
  price: Maybe<Amount>;
};

/**
 * Input for a single posting line.
 *
 * Exactly one posting per transaction may omit `amount` (I2 — elided posting).
 */
export type PostingInput = {
  account: Scalars['String']['input'];
  amount?: InputMaybe<AmountInput>;
  cost?: InputMaybe<AmountInput>;
  price?: InputMaybe<AmountInput>;
};

export type QueryRoot = {
  __typename?: 'QueryRoot';
  /**
   * Everyone who has access to this mesh's API, by user id: name, role and
   * expiry (`docs/build-log/002-users-and-roles`) — never a key or its hash.
   * Admin only.
   */
  accessList: Array<PersonAccess>;
  /**
   * Look up an account's balances.
   *
   * With `at` set this replays every transaction (`balances_at`) — a full
   * ledger scan — so it carries the heavy weight in that form only; the
   * current-balance lookup stays cheap for legitimate multi-account batches.
   */
  account: Maybe<AccountBalance>;
  /**
   * Every account of the ledger with an `open`, sorted by name, whether or
   * not it holds a posting (`docs/build-log/006-list-accounts`).
   *
   * Read off the account state the write rules use, which is rebuilt
   * whenever a record is quarantined: an account whose only `open` is
   * quarantined is not listed, and a bare `close` (no `open`) is not
   * either. For one account's balances, see `account(name:)`.
   *
   * Carries the heavy weight like the other reports (M-45): it walks every
   * account, and the weight rations aliased copies of it per request.
   */
  accounts: Array<Account>;
  /** Balance sheet at a given date (FR-2 AC2). */
  balanceSheet: BalanceSheet;
  /**
   * The bank transactions waiting in this ledger's bank inbox (008), to be
   * booked by a bookkeeper: of bank `itemId`, or of every bank; oldest
   * first, `first` of them (at most 1000) from `offset`. A write key.
   */
  bankInbox: BankInboxPage;
  /**
   * The banks connected through Plaid (007), on the node that holds this
   * ledger's connections: institution, accounts, last digits. Never a token.
   */
  connectedBanks: Array<ConnectedBank>;
  /** Node health status (§2.9 / FR-6 AC1). */
  health: Health;
  /** Income statement for a date range (FR-2 AC3). */
  incomeStatement: IncomeStatement;
  /**
   * Journal of transactions, optionally filtered (FR-2 AC4).
   *
   * Weighted by the page it returns, not as one flat scan (M-45); see
   * [`journal_complexity`].
   */
  journal: Array<Transaction>;
  /**
   * Currently-connected peers (FR-6 AC2).
   *
   * Membership only: the per-peer `heads` list this used to return was
   * always empty (see [`Peer`]).
   */
  peers: Array<Peer>;
  /** Look up a single transaction by its content hash. */
  transaction: Maybe<Transaction>;
  /** Trial balance at a given date (FR-2 AC1). */
  trialBalance: TrialBalance;
  /**
   * Verify DAG integrity and balance assertions (FR-5 AC1, §3.6).
   *
   * `ok`/`errors` cover the structural checks — content hashes (I5), parent
   * links (I8), acyclicity. `balanceAssertions` reports every `balance`
   * directive in the ledger evaluated against the read model (M-08): before
   * this wiring those directives were stored and never checked, so a false
   * claim — hand-edited or gossiped in by an allowlisted peer — read as
   * verified. Evaluation is read-only: a failing assertion is surfaced, not
   * used to reject or adjust anything, and it does not clear `ok`.
   *
   * Carries [`VERIFY_COMPLEXITY`] rather than the flat heavy-resolver weight
   * (M-23): it hashes every directive and sweeps every posting, which is
   * tens of ordinary ledger scans even now that it is linear again.
   */
  verify: VerifyResult;
};


export type QueryRootAccountArgs = {
  at: InputMaybe<Scalars['Date']['input']>;
  name: Scalars['String']['input'];
};


export type QueryRootBalanceSheetArgs = {
  at: Scalars['Date']['input'];
};


export type QueryRootBankInboxArgs = {
  first?: Scalars['Int']['input'];
  itemId: InputMaybe<Scalars['String']['input']>;
  offset?: Scalars['Int']['input'];
};


export type QueryRootIncomeStatementArgs = {
  from: Scalars['Date']['input'];
  to: Scalars['Date']['input'];
};


export type QueryRootJournalArgs = {
  account: InputMaybe<Scalars['String']['input']>;
  from: InputMaybe<Scalars['Date']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  to: InputMaybe<Scalars['Date']['input']>;
};


export type QueryRootTransactionArgs = {
  txid: Scalars['TxId']['input'];
};


export type QueryRootTrialBalanceArgs = {
  at: Scalars['Date']['input'];
};

export type SubscriptionRoot = {
  __typename?: 'SubscriptionRoot';
  /**
   * Notified whenever a transaction is appended to the ledger.
   *
   * Publishes for local writes, remote gossip inserts, and adopted file-watcher entries.
   */
  transactionAppended: Transaction;
};

/** A complete journal entry with DAG metadata. */
export type Transaction = {
  __typename?: 'Transaction';
  /** Authoring peer's Iroh `EndpointId`. */
  author: Scalars['String']['output'];
  date: Scalars['Date']['output'];
  /**
   * The user id of the person who entered it through the API
   * (`entered-by`, `docs/build-log/002-users-and-roles`). None: entered
   * with a node's operator key, typed into the `.bean`, or written before
   * people had keys.
   */
  enteredBy: Maybe<Scalars['String']['output']>;
  /**
   * The name of the person in `enteredBy`, as this node's access list
   * knows it — their latest name, kept after their access is revoked. None
   * when no one entered it, or the node keeps no access list or has not
   * heard of them.
   */
  enteredByName: Maybe<Scalars['String']['output']>;
  /** `"*"` (complete) or `"!"` (incomplete). */
  flag: Scalars['String']['output'];
  links: Array<Scalars['String']['output']>;
  narration: Maybe<Scalars['String']['output']>;
  /** Parent `txid`s in the DAG. Empty for genesis transactions. */
  parents: Array<Scalars['TxId']['output']>;
  payee: Maybe<Scalars['String']['output']>;
  postings: Array<Posting>;
  /** Optional Ed25519 signature (hex), present when signing is enabled. */
  signature: Maybe<Scalars['String']['output']>;
  tags: Array<Scalars['String']['output']>;
  txid: Scalars['TxId']['output'];
};

/** Input for creating a new journal entry (FR-1). */
export type TransactionInput = {
  date: Scalars['Date']['input'];
  /** `"*"` (complete) or `"!"` (incomplete). Defaults to `"*"`. */
  flag?: Scalars['String']['input'];
  links?: Array<Scalars['String']['input']>;
  narration?: InputMaybe<Scalars['String']['input']>;
  payee?: InputMaybe<Scalars['String']['input']>;
  /** At least 2 postings; exactly one may omit `amount` (I2). */
  postings: Array<PostingInput>;
  tags?: Array<Scalars['String']['input']>;
};

/** Full trial balance at a point in time. */
export type TrialBalance = {
  __typename?: 'TrialBalance';
  at: Scalars['Date']['output'];
  /**
   * `true` when every figure — each row and both totals — is exact (T76).
   * With a rounded figure, a total is the exact sum rounded once, so it
   * can differ from the sum of the displayed rows by that rounding.
   */
  exact: Scalars['Boolean']['output'];
  rows: Array<TrialBalanceRow>;
  totalCredit: Scalars['Decimal']['output'];
  totalDebit: Scalars['Decimal']['output'];
};

/** A single row in the trial balance report. */
export type TrialBalanceRow = {
  __typename?: 'TrialBalanceRow';
  account: Scalars['String']['output'];
  credit: Scalars['Decimal']['output'];
  debit: Scalars['Decimal']['output'];
  /**
   * `true` when `debit` and `credit` are exact; `false` when rounded once
   * (T76, see `AccountBalance.exact`).
   */
  exact: Scalars['Boolean']['output'];
};

/** Result of the `verify` query — DAG integrity check. */
export type VerifyResult = {
  __typename?: 'VerifyResult';
  /** Balance assertions evaluated during this verification (§3.6, M-08). */
  balanceAssertions: BalanceAssertionReport;
  /**
   * The first 1,000 structural errors (`ledger::verify::MAX_REPORTED_ERRORS`),
   * one per offending node (L-63).
   */
  errors: Array<Scalars['String']['output']>;
  nodesChecked: Scalars['Int']['output'];
  /**
   * Structural integrity only: content hashes (I5), parent links (I8), and
   * acyclicity. A failed balance assertion does **not** clear this flag —
   * it is a writer's claim, not DAG corruption — so clients that care about
   * assertions must also read `balanceAssertions`.
   */
  ok: Scalars['Boolean']['output'];
  /**
   * Content ids of the records this node holds in its quarantine — in the
   * file, NOT in the DAG, NOT in any balance and NOT served (T81 / M-51,
   * M-52). Sorted. The boot log names why each is there. At most 1,000
   * (`MAX_LISTED_QUARANTINED`; T88 / L-103) — `quarantinedTotal` is the
   * full count.
   */
  quarantined: Array<Scalars['String']['output']>;
  /**
   * How many records the quarantine holds in all, listed or not (T88 /
   * L-103). Saturates at `i32::MAX`.
   */
  quarantinedTotal: Scalars['Int']['output'];
  /**
   * How many further errors were found and not listed in `errors` (L-63);
   * `0` means `errors` is complete. Saturates at `i32::MAX`.
   */
  truncated: Scalars['Int']['output'];
  /** Blocks held as unparsable text, which have no content id (L-45). */
  unparsableBlocks: Scalars['Int']['output'];
};

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type LedgerHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type LedgerHealthQuery = { health: { status: string, version: string } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const LedgerHealthDocument = new TypedDocumentString(`
    query LedgerHealth {
  health {
    status
    version
  }
}
    `) as unknown as TypedDocumentString<LedgerHealthQuery, LedgerHealthQueryVariables>;