"use client";

import { Check, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { useRef, useState, useSyncExternalStore } from "react";

import { THEMES } from "@/components/theme/themes";
import { useDismiss } from "@/hooks/use-dismiss";

type ThemeMenuProperties = {
  /** "bottom" opens below the button (the top header); "top" opens above it (a button in a bottom corner). */
  menuAlign?: "top" | "bottom";
  /** "compact": the header's small icon button. "standalone": larger, bordered, for a button on its own. */
  variant?: "compact" | "standalone";
};

function subscribeToNothing() {
  return () => undefined;
}

// The stored theme is only known in the browser; until then the button
// keeps its footprint so nothing beside it shifts.
function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );
}

export function ThemeMenu({ menuAlign = "bottom", variant = "compact" }: ThemeMenuProperties) {
  const { theme, setTheme } = useTheme();
  const hasMounted = useHasMounted();
  const [isOpen, setIsOpen] = useState(false);
  const containerReference = useRef<HTMLDivElement>(null);
  const triggerReference = useRef<HTMLButtonElement>(null);
  useDismiss(containerReference, isOpen, () => setIsOpen(false), triggerReference);

  const sizeClasses = variant === "standalone" ? "h-11 w-11" : "h-8 w-8";
  if (!hasMounted) return <div className={sizeClasses} aria-hidden="true" />;

  const triggerLook =
    variant === "standalone"
      ? "border border-[var(--color-divider-tertiary)] bg-[var(--color-container-background-primary)] text-[var(--color-icon-secondary)] shadow-sm hover:text-[var(--color-icon-primary)]"
      : "text-[var(--color-icon-secondary)] hover:bg-[var(--color-action-passive-subtle-hover)] hover:text-[var(--color-icon-primary)]";

  return (
    <div className="relative" ref={containerReference}>
      <button
        ref={triggerReference}
        type="button"
        aria-label="Choose theme"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`flex items-center justify-center rounded-full transition-colors ${sizeClasses} ${triggerLook}`}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Palette className={variant === "standalone" ? "h-5 w-5" : "h-[18px] w-[18px]"} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className={`absolute right-0 z-10 w-40 overflow-hidden rounded-lg border border-[var(--color-divider-tertiary)] bg-[var(--color-container-background-primary)] py-1 shadow-lg ${
            menuAlign === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {THEMES.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={theme === option.value}
              onClick={() => {
                setTheme(option.value);
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-[var(--color-text-global)] transition-colors hover:bg-[var(--color-action-passive-subtle-hover)]"
            >
              {option.label}
              {theme === option.value ? <Check className="h-3.5 w-3.5 text-[var(--color-link-action)]" aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
