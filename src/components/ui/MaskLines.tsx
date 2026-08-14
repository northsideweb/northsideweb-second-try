import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DUR, EASE, MQ, gsap, useGsap } from "@/lib/motion";

type Props = {
  /**
   * One entry per visual line. Line breaks are authored rather than measured:
   * a headline is the one place on a site where the break points are a design
   * decision, and it keeps the DOM to a handful of spans instead of one per
   * character.
   */
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  /** Delay before the first line, in seconds. */
  delay?: number;
  stagger?: number;
  /** Play on mount instead of when the block scrolls into view. */
  onMount?: boolean;
};

/**
 * The site's headline reveal: each line rises out of its own clipping box.
 *
 * Used for section headings and the hero. Nothing else on the page uses this
 * movement, so a masked rise always means "a new part of the site starts here".
 */
export function MaskLines({
  lines,
  as: Tag = "h2",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.075,
  onMount = false,
}: Props) {
  const scope = useGsap(
    ({ self }) => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const inner = self.querySelectorAll<HTMLElement>("[data-line-inner]");
        gsap.fromTo(
          inner,
          { yPercent: 118 },
          {
            yPercent: 0,
            duration: DUR.slow,
            ease: EASE.out,
            delay,
            stagger,
            scrollTrigger: onMount
              ? undefined
              : { trigger: self, start: "top 85%", once: true },
          }
        );
      });
      return () => mm.revert();
    },
    [delay, stagger, onMount]
  );

  return (
    <div ref={scope}>
      <Tag className={className}>
        {lines.map((line, i) => (
          <span key={i} className={cn("line-mask", lineClassName)}>
            <span data-line-inner className="block will-change-transform">
              {line}
            </span>
          </span>
        ))}
      </Tag>
    </div>
  );
}
