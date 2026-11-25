import { join, normalize } from "node:path";

import { APP_PORT } from "@tests/e2e/settings";

// Serves the static export (`out/`) the way a static host does: `/reports`
// is `out/reports.html`, `/` is `out/index.html`, anything else is a file or
// the export's 404 page. Tests run against what ships, not `next dev`.
const exportDirectory = join(import.meta.dir, "..", "..", "out");

async function existingFile(path: string): Promise<Bun.BunFile | null> {
  const file = Bun.file(path);
  return (await file.exists()) ? file : null;
}

async function resolveFile(pathname: string): Promise<Bun.BunFile | null> {
  const relativePath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.(\/|\\|$))+/, "");
  const basePath = join(exportDirectory, relativePath);
  if (!basePath.startsWith(exportDirectory)) return null;
  if (pathname === "/" || pathname.endsWith("/")) {
    return existingFile(join(basePath, "index.html"));
  }
  return (await existingFile(basePath)) ?? (await existingFile(`${basePath}.html`)) ?? (await existingFile(join(basePath, "index.html")));
}

const server = Bun.serve({
  port: Number(process.env.PORT ?? APP_PORT),
  hostname: "localhost",
  async fetch(request) {
    const { pathname } = new URL(request.url);
    const file = await resolveFile(pathname);
    if (file) return new Response(file);
    const notFoundPage = await existingFile(join(exportDirectory, "404.html"));
    return new Response(notFoundPage ?? "Not found", { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
});

console.log(`Serving ${exportDirectory} at ${server.url}`);
