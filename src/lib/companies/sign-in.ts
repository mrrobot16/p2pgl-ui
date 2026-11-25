import { LedgerHealthDocument } from "@/graphql/generated/ledger";
import { companyInputProblems, hasProblems, makeCompany, type Company, type CompanyInput, type FieldErrors } from "@/lib/companies/company";
import { connectionErrorMessage } from "@/lib/companies/connection-messages";
import { ledgerEndpointUrl, requestGraphql } from "@/lib/gl-node/client";

export type SignInResult = { ok: true; company: Company } | { ok: false; fieldErrors: FieldErrors; message: string | null };

/**
 * Checks a company's node, name and key by making the cheapest call the key
 * allows, and returns the company to remember. This is the one place
 * sign-in happens: when gl-node gains email and password (entry 013), the
 * form changes and this function's body changes; the screens behind it
 * don't.
 */
export async function signIn(input: CompanyInput, fetchImplementation: typeof fetch = fetch): Promise<SignInResult> {
  const fieldErrors = companyInputProblems(input);
  if (hasProblems(fieldErrors)) return { ok: false, fieldErrors, message: null };

  const company = makeCompany(input);
  try {
    await requestGraphql(
      { url: ledgerEndpointUrl(company.nodeUrl, company.ledgerName), apiKey: company.apiKey },
      LedgerHealthDocument,
      undefined,
      fetchImplementation
    );
  } catch (error) {
    return { ok: false, fieldErrors: {}, message: connectionErrorMessage(error, company.nodeUrl) };
  }
  return { ok: true, company };
}
