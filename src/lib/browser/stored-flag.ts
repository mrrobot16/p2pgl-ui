"use client";

import { useCallback, useSyncExternalStore } from "react";

const CHANGE_EVENT = "openledger:stored-flag-change";

// Values for this visit when storage is unavailable (private window,
// blocked site data), so the page still responds.
const unsavedValues = new Map<string, boolean>();

function readFlag(key: string): boolean {
  if (unsavedValues.has(key)) return unsavedValues.get(key) === true;
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * A yes/no preference kept in localStorage ("1" or "0"), false when unset
 * or when storage is unavailable. The server render and the first browser
 * render both read false, so they agree.
 */
export function useStoredFlag(key: string): [boolean, (value: boolean) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => readFlag(key),
    () => false
  );
  const update = useCallback(
    (next: boolean) => {
      try {
        window.localStorage.setItem(key, next ? "1" : "0");
        unsavedValues.delete(key);
      } catch {
        unsavedValues.set(key, next);
      }
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    [key]
  );
  return [value, update];
}
