import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ConfirmDialogHost } from "@/components/ui/confirm-dialog";
import { ToastProvider } from "@/components/ui/toast/toast-provider";

type AppGroupLayoutProperties = Readonly<{
  children: ReactNode;
}>;

// Every signed-in page: inside the app shell, with toasts and the confirm
// dialog available. The active company arrives here in step 3.
export default function AppGroupLayout({ children }: AppGroupLayoutProperties) {
  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
      <ConfirmDialogHost />
    </ToastProvider>
  );
}
