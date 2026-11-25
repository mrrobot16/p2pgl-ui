---
name: performance
description: "Use whenever writing, editing or reviewing UI code in this app: pages, components, data fetching, tables and lists, state, adding a package, an image or another asset, or any question about speed. Holds the frontend performance rules: ship little JavaScript, one request per screen, render cheaply, feel instant, keep assets small, and measure."
user-invocable: true
---

This app must feel instant. These rules apply to every screen and component you write or touch. A change that breaks one is not done until it is fixed or the maintainer has agreed to the exception.

The backend's speed is gl-node's work. These rules cover what the browser does: what it downloads, what it asks for, what it renders.

## 1. Ship little JavaScript

- **`"use client"` goes on the leaves.** Pages and layouts stay server components, rendered into the static HTML at build time. Only the interactive part (a filter, a menu, a selectable table) is a client component. Never mark a whole page `"use client"` to make one button work.
- **Load rare, heavy code on demand** with `next/dynamic` or a dynamic `import()`: Plaid Link's script only when *Link account* is clicked, modals and side panels when they open, editors on their own screen.
- **Check a package's size before adding it** (bundlephobia or the build output). Use the browser first: `Intl` for numbers and dates, `fetch`, native elements. No moment, lodash, date libraries, UI frameworks or GraphQL clients. Import icons one by one from `lucide-react`. A package that is added goes in at an exact version (the `code-style` skill, rule 4).
- **Budget:** at most 250 KB of first-load JavaScript per route, gzipped. The empty shell is about 200 KB. Read `next build`'s route table after any change that adds code.

## 2. Fetch data well

- **One request per screen.** Everything a screen shows on opening goes to gl-node in a single GraphQL operation (several root fields in one query), never one request per widget.
- **No waterfalls.** Start every request a screen needs at the same time. Never wait for one answer before asking for something that doesn't depend on it.
- **Start early:** on hover or focus of the link that leads there, and on navigation, not after a chain of mounts.
- **Keep the last answer.** Show cached data at once and refresh it in the background. The cache is per company and is emptied on every company switch: one company's data must never show under another. Two components asking the same question share one request.
- **Cancel what is no longer wanted** with an `AbortController`: on navigating away, and when a filter or search changes mid-request.
- **Ask only for the fields on screen.** Every field in a `.graphql` operation must be shown or used.
- **Page on the node.** Never fetch a whole list to page or filter it in the browser when gl-node can do it.
- **Mind the rate limit.** gl-node allows 60 GraphQL requests a minute per client address, shared by everyone behind that address. Never fetch per keystroke (filter what's loaded, or wait until typing stops), and never refetch what the cache already holds unless it may have changed. A refusal must show as "too many requests, try again in a moment", never as a broken screen.

## 3. Render cheaply

- **Keep state where it is used.** Typing in a search box must not re-render the page around it. Split contexts so one change doesn't redraw everything that reads the context.
- **Keep typing instant over big lists:** `useDeferredValue` or `useTransition` for searches and filters, so the input updates now and the table catches up.
- **Render only the visible rows** of any table that can pass about 200 rows: the register, the bank inbox, a large chart of accounts.
- **Derive once.** Expensive derivations (the account tree, report rollups) are computed once per input change, not on every render.
- **Reuse formatters.** One `Intl.NumberFormat` or `Intl.DateTimeFormat` per currency or format, created once and reused, never one per cell. Use `big.js` only for arithmetic, not for display.
- **Stable keys.** List keys come from the data (an account name, a transaction id), never the array index when rows can move.

## 4. Feel instant

- **No layout shift.** A skeleton has the exact size of what replaces it. Images and icons have fixed dimensions.
- **Answer every click within 100 ms:** the result, a pressed state, or a spinner in the button that was pressed.
- **Show safe actions before the node confirms.** *Post* or *Exclude* in the bank inbox removes the row at once and puts it back, with an error toast, if gl-node refuses. Never do this for anything that can't be undone on screen.
- **Keep old data visible while new data loads.** Show a quiet loading cue; don't fall back to a skeleton.
- **Animate only `transform` and `opacity`**, and respect `prefers-reduced-motion`.

## 5. Keep assets small and simple

- **Images are SVG only.** No PNG, JPEG, GIF, WebP, AVIF, ICO or any other raster format, anywhere in the app's files or named in its code. No photos or decorative images (the sign-in photo was removed for this reason).
- **SVGs are clean and small:** at most 10 KB; no embedded raster image (`data:image/…`, `<image>`), no `<script>`, no `<foreignObject>`, no `on…=` handlers; text converted to outlines (paths), never live `<text>`, which draws with whatever font the machine has. Prefer marks drawn in `currentColor`, so one file serves light and dark. A mark on every page is best built into the page as a component (no request); strip editor class names and ids (`.cls-1`, `Layer_1`) first, or they leak into the page.
- **Enforced:** `scripts/svg-only.test.ts` (files on disk, part of `bun run test`) and a lint rule against naming a raster file in code. The only exceptions would be an Apple home-screen icon or social link previews, which need PNG, and only with the maintainer's yes.
- **Icons are SVG:** lucide-react, or an authored SVG.
- **No web fonts.** The font stack uses fonts already on the machine (DESIGN.md).
- **No third-party scripts** besides Plaid Link, which loads only when used.

## 6. Measure

The React Compiler is on (`next.config.ts`): don't add `useMemo`, `useCallback` or `memo` by hand for speed; the compiler does it. A component that misbehaves under it opts out with `"use no memo"`, with a comment saying why.

The budgets are tests. Before you call a screen done:

1. `bun run build`, then `bun run budget`: every page's first-load JavaScript is at most 250 KB gzipped (`scripts/check-bundle-budget.ts`).
2. Add the screen to `SCREENS` in `tests/e2e/app/budgets.spec.ts` and run `bun run test:e2e`: at most one request to gl-node on opening, content within 2 s, LCP (largest paint) within 1.5 s, CLS (layout shift) within 0.05. A data screen opens on the large test ledger.
3. Check by hand that typing in the screen's search and changing its filters stays responsive (INP under 200 ms) on the large test ledger.
4. For a heavy interaction (reports with many columns, the register), record it in React's Profiler and fix any render that takes more than one frame (16 ms) on its own.

Never loosen a budget to make a test pass: make the screen lighter, or ask the maintainer.

Say in your report which of these you checked and what the numbers were. If you skipped one, say so.
