import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

/** A reply accepted: the node now trusted, and where (step 5). */
export type AcceptedLedger = {
  __typename?: 'AcceptedLedger';
  address: Scalars['String']['output'];
  ledger: LedgerInfo;
  nodeId: Scalars['String']['output'];
};

/**
 * A company joined from an invitation, and the reply for the inviting
 * server's operator to accept (step 5).
 */
export type JoinedLedger = {
  __typename?: 'JoinedLedger';
  ledger: LedgerInfo;
  reply: Scalars['String']['output'];
  /**
   * The node ids this server now trusts for the company: every server the
   * invitation named, the inviter first. Each must accept the reply.
   */
  trusts: Array<Scalars['String']['output']>;
};

/** One ledger, as the node endpoint shows it. */
export type LedgerInfo = {
  __typename?: 'LedgerInfo';
  /** The UDP port its P2P endpoint listens on, when fixed. */
  listenPort: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  /**
   * Its node id, for the other nodes' `p2p.bootstrapEndpointIds`; none
   * when it neither signs nor replicates.
   */
  nodeId: Maybe<Scalars['String']['output']>;
  /** Why it is not served. */
  reason: Maybe<Scalars['String']['output']>;
  served: Scalars['Boolean']['output'];
};

export type NodeMutation = {
  __typename?: 'NodeMutation';
  /**
   * Accept a reply to this node's invitation: the replying server joins
   * the company's peers here, and the company restarts with it.
   */
  acceptLedger: AcceptedLedger;
  /**
   * Add and start ledger `name`, its folder made in `ledgersDir` with
   * `settings` as its `ledger.json` (none: `{}`, a ledger of its own with
   * no mesh) — or, with `newMeshPorts` (`FROM-TO`), in a mesh of its own
   * on a free UDP port in that range.
   */
  addLedger: LedgerInfo;
  /**
   * An invitation to company `name`'s mesh, for a second server: one line
   * with its mesh and this node's id, `address` the host other servers
   * reach this one by (its domain, or its IP address).
   */
  inviteLedger: Scalars['String']['output'];
  /**
   * Join the company an invitation invites to: added here in its mesh on
   * a free UDP port of `newMeshPorts` (`FROM-TO`), the inviting server its
   * peer; `address` is this server's. The reply goes back to the inviting
   * server, for `acceptLedger`.
   */
  joinLedger: JoinedLedger;
  /** Stop ledger `name` and move its folder to `ledgersDir/.removed/`. */
  removeLedger: RemovedLedger;
  /** Stop ledger `name` and start it again from its `ledger.json`. */
  restartLedger: LedgerInfo;
};


export type NodeMutationAcceptLedgerArgs = {
  reply: Scalars['String']['input'];
};


export type NodeMutationAddLedgerArgs = {
  name: Scalars['String']['input'];
  newMeshPorts: InputMaybe<Scalars['String']['input']>;
  settings: InputMaybe<Scalars['String']['input']>;
};


export type NodeMutationInviteLedgerArgs = {
  address: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type NodeMutationJoinLedgerArgs = {
  address: Scalars['String']['input'];
  invitation: Scalars['String']['input'];
  newMeshPorts: Scalars['String']['input'];
};


export type NodeMutationRemoveLedgerArgs = {
  name: Scalars['String']['input'];
};


export type NodeMutationRestartLedgerArgs = {
  name: Scalars['String']['input'];
};

export type NodeQuery = {
  __typename?: 'NodeQuery';
  /** Every ledger the node holds, by name: served, or refused and why. */
  ledgers: Array<LedgerInfo>;
};

/** A ledger removed: where its folder went. */
export type RemovedLedger = {
  __typename?: 'RemovedLedger';
  /** The folder's new place; none when it had no folder left to move. */
  movedTo: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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

export const NodeLedgersDocument = new TypedDocumentString(`
    query NodeLedgers {
  ledgers {
    name
    served
    reason
  }
}
    `) as unknown as TypedDocumentString<NodeLedgersQuery, NodeLedgersQueryVariables>;