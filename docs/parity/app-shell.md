# Parity: app shell, themes and UI kit

Status: step 2 built 2026-11-24. Every line is ticked, waiting for an API,
or arriving with the step named on it.

Old app: `src/components/layout/*`, `src/components/theme/*`,
`src/components/ui/*`, `src/app/globals.css`, `src/styles/tailwind-overrides.css`,
`src/constants/apps.ts`, `DESIGN.md`.

Marks: `[ ]` to build, `[x]` built and checked against the old screen,
**waiting:** a gl-node API it needs, **left out:** a placeholder in the old
app (disabled, or a toast saying it isn't available), which we don't copy,
**step N:** built with that step's area.

Checked against the old app's code and screenshots of ours in light and dark
(the old app can't run without its Supabase backend). Behaviour is tested
on the shipped export (Playwright project `app`) and, for parts no built
screen shows yet, on the development-only UI kit page `/dev/ui-kit`
(project `kit`).

## Tokens and themes

- [x] Every CSS variable of `:root` and `.dark` ported with the same names
      and values (`src/styles/tokens.css`)
- [x] Modern, America 250 and Pretty (hidden in the old app): **left out**,
      not ported (plan question 1, answered: Light and Dark only)
- [x] Font stack `"Avenir Next forINTUIT", "Avenir Next", Avenir, Helvetica,
      Arial, sans-serif`; never Inter or system-ui
- [x] Body background `--color-container-background-accent`, text
      `--color-text-global`
- [x] The `.qbo-checkbox` (20px, grey border, green when checked, the
      indeterminate dash, focus outline)
- [ ] `.tw-override` report and header rules (`.header`, `.header-reports`,
      `.header-filters`, `.page-title`, `.page-content`): **step 4**, with
      the reports that use them
- [x] Print rules: `.no-print`, rail and header hidden, the report card
      prints alone (`src/styles/shell.css`)
- [x] Theme menu in the top header (*Choose theme*, a check beside the
      current one, closes on outside click and Escape); default follows
      the system
- [x] The old app's reset of a stored hidden skin: **left out**, as there
      are no hidden skins to reset

## App shell

- [x] `p-[6px] pl-0` frame on the accent background; rail on the left;
      header and content on the right; content scrolls, rounded bottom
      corners (`--radius-x-large`)
- [x] Page title `newGL - <page>`, default `newGL` (**changed:** the
      product is newGL, not the old *New GL*); description *The GL of
      accountants, by accountants, for accountants.*

## Side rail

- [x] 73px wide, `--color-sidebar-background`; logo (26px, `/logo.svg`,
      alt *newGL*) linking to `/`. **changed:** the newGL mark, a green
      circle with an N
- [x] Square items: 72px tall, 24px icon in a 36px shell, 11px label;
      hover and active shell filled with the nav colour
- [ ] Reports (`BookOpen`), active on `/reports…`: **step 4**
- [x] Accounting (`Landmark`): click goes to its first item; hover (350ms
      intent delay) or keyboard focus opens its flyout; Escape closes and
      returns focus; leaving item and flyout closes. **Fixed on the way:**
      in the old app, Escape with focus inside the flyout reopened it as
      focus went back to the icon. Shown once it has a page (**steps 5
      and 6**)
- [x] Accounting stays active on its pages and on pages under them
- [ ] Home: **waiting:** its dashboard (the register, the entry forms).
      Hidden until then; the logo and `/` open Bank Transactions instead
      (plan question 2, answered; `/` becomes that redirect in **step 6**).
      Owed: Home comes back with its greeting, create actions and metrics,
      and the logo goes home again
- [x] Expenses, Sales, More apps: hidden while none of their items is
      backed (a category with no pages is not shown)
- [x] Settings (bottom-pinned): hidden until a settings page is backed

## Flyouts

- [x] Category flyout: 256px card, uppercase title, items with a 16px
      icon, hover background
- [ ] More apps flyout, two levels: built with the first More apps
      category (Customer Hub or Team, both **waiting:** the store, 015)
- [x] Locked items (grey, `Gem` icon): **left out**; the old app has the
      support but lists none

## Top header

- [x] 57px, rounded top corners, theme menu on the right
- [x] Company picker on the left (docs/parity/companies.md)
- [x] Avatar menu (initial, name, *Sign out*); the person's name
      **waiting:** `me`, the company's label until then
- [x] Skeletons the size of the real controls while loading
- [x] Menus close on outside click and on Escape (focus back to the
      trigger)

## Page header (list screens)

- [x] Breadcrumb row: *section / title*, 14px; an optional right side
- [x] *Give feedback* on the right of the breadcrumb: **left out** (disabled
      in the old app)
- [x] 32px title, actions on the right, 22px gap below

## All apps sub menu (pages under `/app`, the old `/all-apps`)

- [x] Left sub menu, 256px, slides in and out (300ms, none with reduced
      motion, none on first paint); *Hide sub menu* / *Show sub menu*;
      starts closed and remembers the choice in localStorage
      (`newgl:app-submenu-open`), and still works for the
      visit when storage is blocked
- [x] Accordion of categories, one open at a time; the active page's
      category opens itself; active item highlighted
- [x] Only backed items listed
- [ ] `/app` alone goes to the first listed item: **step 5**, with the
      first page under it

## UI kit (`src/components/ui`)

- [x] Button: pill, sizes sm 32px, md 34px, lg 48px (the old code's; its
      DESIGN.md says 40px); primary, secondary, ghost, destructive; loading
      spinner; icons; one blue focus ring
- [x] Icon button, input field (label, error with icons, hint, sizes, focus
      ring, disabled colours), number field (currency, right-aligned),
      select (search, *+ Add new*, right labels, group headers, help text,
      checkmark, sizes, *No matches*), filter select, textarea, checkbox
      (indeterminate), radio group
- [x] Modal (focus trap, Escape, backdrop click, focus returns), confirm
      dialog host (resolves false with no host; its confirm button is the
      secondary look, as in the old app), dropdown menu, tooltip
- [x] Table parts, card (12px radius, hairline border, no shadow in light
      and dark), badge, skeleton
- [x] Toasts: success, error (an alert, 7s), info (4s); title and
      description; top right

## Proof

- [x] Playwright `app`: the shell, hidden areas, the theme menu and its
      memory, Escape, token colours in light and dark
- [x] Playwright `kit`: the flyout by hover, a passing pointer, keyboard and
      Escape; the sub menu and its memory; the select, modal, confirm
      dialog, toasts, dropdown; a screenshot in light and dark
- [x] bun test: navigation (visible categories, active category, current
      item, rail links)
