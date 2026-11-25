import { describe, expect, test } from "bun:test";
import { NEW_MESH_PORTS, createCompany } from "@/lib/companies/create-company";
import { signIn } from "@/lib/companies/sign-in";

type RecordedRequest = { url: string; apiKey: string | null; query: string; variables: Record<string, unknown> };

/** A fetch that answers each call with the next scripted response and records what was asked. */
function scriptedFetch(responses: Array<Response | Error>) {
  const requests: RecordedRequest[] = [];
  const implementation = async (input: RequestInfo | URL, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body)) as { query: string; variables: Record<string, unknown> };
    requests.push({ url: String(input), apiKey: new Headers(init?.headers).get("X-Api-Key"), query: body.query, variables: body.variables });
    const next = responses.shift();
    if (!next) throw new Error("no scripted response left");
    if (next instanceof Error) throw next;
    return next;
  };
  return { fetchImplementation: implementation as typeof fetch, requests };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("signIn", () => {
  const input = { nodeUrl: "https://ledger.example.com/", ledgerName: "acme", apiKey: "person-key" };

  test("checks the key on the company's ledger and returns the company", async () => {
    const { fetchImplementation, requests } = scriptedFetch([json({ data: { health: { status: "ok", version: "0.5.0" } } })]);
    const result = await signIn(input, fetchImplementation);
    expect(result).toEqual({
      ok: true,
      company: { identifier: "https://ledger.example.com|acme", nodeUrl: "https://ledger.example.com", ledgerName: "acme", apiKey: "person-key", label: "acme" }
    });
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe("https://ledger.example.com/ledgers/acme/graphql");
    expect(requests[0].apiKey).toBe("person-key");
  });

  test("a refused key says so", async () => {
    const { fetchImplementation } = scriptedFetch([new Response("", { status: 401 })]);
    expect(await signIn(input, fetchImplementation)).toEqual({ ok: false, fieldErrors: {}, message: "That key isn't accepted for this company." });
  });

  test("an unreachable node names it and the CORS setting", async () => {
    const { fetchImplementation } = scriptedFetch([new TypeError("Failed to fetch")]);
    const result = await signIn(input, fetchImplementation);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toStartWith("Can't reach https://ledger.example.com.");
      expect(result.message).toContain("cors.allowedOrigins");
    }
  });

  test("bad input is refused before anything is sent", async () => {
    const { fetchImplementation, requests } = scriptedFetch([]);
    const result = await signIn({ nodeUrl: "nope", ledgerName: "Acme", apiKey: "" }, fetchImplementation);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.fieldErrors).sort()).toEqual(["apiKey", "ledgerName", "nodeUrl"]);
    expect(requests).toHaveLength(0);
  });
});

describe("createCompany", () => {
  const input = { nodeUrl: "https://ledger.example.com", ledgerName: "acme", operatorKey: "operator-key", personName: "Ana Ruiz" };

  test("adds the ledger in a mesh of its own, then grants its creator an admin key with the operator key", async () => {
    const { fetchImplementation, requests } = scriptedFetch([
      json({ data: { addLedger: { name: "acme", served: true, reason: null } } }),
      json({ data: { grantAccess: { userId: "u_1", name: "Ana Ruiz", role: "ADMIN", key: "ana-key" } } })
    ]);
    const result = await createCompany(input, fetchImplementation);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.company.apiKey).toBe("ana-key");
    expect(requests.map((request) => request.url)).toEqual(["https://ledger.example.com/node/graphql", "https://ledger.example.com/ledgers/acme/graphql"]);
    expect(requests.every((request) => request.apiKey === "operator-key")).toBe(true);
    expect(requests[0].variables).toEqual({ name: "acme", newMeshPorts: NEW_MESH_PORTS });
    expect(requests[1].variables).toEqual({ name: "Ana Ruiz", role: "ADMIN" });
  });

  test("the operator key is never the company's key", async () => {
    const { fetchImplementation } = scriptedFetch([
      json({ data: { addLedger: { name: "acme", served: true, reason: null } } }),
      json({ data: { grantAccess: { userId: "u_1", name: "Ana Ruiz", role: "ADMIN", key: "ana-key" } } })
    ]);
    const result = await createCompany(input, fetchImplementation);
    expect(JSON.stringify(result)).not.toContain("operator-key");
  });

  test("an existing name is a field error", async () => {
    const { fetchImplementation, requests } = scriptedFetch([json({ data: null, errors: [{ message: "exists", extensions: { code: "LEDGER_EXISTS" } }] })]);
    expect(await createCompany(input, fetchImplementation)).toEqual({
      ok: false,
      fieldErrors: { ledgerName: "A company with that name already exists on this node." },
      message: null
    });
    expect(requests).toHaveLength(1);
  });

  test("a wrong operator key says so", async () => {
    const { fetchImplementation } = scriptedFetch([new Response("", { status: 401 })]);
    expect(await createCompany(input, fetchImplementation)).toEqual({ ok: false, fieldErrors: {}, message: "That isn't this node's operator key." });
  });

  test("a ledger the node adds but doesn't serve says why", async () => {
    const { fetchImplementation } = scriptedFetch([json({ data: { addLedger: { name: "acme", served: false, reason: "no free port" } } })]);
    expect(await createCompany(input, fetchImplementation)).toEqual({ ok: false, fieldErrors: {}, message: "The node added acme but isn't serving it: no free port." });
  });

  test("a key that can't be made after the ledger exists is reported, not hidden", async () => {
    const { fetchImplementation } = scriptedFetch([
      json({ data: { addLedger: { name: "acme", served: true, reason: null } } }),
      json({ data: null, errors: [{ message: "signing is off", extensions: { code: "NO_ACCESS_LIST" } }] })
    ]);
    const result = await createCompany(input, fetchImplementation);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toStartWith("acme was created on the node, but its first key couldn't be made (signing is off).");
      expect(result.message).toContain("gl-node user --ledger acme add");
    }
  });

  test("needs the person's name", async () => {
    const { fetchImplementation, requests } = scriptedFetch([]);
    const result = await createCompany({ ...input, personName: " " }, fetchImplementation);
    expect(result).toEqual({ ok: false, fieldErrors: { personName: "Enter your name." }, message: null });
    expect(requests).toHaveLength(0);
  });
});
