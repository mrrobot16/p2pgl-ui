"use client";

import { useEffect, useState } from "react";

import { nodeUrlProblem } from "@/lib/companies/company";
import { nodeEndpointAvailability, type NodeEndpointAvailability } from "@/lib/companies/node-endpoint";
import { normalizeNodeUrl } from "@/lib/gl-node/client";

/** `checking` while the answer for the current address is on its way, or the address isn't complete yet. */
export type NodeEndpointState = NodeEndpointAvailability | "checking";

// Wait for typing to stop before asking (the node allows 60 requests a
// minute per address); a node chosen from the list is asked at once.
const TYPING_PAUSE_MILLISECONDS = 500;

/** Whether the node at `nodeUrl` takes new companies from the browser (src/lib/companies/node-endpoint.ts). */
export function useNodeEndpoint(nodeUrl: string): NodeEndpointState {
  const [answer, setAnswer] = useState<{ nodeUrl: string; availability: NodeEndpointAvailability } | null>(null);
  const complete = nodeUrlProblem(nodeUrl) === null;
  const normalized = complete ? normalizeNodeUrl(nodeUrl) : null;

  useEffect(() => {
    if (normalized === null) return;
    let current = true;
    const timer = window.setTimeout(() => {
      void nodeEndpointAvailability(normalized).then((availability) => {
        if (current) setAnswer({ nodeUrl: normalized, availability });
      });
    }, TYPING_PAUSE_MILLISECONDS);
    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [normalized]);

  return answer !== null && answer.nodeUrl === normalized ? answer.availability : "checking";
}
