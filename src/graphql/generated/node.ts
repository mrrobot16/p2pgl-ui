import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type AddLedgerMutationVariables = Exact<{
  name: string;
  newMeshPorts?: string | null | undefined;
}>;


export type AddLedgerMutation = { addLedger: { name: string, served: boolean, reason: string | null } };

export type NodeLedgersQueryVariables = Exact<{ [key: string]: never; }>;


export type NodeLedgersQuery = { ledgers: Array<{ name: string, served: boolean, reason: string | null }> };

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

export const AddLedgerDocument = new TypedDocumentString(`
    mutation AddLedger($name: String!, $newMeshPorts: String) {
  addLedger(name: $name, newMeshPorts: $newMeshPorts) {
    name
    served
    reason
  }
}
    `) as unknown as TypedDocumentString<AddLedgerMutation, AddLedgerMutationVariables>;
export const NodeLedgersDocument = new TypedDocumentString(`
    query NodeLedgers {
  ledgers {
    name
    served
    reason
  }
}
    `) as unknown as TypedDocumentString<NodeLedgersQuery, NodeLedgersQueryVariables>;