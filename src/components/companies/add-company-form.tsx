"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import type { FieldSize } from "@/components/ui/field-styles";
import { NodeUrlField, startingNodeUrl } from "@/components/companies/node-url-field";
import { InputField } from "@/components/ui/input-field";
import type { Company, FieldErrors } from "@/lib/companies/company";
import { signIn } from "@/lib/companies/sign-in";
import { rememberCompany } from "@/lib/companies/use-companies";

type AddCompanyFormProperties = {
  /** "lg" on the sign-in page, "sm" inside the company picker. */
  size?: FieldSize;
  initialNodeUrl?: string;
  initialLedgerName?: string;
  submitLabel: string;
  busyLabel: string;
  /** Called once the company is remembered and active. */
  onAdded: (company: Company) => void;
  onCancel?: () => void;
};

/**
 * A company you have a key for: its node, its name there, and your key.
 * Checked against the node before it is remembered.
 */
export function AddCompanyForm({ size = "lg", initialNodeUrl, initialLedgerName = "", submitLabel, busyLabel, onAdded, onCancel }: AddCompanyFormProperties) {
  const [nodeUrl, setNodeUrl] = useState(() => startingNodeUrl(initialNodeUrl));
  const [ledgerName, setLedgerName] = useState(initialLedgerName);
  const [apiKey, setApiKey] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const compact = size === "sm";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const result = await signIn({ nodeUrl, ledgerName, apiKey });
    if (result.ok) {
      rememberCompany(result.company);
      onAdded(result.company);
      return;
    }
    setFieldErrors(result.fieldErrors);
    setMessage(result.message);
    setBusy(false);
  }

  return (
    <form noValidate onSubmit={handleSubmit} className={`flex flex-col text-left ${compact ? "gap-2" : "gap-4"}`}>
      <NodeUrlField size={size} autoFocus={compact} disabled={busy} value={nodeUrl} error={fieldErrors.nodeUrl} onChange={setNodeUrl} />
      <InputField
        label="Company"
        size={size}
        autoComplete="off"
        spellCheck={false}
        placeholder="acme"
        disabled={busy}
        value={ledgerName}
        error={fieldErrors.ledgerName}
        onChange={(event) => setLedgerName(event.target.value)}
      />
      <InputField
        label="Key"
        size={size}
        type="password"
        autoComplete="current-password"
        disabled={busy}
        value={apiKey}
        error={fieldErrors.apiKey}
        onChange={(event) => setApiKey(event.target.value)}
      />
      {message ? <p className={`${compact ? "text-xs" : "text-sm"} text-[var(--color-negative)]`}>{message}</p> : null}
      <FormButtons compact={compact} busy={busy} submitLabel={submitLabel} busyLabel={busyLabel} onCancel={onCancel} />
    </form>
  );
}

export function FormButtons({
  compact,
  busy,
  submitLabel,
  busyLabel,
  onCancel
}: {
  compact: boolean;
  busy: boolean;
  submitLabel: string;
  busyLabel: string;
  onCancel?: () => void;
}) {
  if (!compact) {
    return (
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
        {busy ? busyLabel : submitLabel}
      </Button>
    );
  }
  // The picker's small buttons, as in the old company picker.
  return (
    <div className="flex gap-2">
      <button type="submit" disabled={busy} className="rounded bg-[var(--color-action-standard)] px-2 py-1 text-xs font-medium text-white disabled:opacity-50">
        {busy ? busyLabel : submitLabel}
      </button>
      {onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded px-2 py-1 text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-action-passive-subtle-hover)]"
        >
          Cancel
        </button>
      ) : null}
    </div>
  );
}
