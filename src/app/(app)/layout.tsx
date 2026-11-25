import type { ReactNode } from "react";
import { CompanyGate } from "@/components/companies/company-gate";
import { AppShell } from "@/components/layout/app-shell";
import { ConfirmDialogHost } from "@/components/ui/confirm-dialog";
import { ToastProvider } from "@/components/ui/toast/toast-provider";

type AppGroupLayoutProperties = Readonly<{
  children: ReactNode;
}>;

// Every signed-in page: only with an active company (else to sign-in),
// inside the app shell, with toasts and the confirm dialog available.
export default function AppGroupLayout({ children }: AppGroupLayoutProperties) {
  return (
    <ToastProvider>
      <CompanyGate>
        <AppShell>{children}</AppShell>
      </CompanyGate>
      <ConfirmDialogHost />
    </ToastProvider>
  );
}
