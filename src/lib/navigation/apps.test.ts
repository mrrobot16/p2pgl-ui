import { describe, expect, test } from "bun:test";
import { Banknote, BookOpen, Building2, Landmark, Receipt } from "lucide-react";
import { activeCategoryIdentifier, isCurrentItem, isRailLinkActive, visibleCategories, type AppCategory } from "@/lib/navigation/apps";

const categories: AppCategory[] = [
  {
    identifier: "accounting",
    label: "Accounting",
    icon: Landmark,
    items: [
      { label: "Bank Transactions", href: "/app/banking", icon: Banknote },
      { label: "Reconcile", href: "/app/reconcile", icon: Receipt },
      { label: "Chart of Accounts", href: "/app/chart-of-accounts", icon: Building2 }
    ]
  },
  {
    identifier: "expenses-bills",
    label: "Expenses & Bills",
    icon: Receipt,
    items: [
      { label: "Overview", href: "/app/expenses-bills", icon: Receipt },
      { label: "Bills", href: "/app/expenses-bills/bills", icon: Receipt }
    ]
  },
  { identifier: "team", label: "Team", icon: Building2, items: [] }
];

describe("visibleCategories", () => {
  test("leaves out categories with no built pages", () => {
    expect(visibleCategories(categories).map((category) => category.identifier)).toEqual(["accounting", "expenses-bills"]);
  });
});

describe("activeCategoryIdentifier", () => {
  test("a listed page belongs to its category", () => {
    expect(activeCategoryIdentifier("/app/chart-of-accounts", categories)).toBe("accounting");
  });

  test("a page under a listed page belongs to that page's category", () => {
    expect(activeCategoryIdentifier("/app/reconcile/session/checking", categories)).toBe("accounting");
  });

  test("the longest listed path wins over its parent's", () => {
    expect(activeCategoryIdentifier("/app/expenses-bills/bills", categories)).toBe("expenses-bills");
  });

  test("a path that only shares a prefix does not match", () => {
    expect(activeCategoryIdentifier("/app/reconciled", categories)).toBeNull();
  });

  test("pages outside every category have none", () => {
    expect(activeCategoryIdentifier("/reports/trial-balance", categories)).toBeNull();
  });
});

describe("isCurrentItem", () => {
  test("only the exact path is current, not its parent", () => {
    const overview = categories[1].items[0];
    expect(isCurrentItem(overview, "/app/expenses-bills")).toBe(true);
    expect(isCurrentItem(overview, "/app/expenses-bills/bills")).toBe(false);
  });
});

describe("isRailLinkActive", () => {
  const reports = { identifier: "reports", label: "Reports", href: "/reports", icon: BookOpen, activePathPrefix: "/reports" };

  test("the prefix and everything under it", () => {
    expect(isRailLinkActive(reports, "/reports")).toBe(true);
    expect(isRailLinkActive(reports, "/reports/trial-balance")).toBe(true);
  });

  test("not a path that merely starts with the same letters", () => {
    expect(isRailLinkActive(reports, "/reportsx")).toBe(false);
  });
});
