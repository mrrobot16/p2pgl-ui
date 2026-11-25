"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { CategoryFlyout } from "@/components/layout/category-flyout";
import {
  APP_CATEGORIES,
  LOGO_HREF,
  RAIL_CATEGORY_IDENTIFIERS,
  RAIL_LINKS,
  SETTINGS_LINK,
  activeCategoryIdentifier,
  isRailLinkActive,
  visibleCategories,
  type AppCategory,
  type RailLink
} from "@/lib/navigation/apps";

// Long enough that passing over an icon on the way elsewhere doesn't open its flyout.
export const HOVER_OPEN_DELAY_MILLISECONDS = 350;

type RailItemProperties = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
  active?: boolean;
};

/** One square on the rail: an icon in a rounded shell, a small label under it. */
const RailItem = forwardRef<HTMLAnchorElement, RailItemProperties>(function RailItem({ label, icon: Icon, href, active = false }, forwardedReference) {
  return (
    <Link ref={forwardedReference} href={href} aria-label={label} aria-current={active ? "page" : undefined} className="group block h-[72px] w-full">
      <div className="flex h-full flex-col items-center justify-center gap-1 text-xs text-[var(--gbsg-nav-bar-icon-color)]">
        <div className={`side-nav-icon-shell ${active ? "side-nav-icon-shell-active" : ""}`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-[11px] font-[var(--font-weight-body-semibold)] leading-none text-[var(--gbsg-nav-bar-text-color)]">{label}</span>
      </div>
    </Link>
  );
});

type FlyoutRailItemProperties = RailItemProperties & {
  children: (close: () => void) => ReactNode;
};

/**
 * A rail item that opens a flyout: after a short hover, or at once on
 * keyboard focus. It closes when pointer and focus have both left the item
 * and its flyout; Escape closes it and puts focus back on the item.
 * Clicking the item goes to its first page.
 */
function FlyoutRailItem({ label, icon, href, active = false, children }: FlyoutRailItemProperties) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerReference = useRef<HTMLAnchorElement>(null);
  const wrapperReference = useRef<HTMLDivElement>(null);
  // Escape puts focus back on the item; that one focus must not reopen the flyout.
  const returningFocus = useRef(false);

  function clearTimer() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }
  function close() {
    clearTimer();
    setOpen(false);
  }
  useEffect(() => clearTimer, []);

  return (
    <div
      ref={wrapperReference}
      className="relative"
      onMouseEnter={() => {
        clearTimer();
        timer.current = setTimeout(() => setOpen(true), HOVER_OPEN_DELAY_MILLISECONDS);
      }}
      onMouseLeave={close}
      onFocusCapture={() => {
        clearTimer();
        if (returningFocus.current) {
          returningFocus.current = false;
          return;
        }
        setOpen(true);
      }}
      onBlurCapture={(event) => {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !wrapperReference.current?.contains(next)) close();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        close();
        const trigger = triggerReference.current;
        if (trigger && document.activeElement !== trigger) {
          returningFocus.current = true;
          trigger.focus();
        }
      }}
    >
      <RailItem ref={triggerReference} label={label} icon={icon} href={href} active={active || open} />
      {/* Once the flyout shows, the hover timer has already fired: closing only hides it. */}
      {open ? <div className="absolute left-[90%] top-0 z-50">{children(() => setOpen(false))}</div> : null}
    </div>
  );
}

type SideRailProperties = {
  links?: RailLink[];
  categories?: AppCategory[];
  settingsLink?: RailLink | null;
};

/** The 73px rail on the left: logo, links, rail categories, Settings at the bottom. */
export function SideRail({ links = RAIL_LINKS, categories = APP_CATEGORIES, settingsLink = SETTINGS_LINK }: SideRailProperties) {
  const pathname = usePathname() ?? "/";
  const shownCategories = visibleCategories(categories).filter((category) => RAIL_CATEGORY_IDENTIFIERS.includes(category.identifier));
  const activeCategory = activeCategoryIdentifier(pathname, categories);

  return (
    <aside className="side-nav relative flex h-full w-[73px] shrink-0 flex-col justify-between bg-[var(--color-sidebar-background)]">
      <div className="flex flex-col">
        <Link href={LOGO_HREF} className="mx-[4px] flex h-[72px] items-center justify-center" aria-label="Go to home">
          <Image src="/logo.svg" alt="newGL" width={26} height={26} priority />
        </Link>

        <nav aria-label="Main" className="mx-[4px] flex flex-col">
          {links.map((link) => (
            <RailItem key={link.identifier} label={link.label} icon={link.icon} href={link.href} active={isRailLinkActive(link, pathname)} />
          ))}
          {shownCategories.map((category) => (
            <FlyoutRailItem
              key={category.identifier}
              label={category.railLabel ?? category.label}
              icon={category.icon}
              href={category.items[0].href}
              active={activeCategory === category.identifier}
            >
              {(close) => <CategoryFlyout category={category} onNavigate={close} />}
            </FlyoutRailItem>
          ))}
        </nav>
      </div>

      {settingsLink ? (
        <div className="mx-[4px] pb-[12px]">
          <RailItem label={settingsLink.label} icon={settingsLink.icon} href={settingsLink.href} active={isRailLinkActive(settingsLink, pathname)} />
        </div>
      ) : null}
    </aside>
  );
}
