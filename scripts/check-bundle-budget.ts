import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * The JavaScript budget (the performance skill, section 1): every page of
 * the static export may load at most this much JavaScript, gzipped, when it
 * opens. Run after `bun run build`; exits 1 when a page is over.
 */
export const FIRST_LOAD_BUDGET_BYTES = 250 * 1024;

const EXPORT_DIRECTORY = join(import.meta.dir, "..", "out");

// Pages that aren't the app's own screens: Next's not-found pages and the
// development-only UI kit (exported only as a not-found page).
const IGNORED_PAGES = new Set(["404.html", "_not-found.html", "dev/ui-kit.html"]);

function htmlPages(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === "_next" ? [] : htmlPages(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

/** Every script a page references, counted once, by its gzipped size. */
export function firstLoadBytes(htmlPath: string, exportDirectory = EXPORT_DIRECTORY): number {
  const html = readFileSync(htmlPath, "utf8");
  const scripts = new Set(html.match(/\/_next\/static\/[^"'\s)]+\.js/g) ?? []);
  let total = 0;
  for (const script of scripts) total += Bun.gzipSync(readFileSync(join(exportDirectory, script))).byteLength;
  return total;
}

function kilobytes(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

if (import.meta.main) {
  let pages: string[];
  try {
    pages = htmlPages(EXPORT_DIRECTORY).filter((page) => !IGNORED_PAGES.has(relative(EXPORT_DIRECTORY, page)));
  } catch {
    console.error("No static export in out/: run `bun run build` first.");
    process.exit(1);
  }

  const rows = pages.map((page) => ({ page: `/${relative(EXPORT_DIRECTORY, page).replace(/(index)?\.html$/, "")}`, bytes: firstLoadBytes(page) }));
  rows.sort((first, second) => second.bytes - first.bytes);
  const overBudget = rows.filter((row) => row.bytes > FIRST_LOAD_BUDGET_BYTES);

  console.log(`First-load JavaScript per page, gzipped (budget ${kilobytes(FIRST_LOAD_BUDGET_BYTES)}):`);
  for (const row of rows) {
    console.log(`  ${row.bytes > FIRST_LOAD_BUDGET_BYTES ? "OVER" : "ok  "}  ${kilobytes(row.bytes).padStart(9)}  ${row.page}`);
  }
  if (overBudget.length > 0) {
    console.error(`\n${overBudget.length} page(s) over the budget. Load the heavy part on demand, or agree a new budget with the maintainer.`);
    process.exit(1);
  }
}
