"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import type { ToastItem, ToastVariant } from "@/components/ui/toast/toast-context";

const VARIANT_ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info
};

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: "border-[var(--color-positive-border)] text-[var(--color-positive)]",
  error: "border-[var(--color-negative-border)] text-[var(--color-negative)]",
  info: "border-[var(--color-info-border)] text-[var(--color-info)]"
};

// An error interrupts a screen reader (alert); success and info wait their turn (status).
const VARIANT_ROLES: Record<ToastVariant, "status" | "alert"> = {
  success: "status",
  error: "alert",
  info: "status"
};

/** The stack of toasts in the top right corner. */
export function ToastViewport({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (identifier: string) => void }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((item) => {
        const Icon = VARIANT_ICONS[item.variant];
        return (
          <div
            key={item.identifier}
            role={VARIANT_ROLES[item.variant]}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-lg border bg-[var(--color-container-background-primary)] p-3 shadow-lg ${VARIANT_CLASSES[item.variant]}`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--color-text-global)]">{item.title}</p>
              {item.description ? <p className="mt-0.5 text-xs text-[var(--color-text-primary)]">{item.description}</p> : null}
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => onDismiss(item.identifier)}
              className="shrink-0 text-[var(--color-icon-secondary)] hover:text-[var(--color-text-global)]"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
