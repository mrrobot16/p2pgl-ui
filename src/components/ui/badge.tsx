import type { HTMLAttributes, ReactNode } from "react";
import { joinClasses } from "@/components/ui/field-styles";

export type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";
export type BadgeSize = "sm" | "md";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "bg-[var(--color-container-background-accent)] text-[var(--color-text-primary)]",
  success: "bg-[var(--color-highlight-badge-background)] text-[var(--color-highlight-badge-text)]",
  warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]",
  danger: "bg-[var(--color-negative-subtle-hover)] text-[var(--color-negative)]",
  info: "bg-[var(--color-info-border)] text-[var(--color-info)]"
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[11px]",
  md: "px-2 py-1 text-xs"
};

type BadgeProperties = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
};

/** A status pill. */
export function Badge({ variant = "neutral", size = "md", className, children, ...spanAttributes }: BadgeProperties) {
  return (
    <span {...spanAttributes} className={joinClasses("inline-flex items-center gap-1 rounded-full font-medium", VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}>
      {children}
    </span>
  );
}
