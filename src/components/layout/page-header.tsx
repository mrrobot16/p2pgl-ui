import type { ReactNode } from "react";

type PageHeaderProperties = {
  /** The breadcrumb's first part, the area ("Accounting"). */
  section: string;
  title: string;
  /** Buttons on the right of the title. */
  actions?: ReactNode;
  /** The right side of the breadcrumb row. */
  topRight?: ReactNode;
  className?: string;
};

/**
 * A list screen's header: a breadcrumb row (section / title), then the
 * 32px title with the screen's actions on its right. The old header's
 * disabled "Give feedback" button is left out (nothing on screen is a stub).
 */
export function PageHeader({ section, title, actions, topRight, className }: PageHeaderProperties) {
  return (
    <>
      <div className={`mb-2 flex items-center justify-between gap-3 text-sm leading-[21px] text-[var(--color-text-primary)] ${className ?? ""}`}>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
          <span>{section}</span>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{title}</span>
        </nav>
        {topRight}
      </div>
      <div className="mb-[22px] flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[32px] font-normal leading-10 text-[var(--color-text-global)]">{title}</h1>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </>
  );
}
