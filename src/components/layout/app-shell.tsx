import type { ReactNode } from "react";
import { SideRail } from "@/components/layout/side-rail";
import { TopHeader } from "@/components/layout/top-header";

/**
 * The frame of every signed-in page: the rail on the left, the header and
 * the scrolling content on the right, on the page's accent background with
 * a 6px margin (none on the rail's side).
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen bg-[var(--color-container-background-accent)] p-[6px] pl-0">
      <div className="flex h-full">
        <SideRail />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopHeader />
          {/* Not <main>: pages bring their own. */}
          <div className="min-h-0 flex-1 overflow-auto rounded-b-[var(--radius-x-large)] bg-[var(--color-container-background-primary)]">{children}</div>
        </div>
      </div>
    </div>
  );
}
