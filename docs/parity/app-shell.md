# Parity: app shell, themes and UI kit

Status: checklist written 2026-11-24; nothing built.

Old app: `src/components/layout/*`, `src/components/theme/*`,
`src/components/ui/*`, `src/app/globals.css`, `src/styles/tailwind-overrides.css`,
`src/constants/apps.ts`, `DESIGN.md`.

Marks: `[ ]` to build, `[x]` built and checked against the old screen,
**waiting:** a gl-node API it needs, **left out:** a placeholder in the old
app (disabled, or a toast saying it isn't available), which we don't copy.

## Tokens and themes

- [ ] Every CSS variable of `:root` and `.dark` ported with the same names
      and values
- [ ] Modern, America 250 and Pretty ported with their extra rules (side
      nav, top header, active icon, primary button, avatar, card); which
      ones the menu offers: plan question 1
- [ ] Font stack `"Avenir Next forINTUIT", "Avenir Next", Avenir, Helvetica,
      Arial, sans-serif`; never Inter or system-ui
- [ ] Body background `--color-container-background-accent`, text
      `--color-text-global`
- [ ] The `.qbo-checkbox` (20px, grey border, green when checked, the
      indeterminate dash, focus outline)
- [ ] `.tw-override` report and header rules (`.header`, `.header-reports`,
      `.header-filters`, `.page-title`, `.page-content`) as the reports use
      them
- [ ] Print rules: `.no-print` hidden, the report card prints alone
- [ ] Theme menu in the top header (`ThemeToggle`: *Choose theme*, a check
      beside the current one); default follows the system
- [ ] A stored theme that is no longer offered resets to the system theme

## App shell

- [ ] `p-[6px] pl-0` frame on the accent background; rail on the left;
      header and content on the right; content scrolls, rounded bottom
      corners (`--radius-x-large`)
- [ ] Page title `New GL - <page>`, default `New GL`; description *The GL of
      accountants, by accountants, for accountants.*

## Side rail

- [ ] 73px wide, `--color-sidebar-background`; logo (26px, `/logo.svg`,
      alt *Quickslike logo*) linking home
- [ ] Square items: 72px tall, 24px icon in a shell, 11px semibold label;
      active shell style (`side-nav-icon-shell-active`)
- [ ] Reports (`BookOpen`), active on `/reports…`
- [ ] Accounting (`Landmark`): click goes to its first item; hover (350ms
      intent delay) or keyboard focus opens its flyout; Escape closes and
      returns focus; leaving item and flyout closes
- [ ] Accounting stays active on its pages and on pages under them
- [ ] Home: **waiting:** its dashboard (plan question 2)
- [ ] Expenses, Sales, More apps: **waiting:** their areas (store, entry
      forms); hidden until one of their items is backed
- [ ] Settings (bottom-pinned): **waiting:** any settings page that is
      backed; hidden until then

## Flyouts

- [ ] Category flyout: 256px card, uppercase title, items with a 16px
      icon, hover background; only backed items listed
- [ ] More apps flyout, two levels (category list, items panel to the
      right): hidden while More apps is hidden
- [ ] Locked items (grey, `Gem` icon): **left out**; the old app has the
      support but lists none

## Top header

- [ ] 57px, rounded top corners, company picker on the left, theme menu and
      avatar menu on the right
- [ ] Avatar menu: circle with an initial, the signed-in name, a menu with
      *Sign out* (`LogOut` icon, *Signing out…* while it runs)
- [ ] The name and initial: **waiting:** `me`. Until then the trigger shows
      the active company's label and its initial (marked in
      `docs/api-gaps.md`)
- [ ] Skeletons the size of the real controls while loading, so nothing
      shifts
- [ ] Menus close on outside click and on Escape (focus back to the
      trigger)

## Page header (list screens)

- [ ] Breadcrumb row: *section / title*, 14px
- [ ] *Give feedback* on the right of the breadcrumb: **left out** (disabled
      in the old app)
- [ ] 32px title, actions on the right, 22px gap below

## All apps sub menu (pages under `/all-apps`)

- [ ] Left sub menu, 256px, slides in and out (300ms, none with reduced
      motion); *Hide sub menu* / *Show sub menu* buttons; starts closed and
      remembers the choice in localStorage (`newgl:all-apps-submenu-open`)
- [ ] Accordion of categories, one open at a time; the active page's
      category opens itself; active item highlighted
- [ ] Only backed items listed (Accounting: Bank Transactions, Chart of
      Accounts)
- [ ] `/all-apps` alone goes to the first listed item

## UI kit (`src/components/ui`)

- [ ] Button: pill, sizes sm 32px, md 34px, lg 40px; primary, secondary,
      ghost, destructive; one blue focus ring
- [ ] Icon button, input field (label, sizes, focus ring, disabled colours),
      number field (currency), select (search, *+ Add new*, right labels,
      checkmark, sizes), filter select, textarea, checkbox, radio group
- [ ] Modal, confirm dialog host, dropdown menu, tooltip
- [ ] Table, card (12px radius, hairline border, no shadow in light and
      dark), badge, skeleton
- [ ] Toasts: success, error, info; title and description; the old
      provider's placement and timing

## Proof

- [ ] Playwright: rail, flyout by hover and by keyboard, sub menu toggle
      and memory, theme switch in each theme, screenshots of each theme
- [ ] Each component compared with the old one, side by side
