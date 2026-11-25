"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useCompanies } from "@/lib/companies/use-companies";

/**
 * Signed-in pages render only with an active company. Without one, the
 * page goes to sign-in. Before storage is read (the first render), nothing
 * is shown, so no page ever renders without its company.
 */
export function CompanyGate({ children }: { children: ReactNode }) {
  const { ready, active } = useCompanies();
  const router = useRouter();

  useEffect(() => {
    if (ready && !active) router.replace("/sign-in");
  }, [ready, active, router]);

  if (!ready || !active) return null;
  return <>{children}</>;
}
