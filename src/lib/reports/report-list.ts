import { ListChecks, type LucideIcon } from "lucide-react";

export type ReportIdentifier = "profit-and-loss" | "balance-sheet" | "trial-balance";

export type ReportListItem = {
  identifier: ReportIdentifier;
  label: string;
  href: string;
  icon: LucideIcon;
};

/**
 * The standard reports that are built, in the old app's order (Profit and
 * Loss, Balance Sheet, Trial Balance). The Standard Reports page and the
 * tabs above each report both list these; a report is added here once its
 * screen is built (nothing on screen is a stub).
 */
export const BUILT_REPORTS: readonly ReportListItem[] = [{ identifier: "trial-balance", label: "Trial Balance", href: "/reports/trial-balance", icon: ListChecks }];
