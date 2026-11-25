import { describe, expect, test } from "bun:test";

import { makeCompany } from "@/lib/companies/company";
import {
  COMPANY_STORAGE_KEY,
  activeCompany,
  readCompanyState,
  withActiveCompany,
  withCompanyAdded,
  withCompanyForgotten,
  writeCompanyState,
  type CompanyState,
  type StateStorage
} from "@/lib/companies/company-store";

const acme = makeCompany({ nodeUrl: "https://one.example.com", ledgerName: "acme", apiKey: "acme-key" });
const globex = makeCompany({ nodeUrl: "https://one.example.com", ledgerName: "globex", apiKey: "globex-key" });
const initech = makeCompany({ nodeUrl: "https://two.example.com", ledgerName: "acme", apiKey: "initech-key" });
const empty: CompanyState = { companies: [], activeIdentifier: null };

function memoryStorage(initial: Record<string, string> = {}): StateStorage & { values: Map<string, string> } {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
    removeItem: (key) => void values.delete(key)
  };
}

describe("adding a company", () => {
  test("adds it and makes it active", () => {
    const state = withCompanyAdded(withCompanyAdded(empty, acme), globex);
    expect(state.companies.map((company) => company.ledgerName)).toEqual(["acme", "globex"]);
    expect(activeCompany(state)?.ledgerName).toBe("globex");
  });

  test("the same ledger name on another node is another company", () => {
    const state = withCompanyAdded(withCompanyAdded(empty, acme), initech);
    expect(state.companies).toHaveLength(2);
  });

  test("the same node and ledger replaces the key in place", () => {
    const rekeyed = { ...acme, apiKey: "new-key" };
    const state = withCompanyAdded(withCompanyAdded(withCompanyAdded(empty, acme), globex), rekeyed);
    expect(state.companies.map((company) => company.apiKey)).toEqual(["new-key", "globex-key"]);
    expect(state.activeIdentifier).toBe(acme.identifier);
  });
});

describe("forgetting a company", () => {
  const both = withCompanyAdded(withCompanyAdded(empty, acme), globex);

  test("an inactive one leaves the active one alone", () => {
    const state = withCompanyForgotten(both, acme.identifier);
    expect(state.companies.map((company) => company.ledgerName)).toEqual(["globex"]);
    expect(state.activeIdentifier).toBe(globex.identifier);
  });

  test("the active one hands over to the first one left", () => {
    const state = withCompanyForgotten(both, globex.identifier);
    expect(state.activeIdentifier).toBe(acme.identifier);
  });

  test("the last one leaves none active", () => {
    expect(withCompanyForgotten(withCompanyAdded(empty, acme), acme.identifier)).toEqual(empty);
  });
});

describe("switching", () => {
  test("to a known company makes it active; to an unknown one changes nothing", () => {
    const both = withCompanyAdded(withCompanyAdded(empty, acme), globex);
    expect(withActiveCompany(both, acme.identifier).activeIdentifier).toBe(acme.identifier);
    expect(withActiveCompany(both, "nowhere|none")).toBe(both);
  });
});

describe("storage", () => {
  test("round-trips the state", () => {
    const storage = memoryStorage();
    const state = withCompanyAdded(withCompanyAdded(empty, acme), globex);
    writeCompanyState(storage, state);
    expect(readCompanyState(storage)).toEqual(state);
  });

  test("an empty list removes the entry", () => {
    const storage = memoryStorage({ [COMPANY_STORAGE_KEY]: "{}" });
    writeCompanyState(storage, empty);
    expect(storage.values.has(COMPANY_STORAGE_KEY)).toBe(false);
  });

  test("unreadable or malformed storage reads as no companies", () => {
    expect(readCompanyState(memoryStorage({ [COMPANY_STORAGE_KEY]: "not json" }))).toEqual(empty);
    const throwing: StateStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => undefined,
      removeItem: () => undefined
    };
    expect(readCompanyState(throwing)).toEqual(empty);
  });

  test("drops malformed companies and repairs an active one that isn't there", () => {
    const storage = memoryStorage({
      [COMPANY_STORAGE_KEY]: JSON.stringify({ companies: [acme, { ledgerName: "broken" }], activeIdentifier: "gone|gone" })
    });
    expect(readCompanyState(storage)).toEqual({ companies: [acme], activeIdentifier: acme.identifier });
  });
});
