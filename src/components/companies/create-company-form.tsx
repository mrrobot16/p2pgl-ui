"use client";

import { useState, type FormEvent } from "react";

import { FormButtons } from "@/components/companies/add-company-form";
import { NewKeyPanel } from "@/components/companies/new-key-panel";
import { NodeUrlField, startingNodeUrl } from "@/components/companies/node-url-field";
import { ServerSideCreationHint } from "@/components/companies/server-side-creation-hint";
import type { FieldSize } from "@/components/ui/field-styles";
import { InputField } from "@/components/ui/input-field";
import type { Company, FieldErrors } from "@/lib/companies/company";
import { createCompany } from "@/lib/companies/create-company";
import { rememberCompany } from "@/lib/companies/use-companies";
import { useNodeEndpoint } from "@/lib/companies/use-node-endpoint";

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
export function CreateCompanyForm({ size = "lg", initialNodeUrl, onCreated, onCancel }: CreateCompanyFormProperties) {
  const [nodeUrl, setNodeUrl] = useState(() => startingNodeUrl(initialNodeUrl));
  const [ledgerName, setLedgerName] = useState("");
  const [personName, setPersonName] = useState("");
  const [operatorKey, setOperatorKey] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // The new company, held until its key has been shown (NewKeyPanel).
  const [created, setCreated] = useState<Company | null>(null);
  const nodeEndpoint = useNodeEndpoint(nodeUrl);
  const compact = size === "sm";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const result = await createCompany({ nodeUrl, ledgerName, operatorKey, personName });
    // The operator key is not needed again; drop it from the form at once.
    setOperatorKey("");
    if (result.ok) {
      setCreated(result.company);
      return;
    }
    setFieldErrors(result.fieldErrors);
    setMessage(result.message);
    setBusy(false);
  }

  if (created) {
    return (
      <NewKeyPanel
        companyName={created.ledgerName}
        apiKey={created.apiKey}
        compact={compact}
        onContinue={() => {
          // Remembered (and made active) only now, so the page behind the
          // picker never shows the new company over the old one's data.
          rememberCompany(created);
          onCreated(created);
        }}
      />
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className={`flex flex-col text-left ${compact ? "gap-2" : "gap-4"}`}>
      <NodeUrlField size={size} autoFocus={compact} disabled={busy} value={nodeUrl} error={fieldErrors.nodeUrl} onChange={setNodeUrl} />
      {nodeEndpoint === "closed" ? (
        <ServerSideCreationHint nodeUrl={nodeUrl} compact={compact} onCancel={onCancel} />
      ) : (
        <CreateFields
          compact={compact}
          size={size}
          busy={busy}
          ledgerName={ledgerName}
          personName={personName}
          operatorKey={operatorKey}
          fieldErrors={fieldErrors}
          message={message}
          onLedgerNameChange={setLedgerName}
          onPersonNameChange={setPersonName}
          onOperatorKeyChange={setOperatorKey}
          onCancel={onCancel}
        />
      )}
    </form>
  );
}

type CreateFieldsProperties = {
  compact: boolean;
  size: FieldSize;
  busy: boolean;
  ledgerName: string;
  personName: string;
  operatorKey: string;
  fieldErrors: FieldErrors;
  message: string | null;
  onLedgerNameChange: (ledgerName: string) => void;
  onPersonNameChange: (personName: string) => void;
  onOperatorKeyChange: (operatorKey: string) => void;
  onCancel?: () => void;
};

/** The rest of the form, for a node that creates companies from the browser. */
function CreateFields({
  compact,
  size,
  busy,
  ledgerName,
  personName,
  operatorKey,
  fieldErrors,
  message,
  onLedgerNameChange,
  onPersonNameChange,
  onOperatorKeyChange,
  onCancel
}: CreateFieldsProperties) {
  return (
    <>
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
        onChange={(event) => onLedgerNameChange(event.target.value)}
      />
      <InputField
        label="Your name"
        size={size}
        autoComplete="name"
        disabled={busy}
        value={personName}
        error={fieldErrors.personName}
        onChange={(event) => onPersonNameChange(event.target.value)}
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
        onChange={(event) => onOperatorKeyChange(event.target.value)}
      />
      {message ? <p className={`${compact ? "text-xs" : "text-sm"} text-[var(--color-negative)]`}>{message}</p> : null}
      <FormButtons compact={compact} busy={busy} submitLabel="Create" busyLabel="Creating…" onCancel={onCancel} />
    </>
  );
}
