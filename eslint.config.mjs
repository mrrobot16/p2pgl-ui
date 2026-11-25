import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// The code-style skill's rules (.claude/skills/code-style/SKILL.md), enforced:
// no single-character names, and no relative imports. Abbreviations can't be
// linted; the skill covers those.
export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "id-length": ["error", { min: 2, properties: "always" }],
      // id-length skips TypeScript's generic type parameters (`<T>`).
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSTypeParameter[name.name=/^.$/]",
          message: "Name generic type parameters in full words (TValue, TItem), never a single letter."
        },
        // Images are SVG only (the performance skill, section 5; checked on
        // disk by scripts/svg-only.test.ts): no code may name a raster file.
        {
          selector: "Literal[value=/\\.(png|jpe?g|gif|webp|avif|bmp|ico|tiff?|heic|heif|jfif)([?#].*)?$/i]",
          message: "Images are SVG only: use an .svg file (the performance skill, section 5)."
        },
        {
          selector: "TemplateElement[value.raw=/\\.(png|jpe?g|gif|webp|avif|bmp|ico|tiff?|heic|heif|jfif)([?#].*)?$/i]",
          message: "Images are SVG only: use an .svg file (the performance skill, section 5)."
        }
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^\\.{1,2}(/|$)",
              message: "Use an absolute import (@/…, @tests/… or @scripts/…), never a relative one."
            }
          ]
        }
      ]
    }
  },
  globalIgnores([
    ".do_not_commit_ignore/**",
    ".claude/**",
    ".impeccable/**",
    ".next/**",
    "out/**",
    "node_modules/**",
    "next-env.d.ts",
    "src/graphql/generated/**",
    "playwright-report/**",
    "test-results/**"
  ])
]);
