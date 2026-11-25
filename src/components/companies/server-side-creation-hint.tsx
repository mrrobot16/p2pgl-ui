type ServerSideCreationHintProperties = {
  nodeUrl: string;
  compact: boolean;
  onCancel?: () => void;
};

function hostOf(nodeUrl: string): string {
  try {
    return new URL(nodeUrl).host;
  } catch {
    return nodeUrl;
  }
}

function Command({ children, compact }: { children: string; compact: boolean }) {
  return (
    <code
      className={`block whitespace-pre-wrap break-words rounded bg-[var(--color-container-background-secondary)] px-3 py-2 font-mono text-[var(--color-text-global)] ${compact ? "text-[11px]" : "text-xs"}`}
    >
      {children}
    </code>
  );
}

/**
 * In place of the create form on a node that keeps `/node/graphql` closed:
 * a server set up by the openledger installer, where companies are made on
 * the server itself (src/lib/companies/node-endpoint.ts).
 */
export function ServerSideCreationHint({ nodeUrl, compact, onCancel }: ServerSideCreationHintProperties) {
  const textSize = compact ? "text-xs" : "text-sm";
  return (
    <div role="note" className={`flex flex-col gap-2 ${textSize} text-[var(--color-text-primary)]`}>
      <p>
        <span className="font-medium text-[var(--color-text-global)]">{hostOf(nodeUrl)}</span>
        {" creates companies on the server, not here. On the server, run:"}
      </p>
      <Command compact={compact}>sudo openledger company add NAME</Command>
      <p>Then make yourself a key:</p>
      <Command compact={compact}>{'sudo openledger person add NAME --name "Your name" --role admin'}</Command>
      <p>And sign in with it.</p>
      {onCancel ? (
        <div>
          <button type="button" onClick={onCancel} className="rounded px-2 py-1 text-xs font-medium text-[var(--color-link-text)] hover:underline">
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  );
}
