import { nodeEndpointUrl, normalizeNodeUrl } from "@/lib/gl-node/client";

/**
 * Whether a node takes new companies from the browser:
 * - `available`: `/node/graphql` gives a GraphQL answer (without a key that's
 *   a 401 with `UNAUTHORIZED`, which is enough to know it's there).
 * - `closed`: the node is up (`/health` answers) but `/node/graphql` isn't
 *   reachable. A server set up by the installer does this on purpose: its
 *   proxy forwards only /graphql, /ledgers/* and /health, and companies are
 *   made on the server with `openledger company add`.
 * - `unreachable`: neither answered; the node may be down or the address
 *   wrong. The create form stays, and creating says what failed.
 */
export type NodeEndpointAvailability = "available" | "closed" | "unreachable";

const CHECK_TIMEOUT_MILLISECONDS = 5000;

// Remembered per node for the life of the page: at most two requests a node
// (the node endpoint allows 60 a minute per address). `unreachable` isn't
// kept, so a node that starts later is found on the next check.
const remembered = new Map<string, Promise<NodeEndpointAvailability>>();

function isGraphqlAnswer(payload: unknown): boolean {
  if (typeof payload !== "object" || payload === null) return false;
  return "data" in payload || Array.isArray((payload as { errors?: unknown }).errors);
}

async function answersWithGraphql(nodeUrl: string, fetchImplementation: typeof fetch): Promise<boolean> {
  try {
    const response = await fetchImplementation(nodeEndpointUrl(nodeUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: "{ __typename }" }),
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MILLISECONDS)
    });
    return isGraphqlAnswer(await response.json());
  } catch {
    // A network failure (the browser can't read a proxy's own 404, which
    // carries no CORS headers) or a body that isn't JSON.
    return false;
  }
}

async function answersHealth(nodeUrl: string, fetchImplementation: typeof fetch): Promise<boolean> {
  try {
    await fetchImplementation(`${nodeUrl}/health`, { method: "GET", signal: AbortSignal.timeout(CHECK_TIMEOUT_MILLISECONDS) });
    return true;
  } catch {
    return false;
  }
}

/** The check itself, with no memory: one request, or two when the first finds nothing. */
export async function checkNodeEndpoint(nodeUrl: string, fetchImplementation: typeof fetch = fetch): Promise<NodeEndpointAvailability> {
  const normalized = normalizeNodeUrl(nodeUrl);
  if (await answersWithGraphql(normalized, fetchImplementation)) return "available";
  return (await answersHealth(normalized, fetchImplementation)) ? "closed" : "unreachable";
}

/** The check, remembered per node for the page (except `unreachable`). */
export function nodeEndpointAvailability(nodeUrl: string): Promise<NodeEndpointAvailability> {
  const normalized = normalizeNodeUrl(nodeUrl);
  const known = remembered.get(normalized);
  if (known) return known;
  const checking = checkNodeEndpoint(normalized);
  remembered.set(normalized, checking);
  void checking.then((availability) => {
    if (availability === "unreachable") remembered.delete(normalized);
  });
  return checking;
}
