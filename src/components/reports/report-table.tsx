"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { negateAmounts, type Amounts } from "@/lib/money/amounts";
import { formatAmount } from "@/lib/money/format-amount";
import { reportRows, type ReportRow, type ReportSection } from "@/lib/reports/account-tree";

/** How a section's figures are shown: as stored (1), or with the sign flipped (-1) for Income, Liabilities and Equity. */
export type DisplaySign = 1 | -1;

/** The key a section is collapsed under, apart from account names. */
export function sectionKey(root: string): string {
  return `section:${root}`;
}

const ROW_CLASSES = "border-b border-[var(--color-container-background-secondary)]";
const CELL_CLASSES = "px-3 py-1";
const AMOUNT_CLASSES = `${CELL_CLASSES} text-right tabular-nums`;
// Accounts start 1.5rem in and go 1.5rem further per level (the old app's).
const INDENT_BASE_REM = 1.5;
const INDENT_STEP_REM = 1.5;

/** A cell's figures, one line per currency; an empty cell when there are none. */
function Figures({ amounts, sign }: { amounts: Amounts | null; sign: DisplaySign }) {
  if (amounts === null || amounts.length === 0) return null;
  const shown = sign === -1 ? negateAmounts(amounts) : amounts;
  return (
    <>
      {shown.map((amount) => (
        <span key={amount.currency} className="block whitespace-nowrap">
          {formatAmount(amount)}
        </span>
      ))}
    </>
  );
}

function ToggleLabel({ label, open, onToggle, strong }: { label: string; open: boolean; onToggle: () => void; strong: boolean }) {
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <button type="button" onClick={onToggle} aria-expanded={open} className={`flex w-full items-center gap-1.5 text-left ${strong ? "font-medium" : ""}`}>
      <Chevron className="h-3.5 w-3.5 shrink-0 text-[var(--color-icon-secondary)]" aria-hidden="true" />
      {label}
    </button>
  );
}

type AccountRowProperties = { row: ReportRow; columnCount: number; sign: DisplaySign; showTotals: boolean; onToggle: (name: string) => void };

function AccountRow({ row, columnCount, sign, showTotals, onToggle }: AccountRowProperties) {
  const { node } = row;
  const paddingLeft = `${INDENT_BASE_REM + node.depth * INDENT_STEP_REM}rem`;
  const columns = Array.from({ length: columnCount }, (unused, index) => index);

  if (row.kind === "parentTotal") {
    return (
      <tr className={ROW_CLASSES}>
        <td className={`py-1 pr-3 font-semibold text-[var(--color-text-primary)]`} style={{ paddingLeft }}>{`Total for ${node.label}`}</td>
        {columns.map((index) => (
          <td key={index} className={`${AMOUNT_CLASSES} font-semibold`}>
            <Figures amounts={node.total[index]} sign={sign} />
          </td>
        ))}
      </tr>
    );
  }

  // Open, a parent shows its own figures (if gl-node sent any); collapsed, its total.
  const figuresOf = (index: number): Amounts | null => {
    if (row.kind === "account") return node.own?.[index] ?? null;
    if (row.collapsed) return showTotals ? node.total[index] : null;
    return node.own?.[index] ?? null;
  };

  return (
    <tr className={ROW_CLASSES}>
      <td className="py-1 pr-3 text-[var(--color-text-primary)]" style={{ paddingLeft }}>
        {row.kind === "parent" ? <ToggleLabel label={node.label} open={!row.collapsed} onToggle={() => onToggle(node.name)} strong={false} /> : node.label}
      </td>
      {columns.map((index) => (
        <td key={index} className={`${AMOUNT_CLASSES} text-[var(--color-text-primary)]`}>
          <Figures amounts={figuresOf(index)} sign={sign} />
        </td>
      ))}
    </tr>
  );
}

type ReportTableProperties = {
  /** The value columns' headings (`Debit`, `Credit`; or `Total`). */
  columnLabels: readonly string[];
  sections: readonly ReportSection[];
  displaySign: (root: string) => DisplaySign;
  /** False when gl-node marked the answer inexact: no totals the table adds up itself. */
  showTotals: boolean;
  collapsedNames: ReadonlySet<string>;
  onToggle: (name: string) => void;
  /** Rows after the sections: the report's own totals. */
  closingRows?: ReactNode;
};

/**
 * A report's table: a header row, then one collapsible section per
 * Beancount root, accounts nested by their parts, and the totals the
 * statement shows (docs/parity/reports.md, *Shared report frame*).
 */
export function ReportTable({ columnLabels, sections, displaySign, showTotals, collapsedNames, onToggle, closingRows }: ReportTableProperties) {
  const columnCount = columnLabels.length;
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-y border-[var(--color-divider-tertiary)] bg-[var(--color-container-background-accent)]">
          <th className={`${CELL_CLASSES} text-left font-medium text-[var(--color-text-primary)]`}>Account</th>
          {columnLabels.map((label) => (
            <th key={label} className={`${CELL_CLASSES} text-right font-medium text-[var(--color-text-primary)]`}>
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sections.map((section) => {
          const open = !collapsedNames.has(sectionKey(section.root));
          const sign = displaySign(section.root);
          return (
            <SectionRows key={section.root} section={section} open={open} sign={sign} showTotals={showTotals} columnCount={columnCount} onToggle={onToggle}>
              {reportRows(section.nodes, collapsedNames, showTotals).map((row) => (
                <AccountRow key={row.key} row={row} columnCount={columnCount} sign={sign} showTotals={showTotals} onToggle={onToggle} />
              ))}
            </SectionRows>
          );
        })}
        {closingRows}
      </tbody>
    </table>
  );
}

type SectionRowsProperties = {
  section: ReportSection;
  open: boolean;
  sign: DisplaySign;
  showTotals: boolean;
  columnCount: number;
  onToggle: (name: string) => void;
  children: ReactNode;
};

/** A section's heading (its total on it when collapsed, as QuickBooks), its rows, then *Total for <section>*. */
function SectionRows({ section, open, sign, showTotals, columnCount, onToggle, children }: SectionRowsProperties) {
  const columns = Array.from({ length: columnCount }, (unused, index) => index);
  return (
    <>
      <tr className={`${ROW_CLASSES} bg-[var(--color-report-row-alt)]`}>
        <td className={`${CELL_CLASSES} text-[var(--color-text-primary)]`}>
          <ToggleLabel label={section.root} open={open} onToggle={() => onToggle(sectionKey(section.root))} strong />
        </td>
        {columns.map((index) => (
          <td key={index} className={`${AMOUNT_CLASSES} font-semibold text-[var(--color-text-primary)]`}>
            {!open && showTotals ? <Figures amounts={section.total[index]} sign={sign} /> : null}
          </td>
        ))}
      </tr>
      {open ? children : null}
      {open && showTotals ? (
        <tr className={ROW_CLASSES}>
          <td className={`${CELL_CLASSES} font-semibold text-[var(--color-text-primary)]`}>{`Total for ${section.root}`}</td>
          {columns.map((index) => (
            <td key={index} className={`${AMOUNT_CLASSES} font-semibold text-[var(--color-text-primary)]`}>
              <Figures amounts={section.total[index]} sign={sign} />
            </td>
          ))}
        </tr>
      ) : null}
    </>
  );
}
