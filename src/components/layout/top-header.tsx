"use client";

import { AccountMenu } from "@/components/layout/account-menu";
import { CompanyPicker } from "@/components/layout/company-picker";
import { ThemeMenu } from "@/components/theme/theme-menu";

/** The 57px bar above the content: the company picker, the theme menu and the account menu. */
export function TopHeader() {
  return (
    <header className="top-header flex h-[57px] shrink-0 items-center justify-between gap-3 rounded-t-[var(--radius-x-large)] bg-[var(--color-container-background-primary)] px-5">
      <CompanyPicker />
      <div className="flex items-center gap-3">
        <ThemeMenu />
        <AccountMenu />
      </div>
    </header>
  );
}
