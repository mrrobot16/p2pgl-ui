import { describe, expect, test } from "bun:test";
import { LedgerHealthDocument } from "@/graphql/generated/ledger";
import { GlNodeError, ledgerEndpointUrl, nodeEndpointUrl, normalizeNodeUrl, requestGraphql } from "@/lib/gl-node/client";

const endpoint = { url: "http://127.0.0.1:4000/ledgers/acme/graphql", apiKey: "test-key-0123456789" };

type RecordedCall = { url: string; init: RequestInit | undefined };

function fakeFetch(respond: () => Response | Promise<Response>, calls: RecordedCall[] = []): typeof fetch {
  const implementation = async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return respond();
  };
  return implementation as typeof fetch;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

async function caughtError(promise: Promise<unknown>): Promise<GlNodeError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof GlNodeError) return error;
    throw error;
  }
  throw new Error("expected the request to fail");
}

describe("endpoint URLs", () => {
  test("drops trailing slashes and spaces from the node URL", () => {
    expect(normalizeNodeUrl("  https://ledger.example.com//  ")).toBe("https://ledger.example.com");
  });

  test("builds a company's ledger endpoint", () => {
    expect(ledgerEndpointUrl("https://ledger.example.com/", "acme")).toBe("https://ledger.example.com/ledgers/acme/graphql");
  });

  test("encodes the ledger name", () => {
    expect(ledgerEndpointUrl("http://127.0.0.1:4000", "a/b")).toBe("http://127.0.0.1:4000/ledgers/a%2Fb/graphql");
  });

  test("builds the node endpoint", () => {
    expect(nodeEndpointUrl("http://127.0.0.1:4000/")).toBe("http://127.0.0.1:4000/node/graphql");
  });
});

describe("requestGraphql", () => {
  test("posts the operation with the key and returns its data", async () => {
    const calls: RecordedCall[] = [];
    const data = await requestGraphql(
      endpoint,
      LedgerHealthDocument,
      undefined,
      fakeFetch(() => jsonResponse({ data: { health: { status: "ok", version: "0.5.0" } } }), calls)
    );

    expect(data.health.status).toBe("ok");
    expect(calls).toHaveLength(1);
    const [call] = calls;
    expect(call.url).toBe(endpoint.url);
    expect(call.init?.method).toBe("POST");
    const headers = new Headers(call.init?.headers);
    expect(headers.get("X-Api-Key")).toBe(endpoint.apiKey);
    expect(headers.get("Content-Type")).toBe("application/json");
    const body = JSON.parse(String(call.init?.body)) as { query: string; variables: unknown };
    expect(body.query).toContain("query LedgerHealth");
    expect(body.variables).toEqual({});
  });

  test("a 401 is unauthorized", async () => {
    const error = await caughtError(requestGraphql(endpoint, LedgerHealthDocument, undefined, fakeFetch(() => new Response("", { status: 401 }))));
    expect(error.kind).toBe("unauthorized");
    expect(error.status).toBe(401);
  });

  test("a 429 is rate-limited", async () => {
    const error = await caughtError(
      requestGraphql(
        endpoint,
        LedgerHealthDocument,
        undefined,
        fakeFetch(() => jsonResponse({ data: null, errors: [{ message: "rate limited", extensions: { code: "RATE_LIMITED" } }] }, 429))
      )
    );
    expect(error.kind).toBe("rateLimited");
    expect(error.status).toBe(429);
    expect(error.code).toBe("RATE_LIMITED");
  });

  test("a FORBIDDEN error is forbidden, whatever comes before it", async () => {
    const error = await caughtError(
      requestGraphql(
        endpoint,
        LedgerHealthDocument,
        undefined,
        fakeFetch(() =>
          jsonResponse({
            data: null,
            errors: [{ message: "other" }, { message: "needs a write key", extensions: { code: "FORBIDDEN" } }]
          })
        )
      )
    );
    expect(error.kind).toBe("forbidden");
    expect(error.code).toBe("FORBIDDEN");
    expect(error.message).toBe("needs a write key");
  });

  test("another GraphQL error keeps its code and message", async () => {
    const error = await caughtError(
      requestGraphql(
        endpoint,
        LedgerHealthDocument,
        undefined,
        fakeFetch(() => jsonResponse({ data: null, errors: [{ message: "No such ledger", extensions: { code: "NO_SUCH_LEDGER" } }] }, 404))
      )
    );
    expect(error.kind).toBe("graphql");
    expect(error.code).toBe("NO_SUCH_LEDGER");
    expect(error.status).toBe(404);
    expect(error.message).toBe("No such ledger");
  });

  test("errors beside data still fail the request", async () => {
    const error = await caughtError(
      requestGraphql(
        endpoint,
        LedgerHealthDocument,
        undefined,
        fakeFetch(() => jsonResponse({ data: { health: { status: "ok", version: "0.5.0" } }, errors: [{ message: "partial" }] }))
      )
    );
    expect(error.kind).toBe("graphql");
    expect(error.code).toBeNull();
  });

  test("a fetch that throws is unreachable", async () => {
    const error = await caughtError(
      requestGraphql(
        endpoint,
        LedgerHealthDocument,
        undefined,
        fakeFetch(() => {
          throw new TypeError("Failed to fetch");
        })
      )
    );
    expect(error.kind).toBe("unreachable");
    expect(error.cause).toBeInstanceOf(TypeError);
  });

  test("a non-JSON error status is an HTTP status error", async () => {
    const error = await caughtError(requestGraphql(endpoint, LedgerHealthDocument, undefined, fakeFetch(() => new Response("busy", { status: 503 }))));
    expect(error.kind).toBe("httpStatus");
    expect(error.status).toBe(503);
  });

  test("a success that is not JSON is an invalid response", async () => {
    const error = await caughtError(requestGraphql(endpoint, LedgerHealthDocument, undefined, fakeFetch(() => new Response("<html>", { status: 200 }))));
    expect(error.kind).toBe("invalidResponse");
  });

  test("a success with no data is an invalid response", async () => {
    const error = await caughtError(requestGraphql(endpoint, LedgerHealthDocument, undefined, fakeFetch(() => jsonResponse({}))));
    expect(error.kind).toBe("invalidResponse");
  });
});
