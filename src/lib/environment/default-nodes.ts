/** A node the sign-in form offers without typing its address. */
export type DefaultNode = {
  /** What users see in the node chooser. */
  label: string;
  /** Without a trailing slash, as the app stores node addresses (normalizeNodeUrl). */
  url: string;
};

// The known gl-nodes. Each environment picks the ones it offers in
// ENVIRONMENT_SETTINGS (src/lib/environment/environment-settings.ts).

/** gl-node on this machine (openledger-v2's local config). */
export const LEDGER_LOCAL_NODE: DefaultNode = { label: "Ledger LOCAL node", url: "http://127.0.0.1:4000" };

export const LEDGER_ONE_NODE: DefaultNode = { label: "Ledger ONE node", url: "https://ledger-node-a.p2pgl.com" };

export const LEDGER_TWO_NODE: DefaultNode = { label: "Ledger TWO node", url: "https://ledger-node-b.p2pgl.com" };

export const LEDGER_ROGUEONE_NODE: DefaultNode = { label: "Ledger ROGUEONE node", url: "https://ledger-node-rogueone.p2pgl.com" };

/** The deployed nodes (the maintainer's, gl-node 0.5.0), in the order the chooser lists them. */
export const DEPLOYED_NODES: readonly DefaultNode[] = [LEDGER_ONE_NODE, LEDGER_TWO_NODE, LEDGER_ROGUEONE_NODE];

/** Every known node, in the order the chooser lists them: this machine's first. */
export const ALL_DEFAULT_NODES: readonly DefaultNode[] = [LEDGER_LOCAL_NODE, ...DEPLOYED_NODES];
