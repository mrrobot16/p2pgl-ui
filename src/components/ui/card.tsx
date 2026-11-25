import type { HTMLAttributes, ReactNode } from "react";

import { joinClasses } from "@/components/ui/field-styles";

export type CardPadding = "sm" | "md" | "lg";

const PADDING_CLASSES: Record<CardPadding, string> = { sm: "p-4", md: "p-6", lg: "p-8" };

type CardProperties = HTMLAttributes<HTMLElement> & {
  title?: string;
  description?: string;
  padding?: CardPadding;
  children: ReactNode;
};

/** A bordered panel: 12px corners, hairline border, no shadow (DESIGN.md, Tint-Not-Shadow). */
export function Card({ title, description, padding = "md", className, children, ...sectionAttributes }: CardProperties) {
  return (
    <section
      {...sectionAttributes}
      className={joinClasses(
        "rounded-xl border border-[var(--color-divider-tertiary)] bg-[var(--color-container-background-primary)]",
        PADDING_CLASSES[padding],
        className
      )}
    >
      {title ? <CardHeader title={title} description={description} /> : null}
      {children}
    </section>
  );
}

export function CardHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-[var(--color-text-global)]">{title}</h2>
      {description ? <p className="mt-1 text-sm text-[var(--color-text-primary)]">{description}</p> : null}
    </div>
  );
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={joinClasses("mt-4 flex items-center justify-end gap-2 border-t border-[var(--color-divider-tertiary)] pt-4", className)}>{children}</div>
  );
}
