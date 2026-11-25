import { describe, expect, test } from "bun:test";

import { connectionErrorMessage } from "@/lib/companies/connection-messages";
import { GlNodeError } from "@/lib/gl-node/client";

const NODE = "https://ledger.example.com";

describe("connectionErrorMessage", () => {
  test("a role too low for the action says the key can't do it", () => {
    expect(connectionErrorMessage(new GlNodeError("forbidden", "needs a write key", { code: "FORBIDDEN" }), NODE)).toBe("Your key can't do this.");
  });

  test("the operator key's two extra answers get plain words, not the node's", () => {
    const missing = new GlNodeError("graphql", 'this node serves no ledger named "nope"', { status: 404, code: "NO_SUCH_LEDGER" });
    expect(connectionErrorMessage(missing, NODE, "operator")).toBe("This node has no company by that name.");
    const notServed = new GlNodeError("graphql", 'ledger "acme" is not served: bad config', { status: 503, code: "LEDGER_NOT_SERVED" });
    expect(connectionErrorMessage(notServed, NODE, "operator")).toBe("That company is on this node but failed to start. Its operator can see why in the node's log.");
  });

  test("other GraphQL errors keep the node's message", () => {
    expect(connectionErrorMessage(new GlNodeError("graphql", "unbalanced transaction", { code: "BAD_USER_INPUT" }), NODE)).toBe("unbalanced transaction");
  });
});
