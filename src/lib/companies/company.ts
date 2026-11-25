import { normalizeNodeUrl } from "@/lib/gl-node/client";

/**
 * A company: one gl-node ledger, reached at `nodeUrl` under `ledgerName`
 * with `apiKey`. Kept in this browser tab only (sessionStorage).
 */
export type Company = {
  /** The node and the ledger together; a company is unique by both. */
  identifier: string;
  nodeUrl: string;
  ledgerName: string;
  apiKey: string;
  /** What the picker shows; the ledger name until gl-node's `me` gives a label. */
  label: string;
};

export type CompanyInput = {
  nodeUrl: string;
  ledgerName: string;
  apiKey: string;
};

export function companyIdentifier(nodeUrl: string, ledgerName: string): string {
  return `${normalizeNodeUrl(nodeUrl)}|${ledgerName.trim()}`;
}

export function makeCompany(input: CompanyInput): Company {
  const nodeUrl = normalizeNodeUrl(input.nodeUrl);
  const ledgerName = input.ledgerName.trim();
  return {
    identifier: companyIdentifier(nodeUrl, ledgerName),
    nodeUrl,
    ledgerName,
    apiKey: input.apiKey.trim(),
    label: ledgerName
  };
}

/** gl-node's rule for a ledger's name: 1 to 40 of a-z, 0-9 and -. */
const LEDGER_NAME_PATTERN = /^[a-z0-9-]{1,40}$/;

export type FieldErrors = Partial<Record<"nodeUrl" | "ledgerName" | "apiKey" | "personName", string>>;

/** Problems with the node URL, or null. */
export function nodeUrlProblem(nodeUrl: string): string | null {
  const trimmed = nodeUrl.trim();
  if (trimmed === "") return "Enter the node's address.";
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return "Enter a full address, starting with https:// or http://.";
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return "Enter a full address, starting with https:// or http://.";
  }
  if (parsed.search || parsed.hash || (parsed.pathname !== "/" && parsed.pathname !== "")) {
    return "Enter the node's address only, without a path.";
  }
  return null;
}

/** Problems with the company (ledger) name, or null. */
export function ledgerNameProblem(ledgerName: string): string | null {
  const trimmed = ledgerName.trim();
  if (trimmed === "") return "Enter the company's name on the node.";
  if (!LEDGER_NAME_PATTERN.test(trimmed)) {
    return "Use 1 to 40 lowercase letters, digits and hyphens.";
  }
  return null;
}

/** The checks made before anything is sent to the node. */
export function companyInputProblems(input: CompanyInput, keyLabel = "key"): FieldErrors {
  const problems: FieldErrors = {};
  const nodeProblem = nodeUrlProblem(input.nodeUrl);
  if (nodeProblem) problems.nodeUrl = nodeProblem;
  const nameProblem = ledgerNameProblem(input.ledgerName);
  if (nameProblem) problems.ledgerName = nameProblem;
  if (input.apiKey.trim() === "") problems.apiKey = `Enter the ${keyLabel}.`;
  return problems;
}

export function hasProblems(problems: FieldErrors): boolean {
  return Object.keys(problems).length > 0;
}
