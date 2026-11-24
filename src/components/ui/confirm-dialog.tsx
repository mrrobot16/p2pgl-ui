"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type PendingConfirmation = ConfirmOptions & { resolve: (confirmed: boolean) => void };

let showConfirmation: ((pending: PendingConfirmation) => void) | null = null;

/**
 * Asks the person to confirm, in the app's own dialog. Resolves false when
 * no <ConfirmDialogHost /> is mounted, so a missing host never confirms a
 * destructive action by itself.
 */
export function requestConfirmation(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (!showConfirmation) {
      resolve(false);
      return;
    }
    showConfirmation({ ...options, resolve });
  });
}

/** Mounted once in the app layout; shows what requestConfirmation asks. */
export function ConfirmDialogHost() {
  const [pending, setPending] = useState<PendingConfirmation | null>(null);

  useEffect(() => {
    showConfirmation = setPending;
    return () => {
      showConfirmation = null;
    };
  }, []);

  function settle(confirmed: boolean) {
    pending?.resolve(confirmed);
    setPending(null);
  }

  return (
    <Modal open={pending !== null} onClose={() => settle(false)} title={pending?.title} size="sm">
      <p className="mb-6 text-sm text-[var(--color-text-primary)]">{pending?.message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => settle(false)}>
          {pending?.cancelLabel ?? "Cancel"}
        </Button>
        {/* The old dialog's confirm button is the default (secondary) look too. */}
        <Button variant="secondary" onClick={() => settle(true)}>
          {pending?.confirmLabel ?? "Continue"}
        </Button>
      </div>
    </Modal>
  );
}
