import { useEffect, useRef } from "react";
import { MQ, gsap } from "@/lib/motion";

/**
 * A ring that trails the pointer and swells over anything clickable.
 *
 * It sits *alongside* the native cursor rather than replacing it — hiding the
 * system pointer costs more in usability than the effect returns. Desktop
 * pointers only, and never under reduced motion.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add(`${MQ.fine} and ${MQ.motion}`, () => {
      gsap.set(el, { opacity: 0, scale: 0.6 });

      // the ring lags the pointer by a few frames; that lag is the whole effect
      const xTo = gsap.quickTo(el, "x", { duration: 0.55, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.55, ease: "power3.out" });
      let shown = false;

      const onMove = (event: PointerEvent) => {
        xTo(event.clientX);
        yTo(event.clientY);
        if (!shown) {
          shown = true;
          gsap.to(el, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
        }
      };

      const interactive = "a, button, [data-cursor='grow']";
      const onOver = (event: PointerEvent) => {
        const hit = (event.target as HTMLElement | null)?.closest?.(interactive);
        gsap.to(el, {
          scale: hit ? 1.9 : 1,
          borderColor: hit ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)",
          duration: 0.45,
          ease: "power3.out",
        });
      };

      const onLeaveWindow = () => gsap.to(el, { opacity: 0, duration: 0.25 });

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerover", onOver, { passive: true });
      document.addEventListener("pointerleave", onLeaveWindow);

      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerover", onOver);
        document.removeEventListener("pointerleave", onLeaveWindow);
      };
    });

    return () => mm.revert();
  }, []);

  return <div ref={ref} className="cursor-ring hidden md:block" aria-hidden="true" />;
}
