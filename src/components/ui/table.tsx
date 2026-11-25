import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";

import { joinClasses } from "@/components/ui/field-styles";

// Building blocks, not a data-driven table: screens keep their own rows and
// cells and take borders, header and row styling from here.

type CellAlign = "left" | "right" | "center";

const ALIGN_CLASSES: Record<CellAlign, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center"
};

function Root({ children, className, ...divAttributes }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div {...divAttributes} className={joinClasses("overflow-auto rounded border border-[var(--color-divider-tertiary)]", className)}>
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

function Head({ children, className, sticky = false, ...sectionAttributes }: HTMLAttributes<HTMLTableSectionElement> & { children: ReactNode; sticky?: boolean }) {
  return (
    <thead {...sectionAttributes} className={joinClasses("bg-[var(--color-container-background-accent)]", sticky && "sticky top-0 z-10", className)}>
      {children}
    </thead>
  );
}

function HeaderCell({ children, align = "left", className, ...cellAttributes }: ThHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode; align?: CellAlign }) {
  return (
    <th {...cellAttributes} className={joinClasses("px-3 py-2 font-medium text-[var(--color-text-primary)]", ALIGN_CLASSES[align], className)}>
      {children}
    </th>
  );
}

function Body({ children, className, ...sectionAttributes }: HTMLAttributes<HTMLTableSectionElement> & { children: ReactNode }) {
  return (
    <tbody {...sectionAttributes} className={className}>
      {children}
    </tbody>
  );
}

function Row({ children, className, selected = false, ...rowAttributes }: HTMLAttributes<HTMLTableRowElement> & { children: ReactNode; selected?: boolean }) {
  return (
    <tr
      {...rowAttributes}
      className={joinClasses(
        "border-b border-[var(--color-container-background-secondary)] transition-colors hover:bg-[var(--color-table-row-hover)]",
        selected && "bg-[var(--color-action-passive-subtle-active)]",
        className
      )}
    >
      {children}
    </tr>
  );
}

function Cell({ children, align = "left", className, ...cellAttributes }: TdHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode; align?: CellAlign }) {
  return (
    <td {...cellAttributes} className={joinClasses("px-3 py-2 align-top", ALIGN_CLASSES[align], className)}>
      {children}
    </td>
  );
}

export const Table = { Root, Head, HeaderCell, Body, Row, Cell };
