"use client";

import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useStoredFlag } from "@/lib/browser/stored-flag";
import { APP_CATEGORIES, activeCategoryIdentifier, isCurrentItem, visibleCategories, type AppCategory } from "@/lib/navigation/apps";

/** The old app's key, so a remembered choice reads the same. */
export const SUBMENU_OPEN_STORAGE_KEY = "newgl:all-apps-submenu-open";

// Slides only after the remembered state is applied, so a sub menu that
// was left open does not slide in on every page load.
function useMotionAfterFirstPaint(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setEnabled(true), 50);
    return () => window.clearTimeout(timer);
  }, []);
  return enabled;
}

/**
 * The frame of every page under /all-apps: a 256px sub menu on the left
 * that slides in and out, remembered between visits (closed by default),
 * and the page beside it.
 */
export function AllAppsFrame({ children, categories = APP_CATEGORIES }: { children: ReactNode; categories?: AppCategory[] }) {
  const [submenuOpen, setSubmenuOpen] = useStoredFlag(SUBMENU_OPEN_STORAGE_KEY);
  const motionEnabled = useMotionAfterFirstPaint();
  const motion = motionEnabled ? "transition-all duration-300 ease-out motion-reduce:transition-none" : "";

  return (
    <div className="flex h-full min-h-0">
      <div className={`shrink-0 overflow-hidden ${motion} ${submenuOpen ? "w-64" : "w-0"}`} aria-hidden={!submenuOpen} inert={!submenuOpen}>
        <div className={`h-full w-64 ${motion} ${submenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <AllAppsSubmenu categories={categories} onCollapse={() => setSubmenuOpen(false)} />
        </div>
      </div>
      <div className={`relative min-w-0 flex-1 overflow-y-auto bg-[var(--color-container-background-primary)] p-5 ${motion} ${submenuOpen ? "" : "pl-12"}`}>
        <button
          type="button"
          onClick={() => setSubmenuOpen(true)}
          aria-label="Show sub menu"
          title="Show sub menu"
          tabIndex={submenuOpen ? -1 : 0}
          className={`absolute left-0 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-r-lg border border-l-0 border-[var(--color-divider-tertiary)] bg-[var(--color-container-background-primary)] text-[var(--color-icon-secondary)] shadow-md hover:text-[var(--color-text-global)] ${motion} ${
            submenuOpen ? "pointer-events-none -translate-x-full opacity-0" : "translate-x-0 opacity-100"
          }`}
        >
          <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  );
}

/** An accordion of the categories, one open at a time; the current page's category opens itself. */
function AllAppsSubmenu({ categories, onCollapse }: { categories: AppCategory[]; onCollapse: () => void }) {
  const pathname = usePathname() ?? "/";
  const shownCategories = visibleCategories(categories);
  const activeCategory = activeCategoryIdentifier(pathname, categories);
  const [openIdentifier, setOpenIdentifier] = useState<string | null>(activeCategory ?? shownCategories[0]?.identifier ?? null);

  // Landing on another category's page opens that category (adjusting state
  // while rendering, so no frame shows the wrong one open). Opening or
  // closing a section by hand is left alone.
  const [followedCategory, setFollowedCategory] = useState(activeCategory);
  if (activeCategory !== followedCategory) {
    setFollowedCategory(activeCategory);
    if (activeCategory) setOpenIdentifier(activeCategory);
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-[var(--color-divider-tertiary)] bg-[var(--color-container-background-primary)] px-2 py-6">
      <div className="mb-4 flex items-center justify-between px-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-icon-secondary)]">All apps</h2>
        <button
          type="button"
          onClick={onCollapse}
          aria-label="Hide sub menu"
          title="Hide sub menu"
          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-icon-secondary)] hover:bg-[var(--color-action-passive-subtle-hover)] hover:text-[var(--color-text-global)]"
        >
          <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <nav aria-label="All apps" className="flex flex-col gap-0.5">
        {shownCategories.map((category) => {
          const CategoryIcon = category.icon;
          const isOpen = openIdentifier === category.identifier;
          return (
            <div key={category.identifier}>
              <button
                type="button"
                onClick={() => setOpenIdentifier((current) => (current === category.identifier ? null : category.identifier))}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-[var(--color-text-global)] hover:bg-[var(--color-action-passive-subtle-hover)]"
              >
                <span className="flex items-center gap-2.5">
                  <CategoryIcon className="h-4 w-4 text-[var(--color-icon-secondary)]" aria-hidden="true" />
                  {category.label}
                </span>
                <ChevronDown className={`h-4 w-4 text-[var(--color-icon-secondary)] transition-transform ${isOpen ? "" : "-rotate-90"}`} aria-hidden="true" />
              </button>
              {isOpen ? (
                <div className="mb-1 mt-0.5 flex flex-col gap-0.5">
                  {category.items.map((item) => {
                    const ItemIcon = item.icon;
                    const current = isCurrentItem(item, pathname);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={current ? "page" : undefined}
                        className={`flex items-center gap-2.5 rounded-lg py-2 pl-8 pr-2 text-sm font-medium transition-colors ${
                          current
                            ? "bg-[var(--color-action-passive-subtle-active)] text-[var(--color-text-global)]"
                            : "text-[var(--color-text-primary)] hover:bg-[var(--color-action-passive-subtle-hover)] hover:text-[var(--color-text-global)]"
                        }`}
                      >
                        <ItemIcon className="h-4 w-4 text-[var(--color-icon-secondary)]" aria-hidden="true" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
