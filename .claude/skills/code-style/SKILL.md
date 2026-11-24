---
name: code-style
description: "Use whenever writing, editing, reviewing or refactoring any code in this UI project (components, hooks, utilities, tests, configs). Enforces the project's non-negotiable lint rules: full-word names only (no single-character or abbreviated variables, parameters, functions, types or generics) and absolute imports only (no relative imports)."
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

## When you edit existing code

If a file you touch already breaks these rules, fix every violation in that file as part of the change, including renames at every reference site. Do not leave a file half-converted.

## Before you finish

Check every file you created or changed:

1. Search for relative import paths: `grep -rnE "from ['\"]\.{1,2}/|import\(['\"]\.{1,2}/|require\(['\"]\.{1,2}/"` over the changed files. The result must be empty.
2. Read every declaration, parameter, destructuring pattern, callback argument, catch clause and generic parameter you wrote. None may be a single character or an abbreviation.
3. If the project has ESLint configured, run it and fix what it reports.

Only report the work as done once all three checks pass.
