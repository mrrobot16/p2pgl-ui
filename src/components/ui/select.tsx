"use client";

import { Check, ChevronDown, HelpCircle } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";

import { joinClasses } from "@/components/ui/field-styles";
import { InputField } from "@/components/ui/input-field";
import { useDismiss } from "@/hooks/use-dismiss";

export type SelectOption = {
  value: string;
  label: string;
  /** Muted text on the right of the option (an account's type, "Vendor"). */
  rightLabel?: string;
  /** Extra words the search matches. */
  keywords?: string[];
  /** A section header shown above the first option of each group; options must arrive sorted by group. */
  group?: string;
  /** Help text behind a (?) button beside the option. */
  description?: string;
};

type SelectProperties = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  /** Shows an "add new" row at the top of the list. */
  onAddNew?: () => void;
  addNewLabel?: string;
  /** Typed text becomes the value even when no option matches. */
  allowCustomValue?: boolean;
  optionSize?: "default" | "sm";
  /** A checkmark marks the chosen option, with a lighter highlight. */
  showCheckmark?: boolean;
};

function optionMatches(option: SelectOption, search: string): boolean {
  if (option.label.toLowerCase().includes(search)) return true;
  if (option.rightLabel?.toLowerCase().includes(search)) return true;
  return option.keywords?.some((keyword) => keyword.toLowerCase().includes(search)) ?? false;
}

/**
 * A text field with a list under it: type to search, click to choose. The
 * field shows the chosen option's label; while the person types, it shows
 * what they typed and the list narrows to the options that match.
 */
export function Select({
  value,
  onChange,
  options,
  placeholder,
  label,
  error,
  disabled,
  fullWidth = true,
  className,
  onAddNew,
  addNewLabel = "+ Add new",
  allowCustomValue = true,
  optionSize = "default",
  showCheckmark = false
}: SelectProperties) {
  const [isOpen, setIsOpen] = useState(false);
  // What the person is typing; null when they are not searching.
  const [searchText, setSearchText] = useState<string | null>(null);
  const [openDescriptionValue, setOpenDescriptionValue] = useState<string | null>(null);
  const containerReference = useRef<HTMLDivElement | null>(null);
  const fieldIdentifier = useId();

  const selectedOption = useMemo(() => options.find((option) => option.value === value), [options, value]);
  const shownText = searchText ?? selectedOption?.label ?? (allowCustomValue ? value : "");

  const visibleOptions = useMemo(() => {
    const search = searchText?.trim().toLowerCase() ?? "";
    return search === "" ? options : options.filter((option) => optionMatches(option, search));
  }, [options, searchText]);

  function close() {
    setIsOpen(false);
    setSearchText(null);
    setOpenDescriptionValue(null);
  }

  useDismiss(containerReference, isOpen, close);

  function choose(option: SelectOption) {
    onChange(option.value);
    close();
  }

  const optionTextClasses = optionSize === "sm" ? "text-[13px]" : "text-sm";
  const optionLabelClasses = optionSize === "sm" ? "text-[13px] text-[var(--color-text-primary)]" : "text-left text-[var(--color-text-primary)]";
  const optionRightLabelClasses = optionSize === "sm" ? "text-[13px] text-[var(--color-icon-secondary)]" : "text-right text-[var(--color-icon-secondary)]";

  const field = (
    <div ref={containerReference} className={joinClasses("relative", fullWidth ? "w-full min-w-0" : "w-fit min-w-fit", className)}>
      <div className="relative">
        <InputField
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          value={shownText}
          disabled={disabled}
          placeholder={placeholder}
          id={label ? fieldIdentifier : undefined}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onChange={(event) => {
            const typed = event.target.value;
            setSearchText(typed);
            if (allowCustomValue) onChange(typed);
            setIsOpen(true);
          }}
          className={joinClasses(fullWidth ? "w-full" : "w-[208px]", "pr-9")}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => (isOpen ? close() : setIsOpen(true))}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded text-[var(--color-icon-secondary)] hover:bg-[var(--color-action-passive-subtle-hover)] disabled:cursor-not-allowed disabled:text-[var(--color-text-disabled)]"
          aria-label="Toggle options list"
        >
          <ChevronDown className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {isOpen && !disabled ? (
        <div
          role="listbox"
          className="absolute left-0 z-50 mt-1 max-h-64 w-max min-w-full max-w-[min(90vw,56rem)] overflow-y-auto rounded border border-[var(--color-divider-tertiary)] bg-[var(--color-container-background-primary)] py-1 shadow-md"
        >
          {onAddNew ? (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                close();
                onAddNew();
              }}
              className="block w-full border-b border-[var(--color-divider-tertiary)] px-4 py-2 text-left text-sm font-medium text-[var(--color-link-text)] hover:bg-[var(--color-action-passive-subtle-hover)]"
            >
              {addNewLabel}
            </button>
          ) : null}

          {visibleOptions.length === 0 ? (
            <p className="px-4 py-2 text-sm text-[var(--color-icon-secondary)]">No matches</p>
          ) : (
            visibleOptions.map((option, index) => {
              const isSelected = option.value === value;
              const startsGroup = option.group !== undefined && option.group !== visibleOptions[index - 1]?.group;
              const isDescriptionOpen = openDescriptionValue === option.value;
              const rowClasses = isSelected
                ? showCheckmark
                  ? "bg-[var(--color-action-passive-subtle-hover)]"
                  : "bg-[var(--color-action-passive-subtle-active)] hover:bg-[var(--color-action-passive-subtle-hover)]"
                : "hover:bg-[var(--color-action-passive-subtle-hover)]";
              return (
                <div key={option.value}>
                  {startsGroup ? (
                    <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-icon-secondary)]">{option.group}</p>
                  ) : null}
                  <div className={`flex items-center ${rowClasses}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => choose(option)}
                      className={joinClasses(
                        "grid flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-2 pl-4 text-left",
                        optionTextClasses,
                        option.description ? "pr-2" : "pr-4"
                      )}
                    >
                      <span className={joinClasses("flex min-w-0 items-center gap-2 whitespace-nowrap", optionLabelClasses, isSelected && !showCheckmark && "font-bold")}>
                        {showCheckmark ? (
                          isSelected ? (
                            <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                          ) : (
                            <span className="w-4 shrink-0" aria-hidden="true" />
                          )
                        ) : null}
                        <span className="truncate">{option.label}</span>
                      </span>
                      {option.rightLabel ? <span className={`shrink-0 ${optionRightLabelClasses}`}>{option.rightLabel}</span> : null}
                    </button>
                    {option.description ? (
                      <button
                        type="button"
                        aria-label={`About ${option.label}`}
                        aria-expanded={isDescriptionOpen}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => setOpenDescriptionValue(isDescriptionOpen ? null : option.value)}
                        className="mr-3 shrink-0 rounded p-1 text-[var(--color-icon-secondary)] hover:bg-[var(--color-action-passive-subtle-hover)] hover:text-[var(--color-text-global)]"
                      >
                        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                  {isDescriptionOpen && option.description ? (
                    <p className="max-w-[240px] break-words px-4 pb-2 pl-11 pr-4 text-xs text-[var(--color-icon-secondary)]">{option.description}</p>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );

  if (!label && !error) return field;
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label htmlFor={fieldIdentifier} className="text-xs text-[var(--color-icon-secondary)]">
          {label}
        </label>
      ) : null}
      {field}
      {error ? <p className="text-xs text-[var(--color-negative)]">{error}</p> : null}
    </div>
  );
}
