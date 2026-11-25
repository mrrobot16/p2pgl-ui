"use client";

import { useState, type FormEvent } from "react";

import { FormButtons } from "@/components/companies/add-company-form";
import type { FieldSize } from "@/components/ui/field-styles";
import { InputField } from "@/components/ui/input-field";
import type { Company, FieldErrors } from "@/lib/companies/company";
import { createCompany } from "@/lib/companies/create-company";
import { rememberCompany } from "@/lib/companies/use-companies";

type CreateCompanyFormProperties = {
  size?: FieldSize;
  initialNodeUrl?: string;
  onCreated: (company: Company) => void;
  onCancel?: () => void;
};

/**
 * A new company on a node, made with the node's operator key. The person
 * creating it becomes its first admin and gets their own key; the operator
 * key is used for this one creation and kept nowhere.
 */
export function CreateCompanyForm({ size = "lg", initialNodeUrl = "", onCreated, onCancel }: CreateCompanyFormProperties) {
  const [nodeUrl, setNodeUrl] = useState(initialNodeUrl);
  const [ledgerName, setLedgerName] = useState("");
  const [personName, setPersonName] = useState("");
  const [operatorKey, setOperatorKey] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const compact = size === "sm";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const result = await createCompany({ nodeUrl, ledgerName, operatorKey, personName });
    // The operator key is not needed again; drop it from the form at once.
    setOperatorKey("");
    if (result.ok) {
      rememberCompany(result.company);
      onCreated(result.company);
      return;
    }
    setFieldErrors(result.fieldErrors);
    setMessage(result.message);
    setBusy(false);
  }

  return (
    <form noValidate onSubmit={handleSubmit} className={`flex flex-col text-left ${compact ? "gap-2" : "gap-4"}`}>
      <InputField
        label="Node URL"
        size={size}
        type="url"
        inputMode="url"
        autoComplete="url"
        placeholder="https://ledger.example.com"
        autoFocus={compact}
        disabled={busy}
        value={nodeUrl}
        error={fieldErrors.nodeUrl}
        onChange={(event) => setNodeUrl(event.target.value)}
      />
      <InputField
        label="Company name"
        size={size}
        autoComplete="off"
        spellCheck={false}
        placeholder="acme"
        hint={compact ? undefined : "Lowercase letters, digits and hyphens; it's the company's name on the node."}
        disabled={busy}
        value={ledgerName}
        error={fieldErrors.ledgerName}
        onChange={(event) => setLedgerName(event.target.value)}
      />
      <InputField
        label="Your name"
        size={size}
        autoComplete="name"
        disabled={busy}
        value={personName}
        error={fieldErrors.personName}
        onChange={(event) => setPersonName(event.target.value)}
      />
      <InputField
        label="Operator key"
        size={size}
        type="password"
        autoComplete="off"
        hint={compact ? undefined : "The node's own key. It's used once to create the company and isn't kept."}
        disabled={busy}
        value={operatorKey}
        error={fieldErrors.apiKey}
        onChange={(event) => setOperatorKey(event.target.value)}
      />
      {message ? <p className={`${compact ? "text-xs" : "text-sm"} text-[var(--color-negative)]`}>{message}</p> : null}
      <FormButtons compact={compact} busy={busy} submitLabel="Create" busyLabel="Creating…" onCancel={onCancel} />
    </form>
  );
}
