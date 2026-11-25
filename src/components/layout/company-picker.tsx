"use client";

import { Building2, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { AddCompanyForm } from "@/components/companies/add-company-form";
import { CreateCompanyForm } from "@/components/companies/create-company-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useDismiss } from "@/hooks/use-dismiss";
import { forgetCompany, switchCompany, useCompanies } from "@/lib/companies/use-companies";

type NewCompanyMode = "add" | "create";

/**
 * The top header's company menu, as in the old app: the active company,
 * every company of this tab, a way to forget one, and *New company* to add
 * one you have a key for or create one with the node's operator key.
 * Choosing another company reloads the page under it.
 */
export function CompanyPicker() {
  const { ready, companies, active } = useCompanies();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [newCompanyMode, setNewCompanyMode] = useState<NewCompanyMode | null>(null);
  const [forgettingIdentifier, setForgettingIdentifier] = useState<string | null>(null);
  const containerReference = useRef<HTMLDivElement>(null);
  const triggerReference = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    setNewCompanyMode(null);
    setForgettingIdentifier(null);
  }
  useDismiss(containerReference, open, close, triggerReference);

  // The size of the real trigger, so the header never shifts while loading.
  if (!ready || !active) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-3.5 w-3.5 rounded" />
      </div>
    );
  }

  function choose(identifier: string) {
    if (identifier === active?.identifier) {
      close();
      return;
    }
    setSwitching(true);
    switchCompany(identifier);
  }

  function forget(identifier: string) {
    const wasActive = identifier === active?.identifier;
    forgetCompany(identifier);
    setForgettingIdentifier(null);
    // The active company changed (or none is left): reload under the next one, or go to sign-in.
    if (wasActive) window.location.reload();
  }

  return (
    <div className="relative" ref={containerReference}>
      <button
        ref={triggerReference}
        type="button"
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-text-global)] transition-colors hover:bg-[var(--color-action-passive-subtle-hover)]"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        disabled={switching}
      >
        <Building2 className="h-4 w-4 text-[var(--color-icon-secondary)]" aria-hidden="true" />
        {switching ? "Switching…" : active.label}
        <ChevronDown className="h-3.5 w-3.5 text-[var(--color-icon-secondary)]" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Companies"
          className="absolute left-0 top-full z-10 mt-2 w-64 overflow-hidden rounded-lg border border-[var(--color-divider-tertiary)] bg-[var(--color-container-background-primary)] py-1 shadow-lg"
        >
          {companies.map((company) =>
            forgettingIdentifier === company.identifier ? (
              <div key={company.identifier} className="flex flex-col gap-2 px-3 py-2">
                <p className="text-xs text-[var(--color-text-primary)]">
                  Remove <span className="font-medium">{company.label}</span>
                  {" from this browser? It stays on its node; you'll need its key to add it again."}
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => forget(company.identifier)} className="rounded bg-[var(--color-negative)] px-2 py-1 text-xs font-medium text-white">
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgettingIdentifier(null)}
                    className="rounded px-2 py-1 text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-action-passive-subtle-hover)]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div key={company.identifier} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={company.identifier === active.identifier}
                  title={`${company.ledgerName} on ${company.nodeUrl}`}
                  onClick={() => choose(company.identifier)}
                  className={`min-w-0 flex-1 truncate text-left transition-colors ${
                    company.identifier === active.identifier ? "text-[var(--color-link-action)]" : "text-[var(--color-text-global)]"
                  }`}
                >
                  {company.label}
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${company.label} from this browser`}
                  onClick={() => {
                    setNewCompanyMode(null);
                    setForgettingIdentifier(company.identifier);
                  }}
                  className="rounded p-1 text-[var(--color-icon-secondary)] transition-colors hover:bg-[var(--color-action-passive-subtle-hover)] hover:text-[var(--color-negative)]"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            )
          )}

          <div className="mt-1 border-t border-[var(--color-divider-tertiary)] pt-1">
            {newCompanyMode ? (
              <div className="flex flex-col gap-2 px-3 py-2">
                <div role="radiogroup" aria-label="New company" className="flex gap-1 rounded-md bg-[var(--color-segmented-background)] p-0.5 text-xs">
                  {(
                    [
                      ["add", "I have a key"],
                      ["create", "Create one"]
                    ] as const
                  ).map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      role="radio"
                      aria-checked={newCompanyMode === mode}
                      onClick={() => setNewCompanyMode(mode)}
                      className={`flex-1 rounded-[5px] px-2 py-1 ${
                        newCompanyMode === mode ? "bg-[var(--color-container-background-primary)] text-[var(--color-text-global)] shadow-sm" : "text-[var(--color-text-primary)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {newCompanyMode === "add" ? (
                  <AddCompanyForm
                    size="sm"
                    initialNodeUrl={active.nodeUrl}
                    submitLabel="Add"
                    busyLabel="Adding…"
                    onAdded={() => window.location.reload()}
                    onCancel={() => setNewCompanyMode(null)}
                  />
                ) : (
                  <CreateCompanyForm size="sm" initialNodeUrl={active.nodeUrl} onCreated={() => window.location.reload()} onCancel={() => setNewCompanyMode(null)} />
                )}
              </div>
            ) : (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setForgettingIdentifier(null);
                  setNewCompanyMode("add");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-text-global)] transition-colors hover:bg-[var(--color-action-passive-subtle-hover)]"
              >
                <Plus className="h-4 w-4 text-[var(--color-icon-secondary)]" aria-hidden="true" />
                New company
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
