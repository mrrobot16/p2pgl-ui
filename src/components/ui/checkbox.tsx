"use client";

import { forwardRef, useCallback, useEffect, useRef, type InputHTMLAttributes } from "react";
import { joinClasses } from "@/components/ui/field-styles";

type CheckboxProperties = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  /** Some rows selected, not all: shown as a dash. Does not change `checked`. */
  indeterminate?: boolean;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProperties>(function Checkbox(
  { label, indeterminate = false, className, id, ...inputAttributes },
  forwardedReference
) {
  const localReference = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (localReference.current) localReference.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const setReferences = useCallback(
    (node: HTMLInputElement | null) => {
      localReference.current = node;
      if (typeof forwardedReference === "function") forwardedReference(node);
      else if (forwardedReference) forwardedReference.current = node;
    },
    [forwardedReference]
  );

  const input = (
    <input
      {...inputAttributes}
      id={id}
      ref={setReferences}
      type="checkbox"
      className={joinClasses("h-4 w-4 cursor-pointer accent-[var(--color-action-standard)] disabled:cursor-not-allowed disabled:opacity-60", className)}
    />
  );

  if (!label) return input;
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
      {input}
      {label}
    </label>
  );
});
