# openledger-v0-ui

The web UI for OpenLedger: a Next.js static export (TypeScript, Tailwind,
bun) that talks to gl-node's GraphQL API straight from the browser. It has
the old app's features and UI/UX, written anew, so a user of the old app
wouldn't notice the backend changed. The plan is `docs/plan.md`; the
decisions behind it are in openledger-v2's
`docs/build-log/011-web-ui-on-gl-node/`.

## Sources of truth

- **The old app** (`.do_not_commit_ignore/newgl-ui`) is the reference for
  every screen: read its screens, components, `DESIGN.md` and `PRODUCT.md`.
  Read-only. Never copy its code wholesale; write our own.
- **gl-node** (openledger-v2, `/Users/samurai/code/openledger/openledger-v2`)
  is the backend. Read-only: never edit it. Its API contract is
  `docs/api/schema.graphql` (a ledger's endpoint) and
  `docs/api/node-schema.graphql` (the node endpoint); working queries are in
  `docs/api/curl/`. When the UI needs something gl-node lacks, add it to
  `docs/api-gaps.md` and tell the maintainer; another session builds the API.

## Rules for the UI

- **Same look as the old app, screen for screen:** shell (side rail, top
  header, company picker, apps flyout), page headers, tables, forms, modals,
  drawers, buttons, badges, toasts, spacing, typography, colours, icons
  (lucide-react), the light and dark themes (the old app's other three
  skins are dropped), the font stack and the name. Design work uses the
  impeccable skill as a refinement that preserves the old look,
  never a redesign. Don't change visual language, layout or copy unless the
  maintainer asks.
- **Nothing on screen is a stub.** A screen, button or column appears only
  once gl-node has the query behind it; unbacked areas stay out of the
  navigation. The old app's own placeholders are left out too.
- **A company** is a node URL, a ledger name, a key and a label, kept in
  `sessionStorage`. Switching companies reloads the page: nothing from the
  previous company survives. The operator key is used only to create a
  company and is never stored.
- **Money is exact:** amounts stay decimal strings; sums use the decimal
  library, never JavaScript numbers.
- **The GraphQL client is generated** from the two schema files; plain
  `fetch`, no Apollo or urql.

## Tooling

- **Bun** is the package manager, script runner and test runner: `bun
  install`, `bun add`, `bun run <script>`, `bun test`, `bunx` for one-off
  tools. Never npm, yarn, pnpm or npx; the lockfile is `bun.lock`.

## Commands

- `bun run dev` — the app on http://localhost:3000.
- `bun run build` — the static export into `out/`.
- `bun run codegen` — regenerate `src/graphql/generated/` from gl-node's two
  schema files (read from `../openledger-v2`, or `OPENLEDGER_V2_PATH`) and
  the `.graphql` operations under `src/graphql/ledger/` and
  `src/graphql/node/`. The generated files are committed, so a build never
  needs openledger-v2; never edit them by hand.
- `bun run lint`, `bun run typecheck`, `bun run test` (unit tests under
  `src/`, with `bun test`).
- `bun run test:e2e` — Playwright, two projects. `app`: the exported app
  (run `bun run build` first) against a real gl-node, which the global setup
  starts from `GL_NODE_BINARY` (default
  `../openledger-v2/target/release/gl-node`; this repo never builds it) with
  a temporary data folder, a generated operator key, P2P off, and CORS open
  to http://localhost:3000. `kit`: the development-only UI kit page
  (`/dev/ui-kit`, every component in every theme) under `next dev` on port
  3101, for shell parts no built screen shows yet. Stop any dev server on
  3000 or 3101 first.
- `DESIGN.md` and `PRODUCT.md` are the old app's, carried over for the
  impeccable skill (PRODUCT.md with gl-node's facts); the old app stays the
  reference.
- Before calling work ready: lint, typecheck, unit tests, build and
  end-to-end tests all pass.

## How to work

- Before building an area, write `docs/parity/<area>.md`: everything the
  old screen does (routes, columns, filters, modals, shortcuts, empty,
  loading and error states, validation messages, what each action does).
  An area is done when every line is ticked or marked as waiting for an API.
- Test each flow with Playwright against a local gl-node, and unit-test
  logic with `bun test`.
- For local development, gl-node's config needs `cors.allowedOrigins` to
  include `http://localhost:3000`.
- Code follows the `code-style` skill: full-word names (never single
  letters or abbreviations, generics included) and absolute imports only
  (`@/…`, never `./` or `../`).
- UI code follows the `performance` skill: little JavaScript, one request
  per screen, cheap renders, instant feedback, no photos or web fonts, and
  measured before it's called done.

## Things Claude gets wrong here

- Turbopack drops the space between a closing tag and text that runs on to
  a line break (`<span>{name}</span> from this…` renders "namefrom"). Write
  the space explicitly: `{" from this…"}` or `{" "}`.

## Standing rules (from the maintainer)

- Never add an "Author:" or byline line to any Markdown file.
- Never add attribution to commits or PRs: no Co-Authored-By, no
  "Generated with" line.
- Never `git push`. Commit only when the maintainer explicitly says so, for
  that specific commit.
- Never commit or touch `.do_not_commit_ignore/` or `.env`.
- No MFA, two-factor or Plaid-MFA work, and no notes about it, until the
  maintainer says Plaid has asked.
- When the maintainer says "ask me questions", use the question dialog
  (AskUserQuestion), in rounds.
