"use client";

import { useSyncExternalStore } from "react";

import { AddCompanyForm } from "@/components/companies/add-company-form";
import { AuthFrame } from "@/components/companies/auth-frame";

function subscribeToNothing() {
  return () => undefined;
}

// The address's query string, read in the browser only. The form renders at
// once (an empty query on the server and the first paint) instead of
// waiting behind a Suspense boundary, so the page doesn't jump when it
// appears (performance skill: no layout shift).
function useQueryString(): string {
  return useSyncExternalStore(
    subscribeToNothing,
    () => window.location.search,
    () => ""
  );
}

export function SignInScreen() {
  const queryString = useQueryString();
  // `/sign-in?node=…&company=…` fills in a company whose key was refused; never the key.
  const prefill = new URLSearchParams(queryString);
  return (
    <AuthFrame footer={{ question: "Don't have a company?", linkLabel: "Create one", href: "/create-company" }}>
      <h1 className="mb-1 text-2xl font-semibold text-[var(--color-text-global)]">Welcome back</h1>
      <p className="mb-6 text-sm text-[var(--color-text-primary)]">Sign in to your books.</p>
      <AddCompanyForm
        // A new query string starts the form over with its values.
        key={queryString}
        size="lg"
        initialNodeUrl={prefill.get("node") ?? ""}
        initialLedgerName={prefill.get("company") ?? ""}
        submitLabel="Sign in"
        busyLabel="Signing in…"
        // A full load, so the app starts clean on the new company.
        onAdded={() => window.location.assign("/")}
      />
    </AuthFrame>
  );
}
