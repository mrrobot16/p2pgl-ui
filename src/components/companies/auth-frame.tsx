import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeMenu } from "@/components/theme/theme-menu";

type AuthFrameProperties = {
  children: ReactNode;
  /** The line under the form: a question and a link to the other page. */
  footer: { question: string; linkLabel: string; href: string };
};

/**
 * The sign-in pages' frame, as in the old app: the brand panel on the left
 * (large screens only), the form on the right, the theme menu in the bottom
 * right corner. No photo and no wordmark (the maintainer's call): the
 * panel's text sits on the brand's dark green.
 */
export function AuthFrame({ children, footer }: AuthFrameProperties) {
  return (
    <main className="relative flex h-screen bg-[var(--color-container-background-primary)]">
      <div className="absolute bottom-8 right-6 z-20">
        <ThemeMenu menuAlign="top" variant="standalone" />
      </div>

      <div className="hidden w-1/2 shrink-0 p-4 lg:block">
        <BrandPanel />
      </div>

      <div className="flex flex-1 flex-col items-center px-6 py-10 text-center">
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        <p className="text-sm text-[var(--color-text-primary)]">
          {footer.question}{" "}
          <Link href={footer.href} className="text-[var(--color-link-action)] hover:underline">
            {footer.linkLabel}
          </Link>
        </p>
      </div>
    </main>
  );
}

function BrandPanel() {
  return (
    <aside className="flex h-full w-full flex-col justify-between overflow-hidden rounded-3xl bg-[#0b3d1a] px-12 py-10 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Double-entry, done right</p>
      <div>
        <h2 className="mb-3 max-w-[575px] text-5xl font-semibold leading-[1.05] md:text-6xl">Every transaction, perfectly balanced.</h2>
        <p className="max-w-sm text-lg text-white/70">The GL of accountants, by accountants, for accountants.</p>
      </div>
    </aside>
  );
}
