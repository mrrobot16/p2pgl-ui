import { randomBytes } from "node:crypto";
import type { Page } from "@playwright/test";

import { runningGlNode } from "@tests/e2e/settings";

/** What a test needs to reach one company on the test node. */
export type TestCompany = { nodeUrl: string; ledgerName: string; key: string };

/** A ledger name no other test uses: 1 to 40 of a-z, 0-9 and -. */
export function uniqueLedgerName(prefix = "e2e"): string {
  return `${prefix}-${randomBytes(5).toString("hex")}`;
}

async function graphql(url: string, apiKey: string, query: string, variables: Record<string, unknown>): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": apiKey },
    body: JSON.stringify({ query, variables })
  });
  const body = (await response.json()) as { data?: Record<string, unknown>; errors?: unknown[] };
  if (!response.ok || body.errors) throw new Error(`gl-node refused (${response.status}): ${JSON.stringify(body.errors ?? body)}`);
  return body.data ?? {};
}

/**
 * Creates a company on the test node the way the app does (addLedger in a
 * mesh of its own, then grantAccess with the operator key), straight from
 * the test, and returns a person's key for it.
 */
export async function createCompanyOnNode(options: { ledgerName?: string; personName?: string; role?: "READ" | "WRITE" | "ADMIN" } = {}): Promise<TestCompany> {
  const node = runningGlNode();
  const ledgerName = options.ledgerName ?? uniqueLedgerName();
  await graphql(`${node.url}/node/graphql`, node.operatorKey, "mutation($name: String!, $ports: String) { addLedger(name: $name, newMeshPorts: $ports) { name served } }", {
    name: ledgerName,
    ports: "4433-4532"
  });
  const granted = await graphql(
    `${node.url}/ledgers/${ledgerName}/graphql`,
    node.operatorKey,
    "mutation($name: String!, $role: AccessRole!) { grantAccess(name: $name, role: $role) { key } }",
    { name: options.personName ?? "E2E Person", role: options.role ?? "ADMIN" }
  );
  const key = (granted.grantAccess as { key: string }).key;
  return { nodeUrl: node.url, ledgerName, key };
}

/** The value the app keeps in sessionStorage for these companies, the first one active. */
function storedState(companies: TestCompany[]) {
  const stored = companies.map((company) => ({
    identifier: `${company.nodeUrl}|${company.ledgerName}`,
    nodeUrl: company.nodeUrl,
    ledgerName: company.ledgerName,
    apiKey: company.key,
    label: company.ledgerName
  }));
  return { companies: stored, activeIdentifier: stored[0]?.identifier ?? null };
}

/**
 * Starts the page signed in to these companies (the first active), as if
 * the person had signed in. Seeded once per tab, so signing out or
 * switching later in the test is not undone on the next load.
 */
export async function seedCompanies(page: Page, companies: TestCompany[]): Promise<void> {
  await page.addInitScript((state) => {
    if (window.sessionStorage.getItem("e2e:seeded")) return;
    window.sessionStorage.setItem("openledger:companies", JSON.stringify(state));
    window.sessionStorage.setItem("e2e:seeded", "1");
  }, storedState(companies));
}

/** The companies the app has in this tab's sessionStorage. */
export async function readStoredCompanies(page: Page): Promise<{ companies: Array<{ ledgerName: string; apiKey: string }>; activeIdentifier: string | null } | null> {
  return page.evaluate(() => {
    const raw = window.sessionStorage.getItem("openledger:companies");
    return raw ? JSON.parse(raw) : null;
  });
}
