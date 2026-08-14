import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Browser chrome around a site preview.
 *
 * Each part the showcase dissolves separately is separately addressable:
 * `data-shell` (the rounded body), `data-chrome` (the title bar) and
 * `data-frame-ring` (the hairline). The ring is its own layer rather than a
 * `ring-*` utility on the shell so it can be faded out without touching the
 * shell's own compositing.
 */
export function BrowserFrame({
  url,
  children,
  className,
  compact = false,
}: {
  url: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      data-shell
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[14px] bg-ink-2 will-change-transform",
        className
      )}
      style={{ boxShadow: "0 40px 120px -40px rgba(0,0,0,0.85)" }}
    >
      <div
        data-frame-ring
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] ring-1 ring-white/15"
      />

      <div
        data-chrome
        className={cn(
          "flex shrink-0 items-center gap-2 overflow-hidden border-b border-white/8 bg-white/[0.04] px-4",
          compact ? "py-2" : "py-2.5"
        )}
      >
        <span className="h-2 w-2 rounded-full bg-white/25" aria-hidden="true" />
        <span className="h-2 w-2 rounded-full bg-white/25" aria-hidden="true" />
        <span className="h-2 w-2 rounded-full bg-white/25" aria-hidden="true" />
        <span className="mx-auto max-w-[60%] truncate rounded-full bg-white/[0.06] px-4 py-1 text-[10px] font-medium tracking-[0.06em] text-white/45">
          {url}
        </span>
      </div>

      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}
