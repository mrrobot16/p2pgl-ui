"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type NewKeyPanelProperties = {
  /** The company the key opens, as its name reads. */
  companyName: string;
  apiKey: string;
  compact?: boolean;
  onContinue: () => void;
};

/**
 * A key the node returns once (`grantAccess`): shown here, with a copy
 * button, before the person goes on. gl-node never shows it again.
 */
export function NewKeyPanel({ companyName, apiKey, compact = false, onContinue }: NewKeyPanelProperties) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      // The browser refused the clipboard: the key is selected in its field instead.
      setCopyFailed(true);
    }
  }

  const textSize = compact ? "text-xs" : "text-sm";

  return (
    <div className={`flex flex-col text-left ${compact ? "gap-2" : "gap-4"}`}>
      <h2 className={`${compact ? "text-sm" : "text-lg"} font-semibold text-[var(--color-text-global)]`}>Your key to {companyName}</h2>
      <div className="flex items-start gap-2">
        <textarea
          readOnly
          rows={3}
          aria-label="Your key"
          value={apiKey}
          onFocus={(event) => event.target.select()}
          className={`min-w-0 flex-1 resize-none break-all rounded border border-[var(--color-input-border-primary)] bg-[var(--color-input-background)] px-3 py-2 font-mono leading-snug text-[var(--color-input-text)] ${compact ? "text-xs" : "text-sm"}`}
        />
        <Button type="button" variant="secondary" size={compact ? "sm" : "md"} onClick={() => void copyKey()}>
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      {copyFailed ? <p className={`${textSize} text-[var(--color-negative)]`}>This browser didn&apos;t allow copying. Select the key and copy it yourself.</p> : null}
      <p className={`${textSize} text-[var(--color-text-primary)]`}>
        Copy it now and keep it somewhere safe. It can&apos;t be shown again, and you&apos;ll need it to sign in from another browser or after this tab
        closes.
      </p>
      <Button type="button" variant="primary" size={compact ? "sm" : "lg"} className={compact ? undefined : "w-full"} onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}
