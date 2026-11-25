import { describe, expect, test } from "bun:test";

import { checkNodeEndpoint } from "@/lib/companies/node-endpoint";

type Answer = Response | Error;

/** A fetch that answers by address, and records each address asked. */
function fetchByAddress(answers: Record<string, Answer>) {
  const asked: string[] = [];
  const implementation = async (input: RequestInfo | URL) => {
    const address = String(input);
    asked.push(address);
    const answer = answers[address];
    if (!answer) throw new Error(`nothing scripted for ${address}`);
    if (answer instanceof Error) throw answer;
    return answer;
  };
  return { fetchImplementation: implementation as typeof fetch, asked };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const NODE = "https://ledger.example.com/";
const NODE_GRAPHQL = "https://ledger.example.com/node/graphql";
const HEALTH = "https://ledger.example.com/health";

describe("checkNodeEndpoint", () => {
  test("a GraphQL answer from /node/graphql, even the 401 without a key, means companies can be created here", async () => {
    const { fetchImplementation, asked } = fetchByAddress({
      [NODE_GRAPHQL]: json({ errors: [{ message: "Missing or invalid API key", extensions: { code: "UNAUTHORIZED" } }] }, 401)
    });
    expect(await checkNodeEndpoint(NODE, fetchImplementation)).toBe("available");
    expect(asked).toEqual([NODE_GRAPHQL]);
  });

  test("a node that answers /health but not /node/graphql keeps companies on the server", async () => {
    // The installer's proxy answers /node/graphql itself, without CORS
    // headers, so the browser sees a network failure.
    const { fetchImplementation, asked } = fetchByAddress({ [NODE_GRAPHQL]: new TypeError("Failed to fetch"), [HEALTH]: json({ status: "ok" }) });
    expect(await checkNodeEndpoint(NODE, fetchImplementation)).toBe("closed");
    expect(asked).toEqual([NODE_GRAPHQL, HEALTH]);
  });

  test("an answer that isn't GraphQL counts as closed too", async () => {
    const { fetchImplementation } = fetchByAddress({ [NODE_GRAPHQL]: new Response("Not Found", { status: 404 }), [HEALTH]: json({ status: "ok" }) });
    expect(await checkNodeEndpoint(NODE, fetchImplementation)).toBe("closed");
  });

  test("a node that answers nothing is unreachable", async () => {
    const { fetchImplementation } = fetchByAddress({ [NODE_GRAPHQL]: new TypeError("Failed to fetch"), [HEALTH]: new TypeError("Failed to fetch") });
    expect(await checkNodeEndpoint(NODE, fetchImplementation)).toBe("unreachable");
  });
});
