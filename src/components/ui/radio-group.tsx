"use client";

import { useId } from "react";

export type RadioOption = {
  value: string;
  label: string;
  description?: string;
};

type RadioGroupProperties = {
  name?: string;
  label?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function RadioGroup({ name, label, options, value, onChange, disabled }: RadioGroupProperties) {
  const generatedName = useId();
  const groupName = name ?? generatedName;
  return (
    <fieldset className="flex flex-col gap-2">
      {label ? <legend className="mb-1 text-xs text-[var(--color-icon-secondary)]">{label}</legend> : null}
      {options.map((option) => (
        <label key={option.value} className="flex items-start gap-2 text-sm text-[var(--color-text-primary)]">
          <input
            type="radio"
            name={groupName}
            value={option.value}
            checked={value === option.value}
            disabled={disabled}
            onChange={() => onChange(option.value)}
            className="mt-0.5 h-4 w-4 cursor-pointer accent-[var(--color-action-standard)] disabled:cursor-not-allowed disabled:opacity-60"
          />
          <span>
            {option.label}
            {option.description ? <span className="block text-xs text-[var(--color-icon-secondary)]">{option.description}</span> : null}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
