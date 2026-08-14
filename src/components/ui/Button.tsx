import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Magnetic } from "./Magnetic";

type Variant = "solid" | "ghost" | "line";

const base =
  "group relative inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-[0.9rem] font-semibold " +
  "transition-[background-color,color,border-color,box-shadow] duration-500 ease-[var(--ease-out-expo)] " +
  "focus-visible:outline-2";

const variants: Record<Variant, string> = {
  // the one loud control on a screen
  solid: "bg-blue text-white shadow-[0_10px_40px_-12px_rgba(46,124,196,0.9)] hover:bg-blue-lift",
  // sits on photography without competing with the headline above it
  ghost: "border border-white/25 text-white hover:border-white/60 hover:bg-white/5",
  // on paper
  line: "border border-ink/20 text-ink-2 hover:border-ink/50 hover:bg-ink/5",
};

/**
 * Arrow slides one notch on hover and the label follows it. Every CTA on the
 * site shares this gesture so a hover always means the same thing.
 */
export function Button({
  href,
  children,
  variant = "solid",
  className,
  magnetic = true,
  arrow = true,
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  magnetic?: boolean;
  arrow?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const link = (
    <a href={href} className={cn(base, variants[variant], className)} {...rest}>
      <span className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-x-0.5">
        {children}
      </span>
      {arrow && (
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 shrink-0 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h13m-5-6 6 6-6 6" />
        </svg>
      )}
    </a>
  );

  return magnetic ? <Magnetic>{link}</Magnetic> : link;
}
