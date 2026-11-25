import { GlNodeError } from "@/lib/gl-node/client";

/** gl-node 0.5.0 can't say a key's role, so this is said where an action is refused. */
export const FORBIDDEN_MESSAGE = "Your key can't do this.";

/** 404 `NO_SUCH_LEDGER`: only the operator key gets it (a person's key gets 401). */
export const NO_SUCH_COMPANY_MESSAGE = "This node has no company by that name.";

/** 503 `LEDGER_NOT_SERVED`: the company exists but failed to start (operator key only). */
export const COMPANY_NOT_SERVED_MESSAGE = "That company is on this node but failed to start. Its operator can see why in the node's log.";

/**
 * What the person reads when talking to a node fails, by what failed.
 * `keyKind` names the key in play: a company key, or the node's operator key.
 */
export function connectionErrorMessage(error: unknown, nodeUrl: string, keyKind: "company" | "operator" = "company"): string {
  if (!(error instanceof GlNodeError)) return "Something went wrong. Please try again.";
  switch (error.kind) {
    case "unauthorized":
      return keyKind === "operator" ? "That isn't this node's operator key." : "That key isn't accepted for this company.";
    case "unreachable":
      return `Can't reach ${nodeUrl}. Check the address, that the node is running, and that its cors.allowedOrigins includes ${originHint()}.`;
    case "forbidden":
      return FORBIDDEN_MESSAGE;
    case "rateLimited":
      return `Too many requests to ${nodeUrl} from this address. Wait a moment and try again.`;
    case "graphql":
      if (error.code === "NO_SUCH_LEDGER") return NO_SUCH_COMPANY_MESSAGE;
      if (error.code === "LEDGER_NOT_SERVED") return COMPANY_NOT_SERVED_MESSAGE;
      return error.message;
    case "httpStatus":
    case "invalidResponse":
      return `${nodeUrl} didn't answer as a gl-node does. Check the address.`;
  }
}

function originHint(): string {
  return typeof window === "undefined" ? "this app's address" : window.location.origin;
}
