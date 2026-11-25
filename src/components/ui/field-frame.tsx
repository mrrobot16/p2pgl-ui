import { AlertCircle, AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

import { joinClasses } from "@/components/ui/field-styles";

type FieldFrameProperties = {
  fieldIdentifier: string;
  label?: string;
  error?: string;
  hint?: string;
  /** Warning icons beside the label and the error, as text inputs show them. */
  withErrorIcons?: boolean;
  children: ReactNode;
};

/**
 * A field's label above it and its error or hint below it. With none of the
 * three, the field renders alone, with no wrapper.
 */
export function FieldFrame({ fieldIdentifier, label, error, hint, withErrorIcons = true, children }: FieldFrameProperties) {
  if (!label && !error && !hint) return <>{children}</>;

  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label
          htmlFor={fieldIdentifier}
          className={joinClasses(
            "flex items-center gap-1 whitespace-nowrap text-xs",
            error && withErrorIcons ? "font-medium text-[var(--color-negative)]" : "text-[var(--color-icon-secondary)]"
          )}
        >
          {error && withErrorIcons ? <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> : null}
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="flex items-start gap-1 text-xs text-[var(--color-negative)]">
          {withErrorIcons ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : null}
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p className="text-xs text-[var(--color-icon-secondary)]">{hint}</p>
      ) : null}
    </div>
  );
}
