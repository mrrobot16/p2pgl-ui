import type { ButtonHTMLAttributes, ComponentType } from "react";
import { joinClasses } from "@/components/ui/field-styles";

export type IconButtonVariant = "ghost" | "outline";
export type IconButtonSize = "sm" | "md";

type IconButtonProperties = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  icon: ComponentType<{ className?: string }>;
  /** Required: the button's only accessible name, also shown as its tooltip. */
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
};

const BASE_CLASSES =
  "inline-flex items-center justify-center rounded-full transition-colors duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--override-focus)] focus-visible:ring-offset-1 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const SIZE_CLASSES: Record<IconButtonSize, string> = { sm: "h-7 w-7", md: "h-9 w-9" };
const ICON_CLASSES: Record<IconButtonSize, string> = { sm: "h-3.5 w-3.5", md: "h-4 w-4" };

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  ghost:
    "border border-transparent bg-transparent text-[var(--color-icon-secondary)] " +
    "hover:bg-[var(--color-action-passive-subtle-hover)] hover:text-[var(--color-text-global)]",
  outline:
    "border border-[var(--color-divider-tertiary)] bg-transparent text-[var(--color-icon-secondary)] " +
    "hover:bg-[var(--color-action-passive-subtle-hover)] hover:text-[var(--color-text-global)]"
};

export function IconButton({ icon: Icon, label, variant = "ghost", size = "md", className, type = "button", ...buttonAttributes }: IconButtonProperties) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={joinClasses(BASE_CLASSES, SIZE_CLASSES[size], VARIANT_CLASSES[variant], className)}
      {...buttonAttributes}
    >
      <Icon className={ICON_CLASSES[size]} aria-hidden="true" />
    </button>
  );
}
