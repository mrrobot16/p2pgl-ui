import { createCompanyOnNode } from "@tests/e2e/companies";
import { startGlNode } from "@tests/e2e/gl-node-harness";
import { SEEDED_COMPANIES_VARIABLE, largeBooks, SMALL_BOOKS, writeBooks } from "@tests/e2e/seeded-books";
import { APP_ORIGIN } from "@tests/e2e/settings";

/** Entries in the large test company: enough to show a slow screen, quick to adopt at boot. */
const LARGE_ENTRY_COUNT = 10_000;

// One gl-node for the whole run. Its URL and operator key reach the test
// workers through the environment, which they inherit from this process.
// Two companies are seeded through their `.bean` before any test starts:
// the small one with known figures, the large one for the speed budgets.
export default async function globalSetup(): Promise<() => Promise<void>> {
  const node = await startGlNode({ allowedOrigins: [APP_ORIGIN] });
  process.env.E2E_GL_NODE_URL = node.url;
  process.env.E2E_GL_NODE_OPERATOR_KEY = node.operatorKey;

  const small = await createCompanyOnNode({ ledgerName: "seeded-small", role: "READ" });
  const large = await createCompanyOnNode({ ledgerName: "seeded-large", role: "READ" });
  await node.restart(async () => {
    await writeBooks(node.dataDirectory, small.ledgerName, SMALL_BOOKS);
    await writeBooks(node.dataDirectory, large.ledgerName, largeBooks(LARGE_ENTRY_COUNT));
  });
  process.env[SEEDED_COMPANIES_VARIABLE] = JSON.stringify({ small, large });
  return node.stop;
}
