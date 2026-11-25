import { describe, expect, test } from "bun:test";

import { companyInputProblems, ledgerNameProblem, makeCompany, nodeUrlProblem } from "@/lib/companies/company";

describe("makeCompany", () => {
  test("normalises the node URL and trims, and labels by the ledger name", () => {
    const company = makeCompany({ nodeUrl: " https://ledger.example.com/ ", ledgerName: " acme ", apiKey: " secret-key " });
    expect(company).toEqual({
      identifier: "https://ledger.example.com|acme",
      nodeUrl: "https://ledger.example.com",
      ledgerName: "acme",
      apiKey: "secret-key",
      label: "acme"
    });
  });
});

describe("nodeUrlProblem", () => {
  test("accepts http and https addresses, with or without a port and a trailing slash", () => {
    expect(nodeUrlProblem("https://ledger.example.com")).toBeNull();
    expect(nodeUrlProblem("http://127.0.0.1:4000/")).toBeNull();
  });

  test("refuses an empty value, a bare host, another scheme and a path", () => {
    expect(nodeUrlProblem("  ")).toBe("Enter the node's address.");
    expect(nodeUrlProblem("ledger.example.com")).toBe("Enter a full address, starting with https:// or http://.");
    expect(nodeUrlProblem("ftp://ledger.example.com")).toBe("Enter a full address, starting with https:// or http://.");
    expect(nodeUrlProblem("https://ledger.example.com/ledgers/acme/graphql")).toBe("Enter the node's address only, without a path.");
  });
});

describe("ledgerNameProblem", () => {
  test("accepts gl-node's ledger names", () => {
    expect(ledgerNameProblem("acme")).toBeNull();
    expect(ledgerNameProblem("acme-2026")).toBeNull();
    expect(ledgerNameProblem("a".repeat(40))).toBeNull();
  });

  test("refuses empty, uppercase, other characters and more than 40", () => {
    expect(ledgerNameProblem("")).toBe("Enter the company's name on the node.");
    expect(ledgerNameProblem("Acme")).toBe("Use 1 to 40 lowercase letters, digits and hyphens.");
    expect(ledgerNameProblem("acme corp")).toBe("Use 1 to 40 lowercase letters, digits and hyphens.");
    expect(ledgerNameProblem("a".repeat(41))).toBe("Use 1 to 40 lowercase letters, digits and hyphens.");
  });
});

describe("companyInputProblems", () => {
  test("names every field that is wrong, and the key by its kind", () => {
    expect(companyInputProblems({ nodeUrl: "", ledgerName: "", apiKey: "" }, "operator key")).toEqual({
      nodeUrl: "Enter the node's address.",
      ledgerName: "Enter the company's name on the node.",
      apiKey: "Enter the operator key."
    });
  });

  test("is empty when everything is right", () => {
    expect(companyInputProblems({ nodeUrl: "https://ledger.example.com", ledgerName: "acme", apiKey: "key" })).toEqual({});
  });
});
