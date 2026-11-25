import type { Company } from "@/lib/companies/company";

/**
 * The companies of this browser tab and which one is active, in
 * sessionStorage: each tab keeps its own, and closing the tab forgets them
 * (docs/plan.md, Architecture). Keys never leave this storage except as
 * the `X-Api-Key` header of a request to their own node.
 */

export type CompanyState = {
  companies: Company[];
  activeIdentifier: string | null;
};

export const COMPANY_STORAGE_KEY = "openledger:companies";

const EMPTY_STATE: CompanyState = { companies: [], activeIdentifier: null };

/** Where the state is kept: sessionStorage in the browser, a stand-in in tests. */
export type StateStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function isCompany(value: unknown): value is Company {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return ["identifier", "nodeUrl", "ledgerName", "apiKey", "label"].every((field) => typeof candidate[field] === "string");
}

export function readCompanyState(storage: StateStorage): CompanyState {
  let raw: string | null;
  try {
    raw = storage.getItem(COMPANY_STORAGE_KEY);
  } catch {
    return EMPTY_STATE;
  }
  if (!raw) return EMPTY_STATE;
  try {
    const parsed = JSON.parse(raw) as { companies?: unknown; activeIdentifier?: unknown };
    const companies = Array.isArray(parsed.companies) ? parsed.companies.filter(isCompany) : [];
    const active = typeof parsed.activeIdentifier === "string" ? parsed.activeIdentifier : null;
    const activeIdentifier = companies.some((company) => company.identifier === active) ? active : (companies[0]?.identifier ?? null);
    return { companies, activeIdentifier };
  } catch {
    return EMPTY_STATE;
  }
}

export function writeCompanyState(storage: StateStorage, state: CompanyState): void {
  if (state.companies.length === 0) {
    storage.removeItem(COMPANY_STORAGE_KEY);
    return;
  }
  storage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(state));
}

/** Adds a company, or replaces the one with the same node and ledger (a new key); makes it active. */
export function withCompanyAdded(state: CompanyState, company: Company): CompanyState {
  const others = state.companies.filter((existing) => existing.identifier !== company.identifier);
  const position = state.companies.findIndex((existing) => existing.identifier === company.identifier);
  const companies = position === -1 ? [...others, company] : [...others.slice(0, position), company, ...others.slice(position)];
  return { companies, activeIdentifier: company.identifier };
}

/** Forgets a company. When it was active, the first one left becomes active, or none. */
export function withCompanyForgotten(state: CompanyState, identifier: string): CompanyState {
  const companies = state.companies.filter((company) => company.identifier !== identifier);
  const activeIdentifier = state.activeIdentifier === identifier ? (companies[0]?.identifier ?? null) : state.activeIdentifier;
  return { companies, activeIdentifier };
}

export function withActiveCompany(state: CompanyState, identifier: string): CompanyState {
  if (!state.companies.some((company) => company.identifier === identifier)) return state;
  return { ...state, activeIdentifier: identifier };
}

export function activeCompany(state: CompanyState): Company | null {
  return state.companies.find((company) => company.identifier === state.activeIdentifier) ?? null;
}
