"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useFocusTrap } from "@/hooks/use-focus-trap";

export type ModalSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "max-w-[440px]",
  md: "max-w-[640px]",
  lg: "max-w-[860px]"
};

type ModalProperties = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  children: ReactNode;
};

/** A centred dialog over a dimmed page. Escape, the close button or a click on the backdrop closes it. */
export function Modal({ open, onClose, title, description, size = "md", children }: ModalProperties) {
  const dialogReference = useRef<HTMLDivElement>(null);
  useBodyScrollLock(open);
  useFocusTrap(dialogReference, open);

  const onCloseReference = useRef(onClose);
  useEffect(() => {
    onCloseReference.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseReference.current();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogReference}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`w-full ${SIZE_CLASSES[size]} max-h-[85vh] overflow-y-auto rounded-lg border border-[var(--color-divider-tertiary)] bg-[var(--color-container-background-primary)] p-6 shadow-lg outline-none`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title ? <h2 className="text-lg font-semibold text-[var(--color-text-global)]">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-[var(--color-text-primary)]">{description}</p> : null}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="shrink-0 rounded p-1 text-[var(--color-icon-secondary)] transition-colors hover:bg-[var(--color-action-passive-subtle-hover)] hover:text-[var(--color-text-primary)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
