import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { connectionErrorMessage } from "@/lib/companies/connection-messages";
import type { LedgerQueryState } from "@/lib/gl-node/use-ledger-query";

const SKELETON_ROWS = 8;

type ReportBodyProperties = {
  columnCount: number;
  answer: LedgerQueryState<unknown>;
  nodeUrl: string;
  /** Said when gl-node marked the answer inexact (the totals the screen adds up are left out); null otherwise. */
  roundedNote: string | null;
  /** The report itself, once an answer is in. */
  children: ReactNode;
};

/**
 * What the card shows under its heading: skeleton rows until the first
 * answer, the failure with *Try again*, or the report (with a note when
 * gl-node rounded a figure).
 */
export function ReportBody({ columnCount, answer, nodeUrl, roundedNote, children }: ReportBodyProperties) {
  if (answer.error !== null) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-sm text-[var(--color-negative)]">{connectionErrorMessage(answer.error, nodeUrl)}</p>
        <Button size="sm" onClick={answer.retry}>
          Try again
        </Button>
      </div>
    );
  }

  if (answer.data === null) {
    return (
      <div role="status" aria-label="Loading the report">
        <div className="mb-1 h-[30px] border-y border-[var(--color-divider-tertiary)] bg-[var(--color-container-background-accent)]" />
        {Array.from({ length: SKELETON_ROWS }, (unused, index) => (
          <div key={index} className="flex h-[29px] items-center justify-between gap-6 px-3">
            <Skeleton className="h-3.5 w-48 rounded" />
            <div className="flex gap-6">
              {Array.from({ length: columnCount }, (unusedColumn, column) => (
                <Skeleton key={column} className="h-3.5 w-20 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {roundedNote ? (
        <p role="note" className="mb-4 rounded border border-[var(--color-divider-tertiary)] bg-[var(--color-container-background-secondary)] px-3 py-2 text-xs text-[var(--color-text-primary)]">
          {roundedNote}
        </p>
      ) : null}
      {children}
    </>
  );
}
