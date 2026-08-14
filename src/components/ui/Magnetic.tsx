import { useEffect, useRef, type ReactNode } from "react";
import { MQ, gsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Leans its child toward the cursor and springs back on leave.
 *
 * quickTo interpolates on its own, so no debouncing is needed and no new tween
 * is allocated per mousemove. Strength is clamped well under half the element's
 * size so the target never escapes its own hit box.
 */
export function Magnetic({
  children,
  className,
  strength = 0.28,
  max = 12,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  max?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add(`${MQ.fine} and ${MQ.motion}`, () => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "elastic.out(1, 0.5)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "elastic.out(1, 0.5)" });

      const onMove = (event: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const dx = event.clientX - (r.left + r.width / 2);
        const dy = event.clientY - (r.top + r.height / 2);
        xTo(gsap.utils.clamp(-max, max, dx * strength));
        yTo(gsap.utils.clamp(-max, max, dy * strength));
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      };
    });

    return () => mm.revert();
  }, [strength, max]);

  return (
    <span ref={ref} className={cn("inline-block will-change-transform", className)}>
      {children}
    </span>
  );
}
