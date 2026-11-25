import { GrantAccessDocument } from "@/graphql/generated/ledger";
import { AddLedgerDocument } from "@/graphql/generated/node";
import { companyInputProblems, hasProblems, makeCompany, type Company, type FieldErrors } from "@/lib/companies/company";
import { connectionErrorMessage } from "@/lib/companies/connection-messages";
import { GlNodeError, ledgerEndpointUrl, nodeEndpointUrl, normalizeNodeUrl, requestGraphql } from "@/lib/gl-node/client";

/**
 * The UDP ports a new company's mesh may use: the installer's range
 * (openledger-v2 session, 2026-11-24). A later gl-node lets addLedger pick
 * from the node's own range, and this argument goes.
 */
export const NEW_MESH_PORTS = "4433-4532";

export type CreateCompanyInput = {
  nodeUrl: string;
  ledgerName: string;
  /** The node's operator key: used for this one creation, never stored. */
  operatorKey: string;
  /** The name the first person (an admin) is given on the new company. */
  personName: string;
};

export type CreateCompanyResult = { ok: true; company: Company } | { ok: false; fieldErrors: FieldErrors; message: string | null };

export function createCompanyProblems(input: CreateCompanyInput): FieldErrors {
  const problems = companyInputProblems({ nodeUrl: input.nodeUrl, ledgerName: input.ledgerName, apiKey: input.operatorKey }, "node's operator key");
  if (input.personName.trim() === "") problems.personName = "Enter your name.";
  return problems;
}

/**
 * Creates a company on a node: `addLedger` on the node endpoint, then
 * `grantAccess` (admin, for the person creating it) on the new ledger, both
 * with the operator key. Returns the company with the person's own key; the
 * operator key is not kept anywhere.
 */
export async function createCompany(input: CreateCompanyInput, fetchImplementation: typeof fetch = fetch): Promise<CreateCompanyResult> {
  const fieldErrors = createCompanyProblems(input);
  if (hasProblems(fieldErrors)) return { ok: false, fieldErrors, message: null };

  const nodeUrl = normalizeNodeUrl(input.nodeUrl);
  const ledgerName = input.ledgerName.trim();
  const operatorEndpoint = { apiKey: input.operatorKey.trim() };

  try {
    const added = await requestGraphql(
      { ...operatorEndpoint, url: nodeEndpointUrl(nodeUrl) },
      AddLedgerDocument,
      { name: ledgerName, newMeshPorts: NEW_MESH_PORTS },
      fetchImplementation
    );
    if (!added.addLedger.served) {
      return { ok: false, fieldErrors: {}, message: `The node added ${ledgerName} but isn't serving it: ${added.addLedger.reason ?? "no reason given"}.` };
    }
  } catch (error) {
    if (error instanceof GlNodeError && error.code === "LEDGER_EXISTS") {
      return { ok: false, fieldErrors: { ledgerName: "A company with that name already exists on this node." }, message: null };
    }
    return { ok: false, fieldErrors: {}, message: connectionErrorMessage(error, nodeUrl, "operator") };
  }

  try {
    const granted = await requestGraphql(
      { ...operatorEndpoint, url: ledgerEndpointUrl(nodeUrl, ledgerName) },
      GrantAccessDocument,
      { name: input.personName.trim(), role: "ADMIN" },
      fetchImplementation
    );
    return { ok: true, company: makeCompany({ nodeUrl, ledgerName, apiKey: granted.grantAccess.key }) };
  } catch (error) {
    // Never a silent half state: the ledger exists now, with no key for anyone.
    return {
      ok: false,
      fieldErrors: {},
      message: `${ledgerName} was created on the node, but its first key couldn't be made (${connectionErrorMessage(error, nodeUrl, "operator")}). The node's operator can issue one with: gl-node user --ledger ${ledgerName} add --name "${input.personName.trim()}" --role admin`
    };
  }
}
