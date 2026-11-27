import type { Metadata } from "next";
import Link from "next/link";

import { BUILT_REPORTS } from "@/lib/reports/report-list";

export const metadata: Metadata = {
  title: "Standard Reports"
};

// The old app's plain list of report names, each with a small trailing
// icon. QuickBooks' groups, favourites and search wait until there are more
// than three reports (docs/parity/reports.md).
export default function ReportsIndexPage() {
  return (
    <main className="h-full overflow-auto bg-[var(--color-container-background-primary)] p-5">
      <h1 className="mb-6 text-2xl font-semibold text-[var(--color-text-global)]">Standard Reports</h1>
      <ul className="flex max-w-xl flex-col divide-y divide-[var(--color-divider-tertiary)]">
        {BUILT_REPORTS.map(({ href, icon: Icon, label }) => (
          <li key={href}>
            <Link href={href} className="flex items-center justify-between py-3 text-sm text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-link-action)]">
              {label}
              <Icon className="h-4 w-4 text-[var(--color-icon-secondary)]" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
