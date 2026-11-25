import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// Images are SVG only (the performance skill, section 5): sharp at any
// size, small, and themeable. A raster image anywhere in the app's files
// fails, and so does an SVG that isn't clean: one that embeds a raster
// image or HTML, runs script, or is too big to be a simple mark or icon.

const repositoryRoot = join(import.meta.dir, "..");

/** Folders that aren't the app: dependencies, build and test output, Git, local material, tooling. */
const SKIPPED_FOLDERS = new Set([
  "node_modules",
  ".next",
  "out",
  ".git",
  ".do_not_commit_ignore",
  "test-results",
  "playwright-report",
  "blob-report",
  ".claude",
  ".impeccable"
]);

/** Raster image formats, never allowed. Written without dots so the lint rule against raster references doesn't match this list. */
export const RASTER_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "avif", "bmp", "ico", "tif", "tiff", "heic", "heif", "jfif"];

/** The most an SVG may weigh: enough for a logo or an icon, not for a picture. */
export const SVG_MAXIMUM_BYTES = 10 * 1024;

/**
 * SVGs allowed to keep live <text> for now, each with the reason. Text is
 * drawn with whatever font the machine has, so a mark looks different on
 * Windows and Linux; exports should convert text to outlines (paths).
 */
const TEXT_ALLOWED_UNTIL_REPLACED: Record<string, string> = {
  "public/logo.svg": "the N is Arial Rounded MT Bold text; waiting for an export with the text converted to outlines"
};

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return SKIPPED_FOLDERS.has(entry.name) ? [] : filesUnder(join(directory, entry.name));
    return [join(directory, entry.name)];
  });
}

function extensionOf(path: string): string {
  const name = path.split("/").pop() ?? "";
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

/** What is wrong with an SVG's content, or an empty list. */
export function svgProblems(content: string, byteLength: number): string[] {
  const problems: string[] = [];
  if (byteLength > SVG_MAXIMUM_BYTES) problems.push(`it weighs ${byteLength} bytes, more than ${SVG_MAXIMUM_BYTES}`);
  if (/data:image\//i.test(content)) problems.push("it embeds a raster image (data:image/…)");
  if (/<image[\s>]/i.test(content)) problems.push("it has an <image> element (a raster picture inside the SVG)");
  if (/<script[\s>]/i.test(content)) problems.push("it has a <script>");
  if (/<foreignObject[\s>]/i.test(content)) problems.push("it has a <foreignObject> (HTML inside the SVG)");
  if (/\son[a-z]+\s*=/i.test(content)) problems.push("it has an event handler attribute (on…=)");
  return problems;
}

export function hasLiveText(content: string): boolean {
  return /<text[\s>]/i.test(content);
}

const files = filesUnder(repositoryRoot).map((path) => relative(repositoryRoot, path));
const svgFiles = files.filter((path) => extensionOf(path) === "svg");

describe("images are SVG only", () => {
  test("no raster image anywhere in the app's files", () => {
    const rasterFiles = files.filter((path) => RASTER_EXTENSIONS.includes(extensionOf(path)));
    expect(rasterFiles, "raster images found; use SVG (the performance skill, section 5)").toEqual([]);
  });

  test("no stylesheet points at a raster image", () => {
    const pattern = new RegExp(`url\\([^)]*\\.(${RASTER_EXTENSIONS.join("|")})[)?#"']`, "i");
    const offenders = files.filter((path) => extensionOf(path) === "css" && pattern.test(readFileSync(join(repositoryRoot, path), "utf8")));
    expect(offenders).toEqual([]);
  });

  test("every SVG is clean and small", () => {
    const report = svgFiles
      .map((path) => {
        const absolutePath = join(repositoryRoot, path);
        return { path, problems: svgProblems(readFileSync(absolutePath, "utf8"), statSync(absolutePath).size) };
      })
      .filter((entry) => entry.problems.length > 0);
    expect(report).toEqual([]);
  });

  test("SVGs draw text as outlines, not live text", () => {
    const withText = svgFiles.filter((path) => !(path in TEXT_ALLOWED_UNTIL_REPLACED) && hasLiveText(readFileSync(join(repositoryRoot, path), "utf8")));
    expect(withText, "convert text to outlines (paths) before exporting").toEqual([]);
  });

  test("an SVG allowed to keep live text still has it (else drop it from the list)", () => {
    for (const path of Object.keys(TEXT_ALLOWED_UNTIL_REPLACED)) {
      expect(hasLiveText(readFileSync(join(repositoryRoot, path), "utf8")), `${path} no longer has live text: remove it from TEXT_ALLOWED_UNTIL_REPLACED`).toBe(true);
    }
  });
});

describe("svgProblems", () => {
  const clean = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="currentColor"/></svg>';

  test("passes a clean SVG", () => {
    expect(svgProblems(clean, clean.length)).toEqual([]);
  });

  test("catches every kind of unclean SVG", () => {
    expect(svgProblems('<svg><image href="data:image/png;base64,AAAA"/></svg>', 60)).toEqual([
      "it embeds a raster image (data:image/…)",
      "it has an <image> element (a raster picture inside the SVG)"
    ]);
    expect(svgProblems("<svg><script>alert(1)</script></svg>", 40)).toEqual(["it has a <script>"]);
    expect(svgProblems('<svg onload="steal()"></svg>', 30)).toEqual(["it has an event handler attribute (on…=)"]);
    expect(svgProblems("<svg><foreignObject><div/></foreignObject></svg>", 50)).toEqual(["it has a <foreignObject> (HTML inside the SVG)"]);
    expect(svgProblems(clean, SVG_MAXIMUM_BYTES + 1)).toEqual([`it weighs ${SVG_MAXIMUM_BYTES + 1} bytes, more than ${SVG_MAXIMUM_BYTES}`]);
  });

  test("tells live text from outlines", () => {
    expect(hasLiveText('<svg><text x="0">N</text></svg>')).toBe(true);
    expect(hasLiveText('<svg><path d="M0 0h10"/></svg>')).toBe(false);
  });
});
