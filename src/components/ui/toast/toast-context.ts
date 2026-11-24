"use client";

import { createContext, useContext } from "react";

export type ToastVariant = "success" | "error" | "info";

export type ToastInput = {
  variant?: ToastVariant;
  title: string;
  description?: string;
  /** Milliseconds before it goes; errors stay longer by default. */
  duration?: number;
};

export type ToastItem = ToastInput & { identifier: string; variant: ToastVariant };

export type ToastContextValue = {
  toast: (input: ToastInput) => string;
  dismiss: (identifier: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside a ToastProvider.");
  return context;
}
