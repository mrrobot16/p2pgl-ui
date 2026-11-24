import { Landmark, type LucideIcon } from "lucide-react";

/** A rail item that is a plain link (Home, Reports, Settings in the old app). */
export type RailLink = {
  identifier: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** The path prefix that marks it active. */
  activePathPrefix: string;
};

/**
 * The rail's plain links above the categories, only those that are backed.
 * Home is hidden until its dashboard is backed (docs/plan.md, question 2);
 * Reports arrives with step 4.
 */
export const RAIL_LINKS: RailLink[] = [];

/** The bottom-pinned Settings link; none until a settings page is backed. */
export const SETTINGS_LINK: RailLink | null = null;

/** Where the logo goes: `/`, which opens Bank Transactions while Home is hidden. */
export const LOGO_HREF = "/";

export function isRailLinkActive(link: RailLink, pathname: string): boolean {
  return pathname === link.activePathPrefix || pathname.startsWith(`${link.activePathPrefix}/`);
}

export type AppNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type AppCategory = {
  identifier: string;
  label: string;
  /** The shorter label under the rail icon, for categories on the rail. */
  railLabel?: string;
  icon: LucideIcon;
  items: AppNavigationItem[];
};

/**
 * The app categories, in the old app's order, each listing only the pages
 * that are built and backed by gl-node (nothing on screen is a stub). A
 * category with no items is not shown anywhere. Each area adds its items
 * here as it is built: Accounting gets Bank Transactions and Chart of
 * Accounts in steps 5 and 6 (docs/plan.md).
 */
export const APP_CATEGORIES: AppCategory[] = [
  {
    identifier: "accounting",
    label: "Accounting",
    railLabel: "Accounting",
    icon: Landmark,
    items: []
  }
];

/** The categories that have at least one page. */
export function visibleCategories(categories: AppCategory[] = APP_CATEGORIES): AppCategory[] {
  return categories.filter((category) => category.items.length > 0);
}

/** Categories placed directly on the rail, in rail order (the old app: Accounting, Expenses, Sales). */
export const RAIL_CATEGORY_IDENTIFIERS: readonly string[] = ["accounting"];

/**
 * Which category the current page belongs to, for the rail's active state:
 * a page listed in a category, or a page under one (a longer path that
 * starts with a listed item's path); the longest such match wins. Null for
 * pages outside every category.
 */
export function activeCategoryIdentifier(pathname: string, categories: AppCategory[] = APP_CATEGORIES): string | null {
  let bestIdentifier: string | null = null;
  let bestLength = -1;
  for (const category of categories) {
    for (const item of category.items) {
      const itemPath = item.href.split("?")[0];
      const matches = pathname === itemPath || pathname.startsWith(`${itemPath}/`);
      if (matches && itemPath.length > bestLength) {
        bestIdentifier = category.identifier;
        bestLength = itemPath.length;
      }
    }
  }
  return bestIdentifier;
}

/** Whether a sub menu item is the current page: its path exactly. */
export function isCurrentItem(item: AppNavigationItem, pathname: string): boolean {
  return pathname === item.href.split("?")[0];
}
