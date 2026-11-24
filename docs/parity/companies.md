# Parity: companies and sign-in

Status: checklist written 2026-11-24; nothing built.

Old app: `src/components/layout/company-picker.tsx`,
`src/lib/company/company-provider.tsx`, `src/app/(auth)/layout.tsx`,
`src/app/(auth)/login/page.tsx`, `src/components/layout/top-header.tsx`.

Marks: `[ ]` to build, `[x]` built and checked, **waiting:** a gl-node API,
**left out:** an old placeholder, **changed:** behaviour that has to differ
because a company is now a node, a ledger and a key (intent decision 10).

## What a company is now

- **Old:** a server-side company in the tenant's account; the server
  remembered the active one.
- **New:** `{ node URL, ledger name, key, label }` in `sessionStorage`, one
  list per tab, plus the active one. The label is what the picker shows; it
  defaults to the ledger name. **waiting:** `me`'s ledger label, which will
  replace a label typed here.

## Sign-in screen (`/sign-in`)

- [ ] The old auth layout: left half the brand panel (*Double-entry, done
      right*, *Every transaction, perfectly balanced.*, *The GL of
      accountants, by accountants, for accountants.*), hidden below `lg`;
      right half the logo (green and white by theme), the form centred,
      theme menu bottom right. **changed:** no photo (maintainer,
      2026-11-24: keep it simple); the panel's text sits on the brand's dark
      green
- [ ] Heading *Welcome back*, line *Sign in to your books.*
- [ ] **changed:** fields are *Node URL*, *Company* (ledger name) and *Key*
      instead of email and password; the form sits behind one `signIn`
      interface so entry 013 can swap it
- [ ] Checks before calling: node URL is `http(s)://…`; ledger name is 1 to
      40 of `a-z`, `0-9`, `-`; key not empty
- [ ] Checks with the node: one cheap query (`{ health { status } }`) on
      `/ledgers/<name>/graphql`; 401 → *That key isn't accepted for this
      company.*; network or CORS failure → *Can't reach <node>.* with the
      `cors.allowedOrigins` hint
- [ ] On success: the company is added (or its key replaced), made active,
      and the app opens
- [ ] Footer link: old *Don't have an account? Sign up* → **changed:**
      *Don't have a company? Create one* (opens create, below)
- [ ] The key field is a password field; the key never appears in the URL,
      logs or error messages
- [ ] Any page with no active company goes to `/sign-in`

## Company picker (top header)

- [ ] Trigger: `Building2` icon, the active company's label, `ChevronDown`;
      *Switching…* while switching; skeleton of the same size while loading
- [ ] Menu: 256px card under the trigger; closes on outside click and
      Escape
- [ ] One row per company: label; the active one in the link colour
- [ ] Clicking another company switches: full page reload, so nothing from
      the previous company survives (the old app's own approach); clicking
      the active one closes the menu
- [ ] *Primary* tag: **left out** (no primary company; every company is
      equal in the browser)
- [ ] Trash icon and its confirm row (*Delete X? This permanently removes
      its chart of accounts and transactions and can't be undone.*,
      *Delete* / *Cancel*, *Deleting…*, error line): **changed**, plan
      question 4 (forget here, or `removeLedger` on the node)
- [ ] *New company* row (`Plus` icon) opens the add/create form in the menu
- [ ] Add a company you have a key for: node URL, company, key; same checks
      and messages as sign-in; *Add* / *Cancel*, *Adding…*
- [ ] Create a company: node URL, company name (the ledger name), the
      operator key; calls `addLedger` on `/node/graphql`, then `grantAccess`
      (role ADMIN, the name the person gives) on the new ledger with the same
      operator key; keeps the returned key, forgets the operator key; *Create*
      / *Cancel*, *Creating…*
- [ ] Create errors shown under the form: `LEDGER_EXISTS` → *A company with
      that name already exists on this node.*; `INVALID_INPUT` → the node's
      message; 401 → *That isn't this node's operator key.*
- [ ] Create when `addLedger` succeeds and `grantAccess` fails: say so, and
      say the company exists on the node with no key yet (no silent half
      state)
- [ ] Old *Starting point* select (Blank, Starter template, Duplicate an
      existing company): **waiting:** templates and copying a ledger (011
      unit 8, the ledger file); only Blank until then, so the select is
      left out
- [ ] Create needs a ledger that signs: see `docs/api-gaps.md` item 6

## Switching is a hard boundary

- [ ] Every request goes to the active company's URL with its key; nothing
      is cached outside the page
- [ ] After a switch, no screen shows the previous company's data, even for
      a moment (reload)
- [ ] Two tabs keep their own lists (sessionStorage), so two companies can
      be open side by side

## Sign out (avatar menu)

- [ ] *Sign out* forgets every company and key in this tab and goes to
      `/sign-in`
- [ ] *Signing out…* while it runs

## Roles

- [ ] A read key sees reports and the chart; writing actions refused with
      `FORBIDDEN` show a toast, not a broken screen
- [ ] Hiding what the key cannot do: **waiting:** `me`

## Proof

- [ ] bun test: the company store (add, replace key, switch, forget, sign
      out), input checks, error mapping
- [ ] Playwright against a local gl-node: sign in with a person's key;
      wrong key; unknown ledger; node down; create with the operator key
      and land in the new company; switch between two companies and check
      no data crosses; sign out
