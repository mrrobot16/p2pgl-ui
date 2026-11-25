"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AddCompanyForm } from "@/components/companies/add-company-form";
import { AuthFrame } from "@/components/companies/auth-frame";

/** `/sign-in?node=…&company=…` fills in a company whose key was refused; never the key. */
function SignInForm() {
  const searchParameters = useSearchParams();
  return (
    <AddCompanyForm
      size="lg"
      initialNodeUrl={searchParameters.get("node") ?? ""}
      initialLedgerName={searchParameters.get("company") ?? ""}
      submitLabel="Sign in"
      busyLabel="Signing in…"
      // A full load, so the app starts clean on the new company.
      onAdded={() => window.location.assign("/")}
    />
  );
}

export function SignInScreen() {
  return (
    <AuthFrame footer={{ question: "Don't have a company?", linkLabel: "Create one", href: "/create-company" }}>
      <h1 className="mb-1 text-2xl font-semibold text-[var(--color-text-global)]">Welcome back</h1>
      <p className="mb-6 text-sm text-[var(--color-text-primary)]">Sign in to your books.</p>
      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </AuthFrame>
  );
}
