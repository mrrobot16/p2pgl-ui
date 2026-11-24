export type FieldSize = "sm" | "md" | "lg";

/** The look every text-like field shares: border, colours, focus ring, disabled state. */
export const FIELD_BASE_CLASSES =
  "w-full font-normal leading-[1.2] transition-[background-color,border-color,box-shadow] duration-200 " +
  "border border-[var(--color-input-border-primary)] bg-[var(--color-input-background)] text-[var(--color-input-text)] " +
  "placeholder:text-[var(--color-text-disabled)] " +
  "focus:outline-none focus-visible:border-[var(--override-focus)] focus-visible:shadow-[0_0_0_1px_var(--override-focus)] " +
  "disabled:cursor-not-allowed disabled:border-[var(--color-input-disabled-border)] " +
  "disabled:bg-[var(--color-input-disabled-background)] disabled:text-[var(--color-input-disabled-text)]";

export const FIELD_SIZE_CLASSES: Record<FieldSize, string> = {
  sm: "h-8 rounded-[var(--radius-x-small)] px-3 text-[13px]",
  md: "h-9 rounded px-3 text-sm",
  lg: "h-12 rounded-lg px-4 text-base"
};

/** Added to a field in error: red border and tint, red focus ring. */
export const FIELD_ERROR_CLASSES =
  "border-[var(--color-negative)] bg-[var(--color-negative-subtle-hover)] " +
  "focus-visible:border-[var(--color-negative)] focus-visible:shadow-[0_0_0_1px_var(--color-negative)]";

export function joinClasses(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
