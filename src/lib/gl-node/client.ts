import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";

/** Where a request goes and the key it carries as `X-Api-Key`. */
export type GlNodeEndpoint = {
  url: string;
  apiKey: string;
};

/**
 * What went wrong, sorted so a screen can say something useful:
 * - `unauthorized`: HTTP 401. The key is refused, or the node does not serve
 *   that ledger name (it answers both alike).
 * - `forbidden`: the key is known but its role is too low (`FORBIDDEN`).
 * - `unreachable`: no answer reached the page: the node is down, the browser
 *   refused the call (CORS), or an HTTPS page called a plain-HTTP node.
 *   Browsers do not tell these apart.
 * - `httpStatus`: any other non-success HTTP status.
 * - `graphql`: the node answered with a GraphQL error (`code` when it gave one).
 * - `invalidResponse`: the answer was not GraphQL's JSON shape.
 */
export type GlNodeErrorKind = "unauthorized" | "forbidden" | "unreachable" | "httpStatus" | "graphql" | "invalidResponse";

export class GlNodeError extends Error {
  readonly kind: GlNodeErrorKind;
  readonly status: number | null;
  readonly code: string | null;

  constructor(kind: GlNodeErrorKind, message: string, options: { status?: number | null; code?: string | null; cause?: unknown } = {}) {
    super(message, { cause: options.cause });
    this.name = "GlNodeError";
    this.kind = kind;
    this.status = options.status ?? null;
    this.code = options.code ?? null;
  }
}

/** The node's base URL without trailing slashes. */
export function normalizeNodeUrl(nodeUrl: string): string {
  return nodeUrl.trim().replace(/\/+$/, "");
}

/** A company's books: `<node>/ledgers/<name>/graphql`. */
export function ledgerEndpointUrl(nodeUrl: string, ledgerName: string): string {
  return `${normalizeNodeUrl(nodeUrl)}/ledgers/${encodeURIComponent(ledgerName)}/graphql`;
}

/** The node endpoint, for the operator key only: `<node>/node/graphql`. */
export function nodeEndpointUrl(nodeUrl: string): string {
  return `${normalizeNodeUrl(nodeUrl)}/node/graphql`;
}

type GraphqlErrorPayload = {
  message?: unknown;
  extensions?: { code?: unknown } | null;
};

type GraphqlResponsePayload<Result> = {
  data?: Result | null;
  errors?: GraphqlErrorPayload[] | null;
};

function errorCode(error: GraphqlErrorPayload): string | null {
  const code = error.extensions?.code;
  return typeof code === "string" ? code : null;
}

function errorMessage(error: GraphqlErrorPayload): string {
  return typeof error.message === "string" && error.message.trim() !== "" ? error.message : "The node refused the request.";
}

/**
 * Sends one generated GraphQL operation to gl-node with plain `fetch`.
 * Resolves with the operation's typed `data`; rejects with a `GlNodeError`.
 * A response carrying errors is a failure even when it also carries data:
 * no screen shows half an answer.
 */
export async function requestGraphql<Result, Variables>(
  endpoint: GlNodeEndpoint,
  document: DocumentTypeDecoration<Result, Variables> & { toString(): string },
  variables?: Variables,
  fetchImplementation: typeof fetch = fetch
): Promise<Result> {
  let response: Response;
  try {
    response = await fetchImplementation(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Api-Key": endpoint.apiKey
      },
      body: JSON.stringify({ query: document.toString(), variables: variables ?? {} })
    });
  } catch (cause) {
    throw new GlNodeError("unreachable", "The node could not be reached.", { cause });
  }

  if (response.status === 401) {
    throw new GlNodeError("unauthorized", "The key was not accepted.", { status: 401 });
  }

  let payload: GraphqlResponsePayload<Result>;
  try {
    payload = (await response.json()) as GraphqlResponsePayload<Result>;
  } catch (cause) {
    if (!response.ok) {
      throw new GlNodeError("httpStatus", `The node answered with HTTP ${response.status}.`, { status: response.status, cause });
    }
    throw new GlNodeError("invalidResponse", "The node's answer could not be read.", { status: response.status, cause });
  }

  const errors = Array.isArray(payload?.errors) ? payload.errors : [];
  if (errors.length > 0) {
    const forbidden = errors.find((error) => errorCode(error) === "FORBIDDEN");
    if (forbidden) {
      throw new GlNodeError("forbidden", errorMessage(forbidden), { status: response.status, code: "FORBIDDEN" });
    }
    const [firstError] = errors;
    throw new GlNodeError("graphql", errorMessage(firstError), { status: response.status, code: errorCode(firstError) });
  }

  if (!response.ok) {
    throw new GlNodeError("httpStatus", `The node answered with HTTP ${response.status}.`, { status: response.status });
  }

  if (payload?.data === undefined || payload.data === null) {
    throw new GlNodeError("invalidResponse", "The node's answer had no data.", { status: response.status });
  }

  return payload.data;
}
