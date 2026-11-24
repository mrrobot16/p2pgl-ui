"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * While `active`, calls `onDismiss` when the pointer goes down outside
 * `containerReference` or Escape is pressed: the behaviour every menu and
 * popover in the app shares. On Escape, focus returns to
 * `returnFocusReference` when one is given.
 */
export function useDismiss(
  containerReference: RefObject<HTMLElement | null>,
  active: boolean,
  onDismiss: () => void,
  returnFocusReference?: RefObject<HTMLElement | null>
): void {
  const onDismissReference = useRef(onDismiss);
  useEffect(() => {
    onDismissReference.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!active) return;
    function handlePointerDown(event: MouseEvent) {
      const container = containerReference.current;
      if (container && event.target instanceof Node && !container.contains(event.target)) {
        onDismissReference.current();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      onDismissReference.current();
      returnFocusReference?.current?.focus();
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, containerReference, returnFocusReference]);
}
