"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ToastContext, type ToastInput, type ToastItem, type ToastVariant } from "@/components/ui/toast/toast-context";
import { ToastViewport } from "@/components/ui/toast/toast-viewport";

export const DEFAULT_TOAST_DURATION_MILLISECONDS: Record<ToastVariant, number> = {
  success: 4000,
  info: 4000,
  error: 7000
};

let toastCounter = 0;

function nextToastIdentifier(): string {
  toastCounter += 1;
  return `toast-${toastCounter}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((identifier: string) => {
    setToasts((current) => current.filter((item) => item.identifier !== identifier));
    const timer = timers.current.get(identifier);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(identifier);
    }
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const identifier = nextToastIdentifier();
      const variant = input.variant ?? "info";
      setToasts((current) => [...current, { ...input, identifier, variant }]);
      timers.current.set(
        identifier,
        setTimeout(() => dismiss(identifier), input.duration ?? DEFAULT_TOAST_DURATION_MILLISECONDS[variant])
      );
      return identifier;
    },
    [dismiss]
  );

  useEffect(() => {
    const pendingTimers = timers.current;
    return () => pendingTimers.forEach((timer) => clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
