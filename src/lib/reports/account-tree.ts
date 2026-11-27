import { addAmounts, amountsAreZero, type Amount, type Amounts } from "@/lib/money/amounts";

/**
 * One row of a gl-node report: an account and its figures, one list of
 * amounts per value column (Debit and Credit; or one column per period).
 * A row is the account's own postings only: a parent's row doesn't include
 * its children (gl-node session, 2026-11-27). Signs are as stored: Assets
 * and Expenses positive; Income, Liabilities and Equity negative.
 */
export type ReportLine = { account: string; columns: readonly Amounts[] };

/**
 * An account in the tree. A parent's total is its own row (if it has one)
 * plus every row under it; a parent with no row of its own (an account
 * without postings, or a path segment that is no account) is a heading
 * drawn by the UI, `own: null`.
 */
export type AccountTreeNode = {
  /** The full name (`Expenses:Office:Supplies`); for a heading, the path so far. */
  name: string;
  /** The last part of the name, what the row shows. */
  label: string;
  /** 0 for the accounts right under a section. */
  depth: number;
  own: Amount[][] | null;
  children: AccountTreeNode[];
  /** Own plus every row under it, per column and per currency, in stored signs. */
  total: Amount[][];
};

/** A section of a report: the accounts under one Beancount root (`Assets`, `Income`…). */
export type ReportSection = {
  root: string;
  nodes: AccountTreeNode[];
  /** Every row of the section added up, per column and per currency, in stored signs. */
  total: Amount[][];
};

/** The order of sections, as the old app and QuickBooks show them. Other roots follow, by name. */
export const ROOT_ORDER: readonly string[] = ["Assets", "Liabilities", "Equity", "Income", "Expenses"];

function emptyColumns(columnCount: number): Amount[][] {
  return Array.from({ length: columnCount }, () => []);
}

function addColumns(first: readonly Amounts[], second: readonly Amounts[]): Amount[][] {
  return first.map((column, index) => addAmounts(column, second[index] ?? []));
}

type MutableNode = {
  name: string;
  label: string;
  depth: number;
  own: Amount[][] | null;
  children: Map<string, MutableNode>;
};

function finish(node: MutableNode, columnCount: number): AccountTreeNode {
  const children = [...node.children.values()].sort((first, second) => first.label.localeCompare(second.label)).map((child) => finish(child, columnCount));
  const total = children.reduce((sum, child) => addColumns(sum, child.total), node.own ? addColumns(emptyColumns(columnCount), node.own) : emptyColumns(columnCount));
  return { name: node.name, label: node.label, depth: node.depth, own: node.own, children, total };
}

function compareRoots(first: string, second: string): number {
  const firstIndex = ROOT_ORDER.indexOf(first);
  const secondIndex = ROOT_ORDER.indexOf(second);
  if (firstIndex !== -1 || secondIndex !== -1) {
    if (firstIndex === -1) return 1;
    if (secondIndex === -1) return -1;
    return firstIndex - secondIndex;
  }
  return first.localeCompare(second);
}

/**
 * Groups a report's rows into sections by their root and nests each
 * section's accounts by their `:` parts. Rows that are zero in every column
 * are left out (as the old app did). Totals are exact sums of the rows given,
 * which must all come from one gl-node answer.
 */
export function buildReportSections(lines: readonly ReportLine[], columnCount: number): ReportSection[] {
  const roots = new Map<string, Map<string, MutableNode>>();

  for (const line of lines) {
    if (line.columns.every((column) => amountsAreZero(column))) continue;
    const [root, ...path] = line.account.split(":");
    const parts = path.length > 0 ? path : [root];
    let level: Map<string, MutableNode> = roots.get(root) ?? new Map();
    roots.set(root, level);
    let name = path.length > 0 ? root : "";
    for (const [depth, part] of parts.entries()) {
      name = name === "" ? part : `${name}:${part}`;
      let node: MutableNode | undefined = level.get(part);
      if (!node) {
        node = { name, label: part, depth, own: null, children: new Map() };
        level.set(part, node);
      }
      if (depth === parts.length - 1) {
        node.own = Array.from({ length: columnCount }, (unused, index) => [...(line.columns[index] ?? [])]);
      }
      level = node.children;
    }
  }

  return [...roots].sort(([first], [second]) => compareRoots(first, second)).map(([root, level]) => {
    const nodes = [...level.values()].sort((first, second) => first.label.localeCompare(second.label)).map((node) => finish(node, columnCount));
    const total = nodes.reduce((sum, node) => addColumns(sum, node.total), emptyColumns(columnCount));
    return { root, nodes, total };
  });
}

/**
 * A row as the report table draws it:
 * - `account`: an account with no accounts under it, its own figures;
 * - `parent`: a heading over accounts; open, it shows its own figures (if
 *   gl-node sent any); collapsed, its total;
 * - `parentTotal`: *Total for <parent>*, after an open parent's accounts.
 */
export type ReportRow = { key: string; kind: "account" | "parent" | "parentTotal"; node: AccountTreeNode; collapsed: boolean };

/** The rows to draw, top to bottom; nothing under a collapsed parent. Without totals, no `parentTotal` rows. */
export function reportRows(nodes: readonly AccountTreeNode[], collapsedNames: ReadonlySet<string>, showTotals: boolean): ReportRow[] {
  const rows: ReportRow[] = [];
  for (const node of nodes) {
    if (node.children.length === 0) {
      rows.push({ key: node.name, kind: "account", node, collapsed: false });
      continue;
    }
    const collapsed = collapsedNames.has(node.name);
    rows.push({ key: node.name, kind: "parent", node, collapsed });
    if (collapsed) continue;
    rows.push(...reportRows(node.children, collapsedNames, showTotals));
    if (showTotals) rows.push({ key: `${node.name} total`, kind: "parentTotal", node, collapsed: false });
  }
  return rows;
}

/** Every parent's name, for *Collapse all*. */
export function parentNames(nodes: readonly AccountTreeNode[]): string[] {
  return nodes.flatMap((node) => (node.children.length > 0 ? [node.name, ...parentNames(node.children)] : []));
}
