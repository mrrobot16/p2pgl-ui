"use client";

import { AuthFrame } from "@/components/companies/auth-frame";
import { CreateCompanyForm } from "@/components/companies/create-company-form";

export function CreateCompanyScreen() {
  return (
    <AuthFrame footer={{ question: "Already have a company?", linkLabel: "Sign in", href: "/sign-in" }}>
      <h1 className="mb-1 text-2xl font-semibold text-[var(--color-text-global)]">Create your company</h1>
      <p className="mb-6 text-sm text-[var(--color-text-primary)]">With your node&apos;s operator key.</p>
      <CreateCompanyForm size="lg" onCreated={() => window.location.assign("/")} />
    </AuthFrame>
  );
}
