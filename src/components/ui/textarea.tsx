import { forwardRef, useId, type TextareaHTMLAttributes } from "react";

import { FieldFrame } from "@/components/ui/field-frame";
import { joinClasses } from "@/components/ui/field-styles";

type TextareaProperties = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

const TEXTAREA_CLASSES =
  "w-full rounded border border-[var(--color-input-border-primary)] bg-[var(--color-input-background)] px-3 py-2 text-sm " +
  "text-[var(--color-input-text)] placeholder:text-[var(--color-text-disabled)] " +
  "transition-[background-color,border-color,box-shadow] duration-200 focus:outline-none " +
  "focus-visible:border-[var(--override-focus)] focus-visible:shadow-[0_0_0_1px_var(--override-focus)] " +
  "disabled:cursor-not-allowed disabled:border-[var(--color-input-disabled-border)] " +
  "disabled:bg-[var(--color-input-disabled-background)] disabled:text-[var(--color-input-disabled-text)]";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProperties>(function Textarea(
  { label, error, hint, className, id, ...textareaAttributes },
  forwardedReference
) {
  const generatedIdentifier = useId();
  const fieldIdentifier = id ?? generatedIdentifier;
  return (
    <FieldFrame fieldIdentifier={fieldIdentifier} label={label} error={error} hint={hint} withErrorIcons={false}>
      <textarea
        {...textareaAttributes}
        id={fieldIdentifier}
        ref={forwardedReference}
        aria-invalid={error ? true : undefined}
        className={joinClasses(TEXTAREA_CLASSES, className)}
      />
    </FieldFrame>
  );
});
