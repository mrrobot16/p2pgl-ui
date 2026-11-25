# Parity: companies and sign-in

Status: step 3 built 2026-11-24. Every line is ticked, waiting for an API,
or arriving with the step named on it.

Old app: `src/components/layout/company-picker.tsx`,
`src/lib/company/company-provider.tsx`, `src/app/(auth)/layout.tsx`,
`src/app/(auth)/login/page.tsx`, `src/components/layout/top-header.tsx`.

Marks: `[ ]` to build, `[x]` built and checked, **waiting:** a gl-node API,
**left out:** an old placeholder, **changed:** behaviour that has to differ
because a company is now a node, a ledger and a key (intent decision 10),
**step N:** built with that step's area.

Code: `src/lib/companies/` (the company, its store, sign-in, create),
`src/components/companies/` (forms, sign-in pages, the gate),
`src/components/layout/company-picker.tsx`, `account-menu.tsx`.

## What a company is now

- **Old:** a server-side company in the tenant's account; the server
  remembered the active one.
- **New:** `{ node URL, ledger name, key, label }` in `sessionStorage`
  (`openledger:companies`), one list per tab, plus the active one. The label
  is what the picker shows; it is the ledger name. **waiting:** `me`'s
  ledger label.

## Sign-in screen (`/sign-in`)

- [x] The old auth layout: left half the brand panel (*Double-entry, done
      right*, *Every transaction, perfectly balanced.*, *The GL of
      accountants, by accountants, for accountants.*), hidden below `lg`;
      right half the logo (green and white by theme, 120px), the form
      centred, theme menu bottom right. **changed:** no photo (maintainer,
      2026-11-24: keep it simple); the panel's text sits on the brand's dark
      green
- [x] Heading *Welcome back*, line *Sign in to your books.*
- [x] **changed:** fields are *Node URL*, *Company* (ledger name) and *Key*
      instead of email and password; *Sign in*, *Signing in…*. The form
      calls one function, `signIn` (`src/lib/companies/sign-in.ts`), so
      entry 013 swaps the form and that function only
- [x] *Sign in with Google*: **left out** (no Google sign-in on gl-node)
- [x] Checks before calling: node URL is `http(s)://` with no path; ledger
      name is 1 to 40 of `a-z`, `0-9`, `-`; key not empty; each with its
      message under its field
- [x] Checks with the node: one cheap query (`health`) on
      `/ledgers/<name>/graphql`; 401 (a wrong key or a ledger the node
      doesn't serve, alike) → *That key isn't accepted for this company.*;
      no answer → *Can't reach <node>. Check the address, that the node is
      running, and that its cors.allowedOrigins includes <this app>.*
- [x] On success: the company is added (or its key replaced), made active,
      and the app opens (a full load)
- [x] Footer link: old *Don't have an account? Sign up* → **changed:**
      *Don't have a company? Create one* (`/create-company`)
- [x] `/sign-in?node=…&company=…` fills in the node and company (for a
      refused key later); never the key
- [x] The key field is a password field; the key is never in the URL or an
      error message
- [x] Any signed-in page with no active company goes to `/sign-in`, and
      renders nothing before storage is read
- [ ] A screen whose key is refused (401) sends the person to sign-in with
      the node and company filled in: **step 4**, with the first screen
      that fetches

## Create a company (`/create-company`, and in the picker)

- [x] Old `/signup` → *Create your company*, *With your node's operator
      key.*; fields *Node URL*, *Company name* (with a hint on its form),
      *Your name*, *Operator key* (with a hint that it isn't kept);
      *Create*, *Creating…*; footer *Already have a company? Sign in*
- [x] Calls `addLedger(name, newMeshPorts: "4433-4532")` on `/node/graphql`
      (the installer's UDP range, `docs/api-gaps.md` item 6), then
      `grantAccess` (ADMIN, the person's name) on the new ledger with the
      same operator key; keeps the returned key; the operator key is cleared
      from the form at once and stored nowhere
- [x] Errors: `LEDGER_EXISTS` → *A company with that name already exists on
      this node.* (under the name); 401 → *That isn't this node's operator
      key.*; a ledger added but not served → the node's reason; others →
      the node's message
- [x] `addLedger` succeeds and `grantAccess` fails: says the company was
      created with no key, and the `gl-node user` command that issues one
      (no silent half state)
- [x] Old *Starting point* select (Blank, Starter template, Duplicate an
      existing company): **waiting:** templates and copying a ledger (011
      unit 8, the ledger file); only Blank exists, so the select is left out

## Company picker (top header)

- [x] Trigger: `Building2` icon, the active company's label, `ChevronDown`;
      *Switching…* while switching; a skeleton of the same size before
      storage is read
- [x] Menu: 256px card under the trigger; closes on outside click and
      Escape (focus back on the trigger)
- [x] One row per company: label (the node and ledger in its tooltip); the
      active one in the link colour
- [x] Choosing another company switches with a full page reload, so nothing
      from the previous company survives; choosing the active one closes
      the menu
- [x] *Primary* tag: **left out** (no primary company; every company is
      equal in the browser)
- [x] Trash icon (*Remove X from this browser*) and its confirm row:
      **changed** (plan question 4, answered): forgets the company and its
      key in this browser only; the ledger stays on its node. *Remove X from
      this browser? It stays on its node; you'll need its key to add it
      again.*, *Remove* / *Cancel*. Removing the active company reloads
      under the next one, or goes to sign-in when none is left
- [x] *New company* row (`Plus` icon) opens a form in the menu with a
      toggle, *I have a key* / *Create one* (**changed:** in place of the
      old *Starting point* select), the node URL filled in from the active
      company; the old small *Create*/*Cancel* buttons
- [x] *I have a key*: node URL, company, key; the sign-in checks and
      messages; *Add* / *Cancel*, *Adding…*; then reloads under it
- [x] *Create one*: the create form above, small; then reloads under it

## Switching is a hard boundary

- [x] The active company is one value in the tab's storage; switching,
      adding and removing the active one all reload the page, so no screen
      can show the previous company's data, even for a moment
- [ ] Every request goes to the active company's URL with its key, and any
      cache is per company: **step 4**, with the first data
- [x] Two tabs keep their own lists (sessionStorage), so two companies can
      be open side by side

## Account menu (top header, right)

- [x] Avatar circle with an initial, a name, and a menu with *Sign out*
      (`LogOut` icon), *Signing out…*; skeleton while loading
- [x] **changed:** shows the active company's label and its initial in
      place of the person's email; **waiting:** `me` for the person's name
- [x] *Sign out* forgets every company and key in this tab and goes to
      `/sign-in` (a full load)

## Roles

- [ ] A read key sees what it may; actions it may not do are refused with
      `FORBIDDEN` and shown as a toast: **step 4** onwards, with the first
      actions
- [ ] Hiding what the key cannot do: **waiting:** `me`

## Proof

- [x] bun test (`src/lib/companies/*.test.ts`): the company and its input
      checks; the store (add, re-key in place, forget active and inactive,
      switch, storage round trip, malformed storage); sign-in and create
      against scripted answers (every error above, the order and keys of
      the two create calls, the operator key never in the result)
- [x] Playwright against a local gl-node (`tests/e2e/app/companies.spec.ts`):
      no company → sign-in; sign in with a person's key; wrong key and
      unknown company; node down; bad input; prefill from the address;
      create with the operator key (and it is stored nowhere); existing
      name and wrong operator key; switch; add from the menu; forget
      (inactive, active, last); each tab its own; sign out
- [x] Screenshots of sign-in, create and the open picker in light and dark,
      checked against the old pages
