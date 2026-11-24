"use client";

import { ThemeMenu } from "@/components/theme/theme-menu";

/**
 * The 57px bar above the content. The company picker (left) and the avatar
 * menu (right, beside the theme menu) arrive with companies in step 3
 * (docs/parity/companies.md).
 */
export function TopHeader() {
  return (
    <header className="top-header flex h-[57px] shrink-0 items-center justify-between gap-3 rounded-t-[var(--radius-x-large)] bg-[var(--color-container-background-primary)] px-5">
      <div />
      <div className="flex items-center gap-3">
        <ThemeMenu />
      </div>
    </header>
  );
}
