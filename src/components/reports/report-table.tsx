"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { negateAmounts, type Amounts } from "@/lib/money/amounts";
import { formatAmount } from "@/lib/money/format-amount";
import { reportRows, type AccountTreeNode, type ReportRow } from "@/lib/reports/account-tree";

/** How figures are shown: as stored (1), or with the sign flipped (-1) for Income, Liabilities and Equity. */
export type DisplaySign = 1 | -1;

/** A row inside a section after its accounts, such as the Balance Sheet's *Net Income*. */
export type ExtraRow = { key: string; label: string; figures: readonly Amounts[] };

/** A collapsible section: its accounts, any extra rows, and *Total for <label>*. */
export type SectionBlock = {
  kind: "section";
  key: string;
  label: string;
  nodes: readonly AccountTreeNode[];
  extraRows?: readonly ExtraRow[];
  /** Per column, in stored signs. */
  total: readonly Amounts[];
  sign: DisplaySign;
};

/** A collapsible heading over sections (the Balance Sheet's *Liabilities and Equity*), with its own total. */
export type GroupBlock = { kind: "group"; key: string; label: string; sections: readonly SectionBlock[]; total: readonly Amounts[]; sign: DisplaySign };

/**
 * A single strong row (*Gross Profit*, *Net Income*). `fromNode` marks a
 * figure gl-node gave; one the screen added up is left blank when the
 * answer isn't exact.
 */
export type LineBlock = { kind: "line"; key: string; label: string; figures: readonly Amounts[]; sign: DisplaySign; fromNode: boolean };

export type ReportBlock = SectionBlock | GroupBlock | LineBlock;

/** The key a section or group is collapsed under, apart from account names. */
export function blockKey(key: string): string {
  return `section:${key}`;
}

/** Every section and group's collapse key, for *Collapse all*. */
export function blockKeys(blocks: readonly ReportBlock[]): string[] {
  return blocks.flatMap((block) => {
    if (block.kind === "line") return [];
    if (block.kind === "group") return [blockKey(block.key), ...block.sections.map((section) => blockKey(section.key))];
    return [blockKey(block.key)];
  });
}

const ROW_CLASSES = "border-b border-[var(--color-container-background-secondary)]";
const CELL_CLASSES = "px-3 py-1 text-[var(--color-text-primary)]";
const AMOUNT_CLASSES = `${CELL_CLASSES} text-right tabular-nums`;
// Accounts start 1.5rem in and go 1.5rem further per level (the old app's).
const INDENT_BASE_REM = 1.5;
const INDENT_STEP_REM = 1.5;

function columnIndexes(columnCount: number): number[] {
  return Array.from({ length: columnCount }, (unused, index) => index);
}

/**
 * A cell's figures, one line per currency. Empty: nothing, or for a total
 * `0.00` (the books have no figure there yet, so no currency to name).
 */
function Figures({ amounts, sign, total = false }: { amounts: Amounts | null | undefined; sign: DisplaySign; total?: boolean }) {
  if (!amounts || amounts.length === 0) return total ? <>0.00</> : null;
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

function TotalRow({ label, figures, sign, columnCount, paddingLeft, strong = "font-semibold" }: { label: string; figures: readonly Amounts[]; sign: DisplaySign; columnCount: number; paddingLeft?: string; strong?: string }) {
  return (
    <tr className={ROW_CLASSES}>
      <td className={`${CELL_CLASSES} ${strong}`} style={paddingLeft ? { paddingLeft } : undefined}>
        {label}
      </td>
      {columnIndexes(columnCount).map((index) => (
        <td key={index} className={`${AMOUNT_CLASSES} ${strong}`}>
          <Figures amounts={figures[index]} sign={sign} total />
        </td>
      ))}
    </tr>
  );
}

type AccountRowProperties = { row: ReportRow; columnCount: number; sign: DisplaySign; showTotals: boolean; onToggle: (name: string) => void };

function AccountRow({ row, columnCount, sign, showTotals, onToggle }: AccountRowProperties) {
  const { node } = row;
  const paddingLeft = `${INDENT_BASE_REM + node.depth * INDENT_STEP_REM}rem`;
  if (row.kind === "parentTotal") return <TotalRow label={`Total for ${node.label}`} figures={node.total} sign={sign} columnCount={columnCount} paddingLeft={paddingLeft} />;

  // Open, a parent shows its own figures (if gl-node sent any); collapsed, its total.
  const figuresOf = (index: number): Amounts | null => {
    if (row.kind === "parent" && row.collapsed) return showTotals ? node.total[index] : null;
    return node.own?.[index] ?? null;
  };
  return (
    <tr className={ROW_CLASSES}>
      <td className="py-1 pr-3 text-[var(--color-text-primary)]" style={{ paddingLeft }}>
        {row.kind === "parent" ? <ToggleLabel label={node.label} open={!row.collapsed} onToggle={() => onToggle(node.name)} strong={false} /> : node.label}
      </td>
      {columnIndexes(columnCount).map((index) => (
        <td key={index} className={AMOUNT_CLASSES}>
          <Figures amounts={figuresOf(index)} sign={sign} />
        </td>
      ))}
    </tr>
  );
}

type BlockProperties = { columnCount: number; showTotals: boolean; collapsedNames: ReadonlySet<string>; onToggle: (name: string) => void };

/** A section's heading (its total on it when collapsed, as QuickBooks), its rows, then *Total for <section>*. */
function SectionRows({ block, nested, columnCount, showTotals, collapsedNames, onToggle }: BlockProperties & { block: SectionBlock; nested: boolean }) {
  const open = !collapsedNames.has(blockKey(block.key));
  return (
    <>
      <tr className={`${ROW_CLASSES} ${nested ? "bg-[var(--color-container-background-secondary)]" : "bg-[var(--color-report-row-alt)]"}`}>
        <td className={CELL_CLASSES}>
          <ToggleLabel label={block.label} open={open} onToggle={() => onToggle(blockKey(block.key))} strong />
        </td>
        {columnIndexes(columnCount).map((index) => (
          <td key={index} className={`${AMOUNT_CLASSES} font-semibold`}>
            {!open && showTotals ? <Figures amounts={block.total[index]} sign={block.sign} total /> : null}
          </td>
        ))}
      </tr>
      {open
        ? reportRows(block.nodes, collapsedNames, showTotals).map((row) => <AccountRow key={row.key} row={row} columnCount={columnCount} sign={block.sign} showTotals={showTotals} onToggle={onToggle} />)
        : null}
      {open
        ? (block.extraRows ?? []).map((extra) => (
            <tr key={extra.key} className={ROW_CLASSES}>
              <td className="py-1 pr-3 text-[var(--color-text-primary)]" style={{ paddingLeft: `${INDENT_BASE_REM}rem` }}>
                {extra.label}
              </td>
              {columnIndexes(columnCount).map((index) => (
                <td key={index} className={AMOUNT_CLASSES}>
                  <Figures amounts={extra.figures[index]} sign={block.sign} />
                </td>
              ))}
            </tr>
          ))
        : null}
      {open && showTotals ? <TotalRow label={`Total for ${block.label}`} figures={block.total} sign={block.sign} columnCount={columnCount} paddingLeft={nested ? "1rem" : undefined} /> : null}
    </>
  );
}

function GroupRows({ block, columnCount, showTotals, collapsedNames, onToggle }: BlockProperties & { block: GroupBlock }) {
  const open = !collapsedNames.has(blockKey(block.key));
  return (
    <>
      <tr className={`${ROW_CLASSES} bg-[var(--color-report-row-alt)]`}>
        <td className={CELL_CLASSES}>
          <ToggleLabel label={block.label} open={open} onToggle={() => onToggle(blockKey(block.key))} strong />
        </td>
        {columnIndexes(columnCount).map((index) => (
          <td key={index} className={`${AMOUNT_CLASSES} font-semibold`}>
            {!open && showTotals ? <Figures amounts={block.total[index]} sign={block.sign} total /> : null}
          </td>
        ))}
      </tr>
      {open
        ? block.sections.map((section) => (
            <SectionRows key={section.key} block={section} nested columnCount={columnCount} showTotals={showTotals} collapsedNames={collapsedNames} onToggle={onToggle} />
          ))
        : null}
      {open && showTotals ? <TotalRow label={`Total for ${block.label}`} figures={block.total} sign={block.sign} columnCount={columnCount} /> : null}
    </>
  );
}

function LineRow({ block, columnCount, showTotals }: { block: LineBlock; columnCount: number; showTotals: boolean }) {
  const shown = block.fromNode || showTotals;
  return (
    <tr className={`${ROW_CLASSES} border-t border-t-[var(--color-divider-tertiary)] bg-[var(--color-report-row-alt)]`}>
      <td className={`${CELL_CLASSES} font-semibold`}>{block.label}</td>
      {columnIndexes(columnCount).map((index) => (
        <td key={index} className={`${AMOUNT_CLASSES} font-semibold`}>
          {shown ? <Figures amounts={block.figures[index]} sign={block.sign} total /> : null}
        </td>
      ))}
    </tr>
  );
}

type ReportTableProperties = {
  /** The value columns' headings (`Debit`, `Credit`; or `Total`). */
  columnLabels: readonly string[];
  blocks: readonly ReportBlock[];
  /** False when gl-node marked the answer inexact: no totals the table adds up itself. */
  showTotals: boolean;
  collapsedNames: ReadonlySet<string>;
  onToggle: (name: string) => void;
  /** Rows after the blocks: the report's own totals (the Trial Balance's *Total*). */
  closingRows?: ReactNode;
};

/**
 * A report's table: the header row, then its blocks (collapsible sections
 * of accounts nested by their parts, groups of sections, single lines) and
 * the totals the statement shows (docs/parity/reports.md).
 */
export function ReportTable({ columnLabels, blocks, showTotals, collapsedNames, onToggle, closingRows }: ReportTableProperties) {
  const columnCount = columnLabels.length;
  const shared = { columnCount, showTotals, collapsedNames, onToggle };
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-y border-[var(--color-divider-tertiary)] bg-[var(--color-container-background-accent)]">
          <th className={`${CELL_CLASSES} text-left font-medium`}>Account</th>
          {columnLabels.map((label) => (
            <th key={label} className={`${CELL_CLASSES} text-right font-medium`}>
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {blocks.map((block) => {
          if (block.kind === "group") return <GroupRows key={block.key} block={block} {...shared} />;
          if (block.kind === "line") return <LineRow key={block.key} block={block} columnCount={columnCount} showTotals={showTotals} />;
          return <SectionRows key={block.key} block={block} nested={false} {...shared} />;
        })}
        {closingRows}
      </tbody>
    </table>
  );
}
