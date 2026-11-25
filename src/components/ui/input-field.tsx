import { forwardRef, useId, type InputHTMLAttributes } from "react";

import { FieldFrame } from "@/components/ui/field-frame";
import { FIELD_BASE_CLASSES, FIELD_ERROR_CLASSES, FIELD_SIZE_CLASSES, joinClasses, type FieldSize } from "@/components/ui/field-styles";

type InputFieldProperties = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  error?: string;
  hint?: string;
  size?: FieldSize;
};

export const InputField = forwardRef<HTMLInputElement, InputFieldProperties>(function InputField(
  { label, error, hint, size = "md", className, id, ...inputAttributes },
  forwardedReference
) {
  const generatedIdentifier = useId();
  const fieldIdentifier = id ?? generatedIdentifier;
  return (
    <FieldFrame fieldIdentifier={fieldIdentifier} label={label} error={error} hint={hint}>
      <input
        {...inputAttributes}
        id={fieldIdentifier}
        ref={forwardedReference}
        aria-invalid={error ? true : inputAttributes["aria-invalid"]}
        className={joinClasses(FIELD_BASE_CLASSES, FIELD_SIZE_CLASSES[size], error && FIELD_ERROR_CLASSES, className)}
      />
    </FieldFrame>
  );
});
