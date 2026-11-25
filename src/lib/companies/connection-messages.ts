import { GlNodeError } from "@/lib/gl-node/client";

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
      return "This key isn't allowed to do that.";
    case "graphql":
      return error.message;
    case "httpStatus":
    case "invalidResponse":
      return `${nodeUrl} didn't answer as a gl-node does. Check the address.`;
  }
}

function originHint(): string {
  return typeof window === "undefined" ? "this app's address" : window.location.origin;
}
