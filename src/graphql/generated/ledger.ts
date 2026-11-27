import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** A role, as the admin API names it. */
export type AccessRole =
  /** Everything, including managing people and keys. */
  | 'ADMIN'
  /** Reports, balances, the journal: nothing that changes anything. */
  | 'READ'
  /** Read, and enter transactions and manage accounts. */
  | 'WRITE';

export type GrantAccessMutationVariables = Exact<{
  name: string;
  role: AccessRole;
}>;


export type GrantAccessMutation = { grantAccess: { userId: string, name: string, role: AccessRole, key: string } };

export type LedgerHealthQueryVariables = Exact<{ [key: string]: never; }>;


export type LedgerHealthQuery = { health: { status: string, version: string } };

export type TrialBalanceQueryVariables = Exact<{
  at: string;
}>;


export type TrialBalanceQuery = { trialBalance: { at: string, totalDebit: string, totalCredit: string, exact: boolean, rows: Array<{ account: string, debit: string, credit: string }> } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const GrantAccessDocument = new TypedDocumentString(`
    mutation GrantAccess($name: String!, $role: AccessRole!) {
  grantAccess(name: $name, role: $role) {
    userId
    name
    role
    key
  }
}
    `) as unknown as TypedDocumentString<GrantAccessMutation, GrantAccessMutationVariables>;
export const LedgerHealthDocument = new TypedDocumentString(`
    query LedgerHealth {
  health {
    status
    version
  }
}
    `) as unknown as TypedDocumentString<LedgerHealthQuery, LedgerHealthQueryVariables>;
export const TrialBalanceDocument = new TypedDocumentString(`
    query TrialBalance($at: Date!) {
  trialBalance(at: $at) {
    at
    totalDebit
    totalCredit
    exact
    rows {
      account
      debit
      credit
    }
  }
}
    `) as unknown as TypedDocumentString<TrialBalanceQuery, TrialBalanceQueryVariables>;