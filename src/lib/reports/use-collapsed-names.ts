"use client";

import { useState } from "react";

export type CollapsedNames = {
  /** The sections, groups and parent accounts that are collapsed. */
  names: ReadonlySet<string>;
  toggle: (name: string) => void;
  expandAll: () => void;
  collapse: (names: readonly string[]) => void;
};

/** Which rows of a report are collapsed; everything starts open. */
export function useCollapsedNames(): CollapsedNames {
  const [names, setNames] = useState<ReadonlySet<string>>(new Set());
  return {
    names,
    toggle: (name) =>
      setNames((current) => {
        const next = new Set(current);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        return next;
      }),
    expandAll: () => setNames(new Set()),
    collapse: (collapsedNames) => setNames(new Set(collapsedNames))
  };
}
