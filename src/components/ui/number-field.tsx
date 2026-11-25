import { forwardRef, useId, type InputHTMLAttributes } from "react";

import { FieldFrame } from "@/components/ui/field-frame";
import { FIELD_BASE_CLASSES, FIELD_ERROR_CLASSES, FIELD_SIZE_CLASSES, joinClasses, type FieldSize } from "@/components/ui/field-styles";

type NumberFieldProperties = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label?: string;
  error?: string;
  hint?: string;
  size?: FieldSize;
  /** Amounts read best right-aligned, the default. */
  align?: "left" | "right";
  /** A leading "$", for show only: the value stays a plain number string. */
  currency?: boolean;
};

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProperties>(function NumberField(
  { label, error, hint, size = "md", align = "right", currency = false, className, id, ...inputAttributes },
  forwardedReference
) {
  const generatedIdentifier = useId();
  const fieldIdentifier = id ?? generatedIdentifier;
  return (
    <FieldFrame fieldIdentifier={fieldIdentifier} label={label} error={error} hint={hint}>
      <div className="relative">
        {currency ? (
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-disabled)]">
            $
          </span>
        ) : null}
        <input
          {...inputAttributes}
          id={fieldIdentifier}
          ref={forwardedReference}
          type="number"
          aria-invalid={error ? true : undefined}
          className={joinClasses(
            FIELD_BASE_CLASSES,
            FIELD_SIZE_CLASSES[size],
            align === "right" ? "text-right" : "text-left",
            currency && "pl-6",
            error && FIELD_ERROR_CLASSES,
            className
          )}
        />
      </div>
    </FieldFrame>
  );
});
