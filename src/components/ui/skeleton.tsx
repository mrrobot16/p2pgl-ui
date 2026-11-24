/**
 * A loading placeholder. The caller gives it the size and shape of what it
 * stands for (`h-4 w-24 rounded`), so nothing shifts when the content
 * arrives; it has no shape of its own.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse bg-[var(--color-container-background-secondary)] ${className ?? ""}`.trim()} />;
}
