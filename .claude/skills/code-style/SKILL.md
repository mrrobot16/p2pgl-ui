---
name: code-style
description: "Use whenever writing, editing, reviewing or refactoring any code in this UI project (components, hooks, utilities, tests, configs). Enforces the project's non-negotiable lint rules: full-word names only (no single-character or abbreviated variables, parameters, functions, types or generics), absolute imports only (no relative imports), package imports first, then a blank line, then the project's own, exact package versions in package.json (no ^ or ~ ranges), and at most 500 lines per .ts or .tsx file."
user-invocable: true
---

These rules apply to every line of code you write or touch in this project. They are not preferences. Code that breaks them is wrong and must be fixed before the work counts as done.

## Rule 1: Full words, never single characters

Every name is a full, descriptive English word or phrase. This covers variables, constants, function and method names, parameters and arguments, destructured bindings, loop counters, callback arguments, catch bindings, class, type and interface names, generic type parameters, and component props.

**Never use single-character names.** There are no exceptions: not in loops, not in short arrow functions, not in tests, not for generics.

**Never use abbreviations either.** Write the whole word.

| Never | Always |
| --- | --- |
| `for (let i = 0; …)` | `for (let index = 0; …)` |
| `items.map((x) => x.id)` | `items.map((item) => item.id)` |
| `catch (e)` / `catch (err)` | `catch (error)` |
| `onClick={(e) => …}` | `onClick={(event) => …}` |
| `.reduce((a, b) => a + b)` | `.reduce((total, amount) => total + amount)` |
| `.sort((a, b) => …)` | `.sort((first, second) => …)` |
| `function get<T>(…)` | `function get<TValue>(…)` |
| `const [k, v] of Object.entries(…)` | `const [key, value] of Object.entries(…)` |
| `idx`, `btn`, `msg`, `val`, `cfg`, `ctx`, `res`, `req`, `tx`, `amt`, `acct`, `num`, `str`, `obj`, `arr`, `el`, `cb`, `fn`, `tmp` | `index`, `button`, `message`, `value`, `config`, `context`, `response`, `request`, `transaction`, `amount`, `account`, `count` or a name that says what it counts, `text`, a name that says what it holds, `element`, `callback`, a name that says what it does, a name that says what it is |

Pick the name that says what the thing *is* in this domain: `transaction`, not `item`, when it is a transaction.

The only names you may leave as they are come from outside the project: a third-party library's exported identifiers, keys of external API payloads, and HTML/DOM attributes. Rename them to full words as soon as you bind them to your own variables.

## Rule 2: Absolute imports only, never relative

Import project code through the project's root alias. Never use `./` or `../` in an import or export path.

```ts
// Never
import { Button } from "./Button";
import { formatAmount } from "../../utils/format";
export * from "./types";

// Always
import { Button } from "@/components/Button";
import { formatAmount } from "@/utils/format";
export * from "@/components/Button/types";
```

- Use the alias the project already configures (check `tsconfig.json` / `jsconfig.json` `compilerOptions.paths`, and the bundler config). Do not invent a second alias.
- If no alias is configured yet, set one up (`"@/*"` pointing at the source root) in both the TypeScript config and the bundler/test runner config before writing imports, and tell the user you did.
- This applies to every file type that imports project code: components, styles, tests, stories, mocks and dynamic `import()` calls.
- Package imports (`react`, `next/link`, …) are already absolute and stay as they are.

## Rule 3: Package imports first, then a blank line, then ours

Imports sit in two groups, separated by exactly one blank line:

1. **Packages:** everything installed from npm and Node's own modules: `react`, `next/…`, `lucide-react`, `@playwright/test`, `node:fs`.
2. **Ours:** everything under the project's aliases: `@/…`, `@tests/…`, `@scripts/…`.

```ts
// Never
import type { ReactNode } from "react";
import { CompanyGate } from "@/components/companies/company-gate";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

// Always
import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { CompanyGate } from "@/components/companies/company-gate";
import { AppShell } from "@/components/layout/app-shell";
```

- No blank lines inside a group, and no comments between the two groups.
- Order inside a group is free; it isn't alphabetical.
- A type import (`import type …`) belongs to the group of where it comes from. Types are not a third group.
- Stylesheet and other side-effect imports (`import "@/app/globals.css"`) stay in our group, after the named imports. Keep their order: it is the order the styles load in.
- A file with only one group has no blank line to add.

## Rule 4: Exact package versions, never ranges

Every dependency in `package.json` names one version. No `^`, `~`, `>=`, `*`, `x` or `latest`.

```jsonc
// Never
"lucide-react": "^1.79.0",
"postcss": "~8.5.33",

// Always
"lucide-react": "1.79.0",
"postcss": "8.5.33",
```

- Add packages with `bun add <package>` (or `bun add -d` for development tools). `bunfig.toml` sets `exact = true`, so Bun writes the exact version it installed.
- Never type a version into `package.json` by hand, and never use `bun update` without a version: it moves versions without anyone choosing them.
- Upgrading is a deliberate change of its own: `bun add <package>@<version>`, then lint, typecheck, unit tests, build, budget and end-to-end tests, and say in the report which package moved from which version to which.
- `bun.lock` is committed with every change to `package.json`, and the two always agree.
- `engines` is not a dependency: its ranges (`"node": "24.x"`) stay as they are.

## Rule 5: At most 500 lines per file

No `.ts` or `.tsx` file is longer than 500 lines, counting every line: code, comments, blank lines and imports. This covers components, hooks, utilities, tests and configs alike.

- When a file would pass 500, split it by what its parts do, before it gets there. Don't squeeze it under by joining lines, dropping blank lines or deleting useful comments.
- Ways to split: a sub-component into its own file (`report-toolbar.tsx` beside `report-screen.tsx`); logic out of a component into `src/lib/<area>/` (pure functions are easier to unit-test there anyway); a hook into `src/hooks/`; types shared by several files into their own file; a long test file into one file per flow (`companies-sign-in.spec.ts`, `companies-switch.spec.ts`).
- Each new file follows rules 1 to 3: full-word names, imports through the aliases, never relative.
- The only exception is generated code (`src/graphql/generated/`), which is never edited by hand.

## When you edit existing code

If a file you touch already breaks these rules, fix every violation in that file as part of the change, including renames at every reference site. Do not leave a file half-converted.

## Before you finish

Check every file you created or changed:

1. Search for relative import paths: `grep -rnE "from ['\"]\.{1,2}/|import\(['\"]\.{1,2}/|require\(['\"]\.{1,2}/"` over the changed files. The result must be empty.
2. Read every declaration, parameter, destructuring pattern, callback argument, catch clause and generic parameter you wrote. None may be a single character or an abbreviation.
3. Run `bun run lint` and fix what it reports. It enforces rules 1 to 3 (`id-length`, `no-restricted-syntax`, `no-restricted-imports` and `import/order`); `bun run lint --fix` puts the imports in their groups for you.
4. If `package.json` changed, every version in `dependencies` and `devDependencies` is exact (rule 4), and `bun.lock` changed with it.
5. No `.ts` or `.tsx` file you created or changed passes 500 lines (rule 5): `wc -l` over the changed files.

Only report the work as done once all five checks pass.
