import { useEffect, useRef } from "react";
import { EASE, gsap, prefersReducedMotion } from "@/lib/motion";
import { asset } from "@/lib/utils";

/**
 * Page-load sequence.
 *
 * A short hold on the mark while the hero photograph decodes, then the panel
 * splits and lifts to hand straight over to the hero timeline. Capped at ~1.5s
 * whatever the network does — a preloader that outstays the content it is
 * covering is just a delay.
 *
 * Skipped entirely under reduced motion, and skipped on repeat visits within a
 * session so navigating back to the page is instant.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    /*
     * The "already seen" flag is written when the sequence *finishes*, not when
     * it starts. Written up front, React's development double-invoke of effects
     * would see its own flag on the second pass and skip the intro entirely.
     */
    const finish = () => {
      if (el.style.display === "none") return;
      el.style.display = "none";
      sessionStorage.setItem("nsw-intro", "1");
      onDone();
    };

    if (sessionStorage.getItem("nsw-intro") === "1" || prefersReducedMotion()) {
      finish();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: finish });

      tl.to("[data-intro-mark]", { opacity: 1, duration: 0.55, ease: "power2.out" })
        .fromTo(
          "[data-intro-rule] span",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.85, ease: "power2.inOut" },
          0.15
        )
        .to(
          ["[data-intro-mark]", "[data-intro-rule]"],
          { opacity: 0, duration: 0.35, ease: "power2.in" },
          ">-0.1"
        )
        // the panel leaves as two halves so the hero is uncovered from the
        // middle out — a plain fade would read as a loading screen
        .to(
          "[data-intro-half]",
          { yPercent: (i) => (i === 0 ? -101 : 101), duration: 0.95, ease: EASE.inOut },
          "<0.05"
        );
    }, el);

    // hard ceiling: if anything above stalls, uncover the page anyway
    const bail = window.setTimeout(finish, 2600);

    return () => {
      window.clearTimeout(bail);
      ctx.revert();
    };
  }, [onDone]);

  return (
    <div ref={root} className="fixed inset-0 z-[100]" aria-hidden="true">
      <div data-intro-half className="absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div data-intro-half className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        <img
          data-intro-mark
          src={asset("logo-mark-white.png")}
          alt=""
          className="h-11 w-auto opacity-0"
        />
        <div data-intro-rule className="h-px w-40 overflow-hidden bg-white/10">
          <span className="block h-full w-full origin-left scale-x-0 bg-white/70" />
        </div>
      </div>
    </div>
  );
}
