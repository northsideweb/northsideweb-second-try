import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/**
 * One easing vocabulary for the whole site. Every entrance uses EXPO — a long,
 * soft settle reads as considered; a linear finish reads as a stock fade-up.
 */
export const EASE = {
  out: "expo.out",
  inOut: "power3.inOut",
  scrub: "none",
} as const;

export const DUR = { fast: 0.5, base: 0.9, slow: 1.3 } as const;

/** Media queries the whole site keys its motion off. */
export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  belowDesktop: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
  fine: "(pointer: fine)",
} as const;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Lenis + ScrollTrigger, wired together.
 *
 * Lenis drives the rAF loop and tells ScrollTrigger where the page is, so
 * scrubbed timelines stay locked to the smoothed position instead of lagging a
 * frame behind it. Reduced motion gets plain native scrolling.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.05,
      // a long, flat tail: the page keeps gliding after the wheel stops, which
      // is most of what makes a site feel expensive to scroll
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.4,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // anchor links go through Lenis so they inherit the same easing
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]');
      if (!(link instanceof HTMLAnchorElement)) return;
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: 0, duration: 1.4 });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);
}

/**
 * Run a GSAP setup inside a scoped context so every tween and ScrollTrigger it
 * creates is reverted on unmount. `deps` behaves like useEffect's.
 *
 * useLayoutEffect, not useEffect: with useEffect the "from" state lands after
 * paint and elements flash in at full opacity before animating.
 */
export function useGsap(
  setup: (ctx: { self: HTMLElement }) => void,
  deps: React.DependencyList = []
) {
  const scope = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const self = scope.current;
    if (!self) return;
    const ctx = gsap.context(() => setup({ self }), self);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scope;
}

/** True once the viewport is at or above `px`, kept in sync with resizes. */
export function useMinWidth(px: number) {
  const query = `(min-width: ${px}px)`;
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/**
 * ScrollTrigger measures the page on creation. Fonts and images that land after
 * that shift every start/end below them, so refresh once the page has settled.
 */
export function useScrollTriggerRefresh() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    const id = window.setTimeout(refresh, 400);
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("load", refresh);
    };
  }, []);
}

export { gsap, ScrollTrigger };
