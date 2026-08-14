import { useEffect, useLayoutEffect, useRef } from "react";
import { EASE, MQ, gsap, useMinWidth } from "@/lib/motion";
import { MAILTO, asset } from "@/lib/utils";
import { Button } from "./ui/Button";

/**
 * The opening frame.
 *
 * Three separate jobs are kept on three separate elements so they never fight
 * for the same transform:
 *   [data-media-enter]  the entrance — an unmasking and a settle
 *   [data-media-scroll] the departure — a slow push in as the page leaves
 *   [data-media-pointer] a few pixels of pointer drift, desktop only
 */
export function Hero({ start }: { start: boolean }) {
  const root = useRef<HTMLElement>(null);
  const wide = useMinWidth(640);

  // Hold the "from" state before first paint. Without this the headline is
  // visible for a frame and then jumps down to animate up.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.set(el.querySelectorAll("[data-hero-line] > span"), { yPercent: 118 });
      gsap.set(el.querySelectorAll("[data-hero-fade]"), { opacity: 0, y: 26 });
      gsap.set(el.querySelector("[data-media-enter]"), {
        clipPath: "inset(14% 16% 14% 16% round 10px)",
        scale: 1.16,
      });
      gsap.set(el.querySelector("[data-hero-rule]"), { scaleX: 0 });
    });
    return () => mm.revert();
  }, []);

  // Entrance, once the intro panel has cleared.
  useEffect(() => {
    if (!start) return;
    const el = root.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const tl = gsap.timeline({ defaults: { ease: EASE.out } });

      tl.to(el.querySelector("[data-media-enter]"), {
        clipPath: "inset(0% 0% 0% 0% round 0px)",
        scale: 1,
        duration: 1.9,
      })
        .to(
          el.querySelectorAll("[data-hero-line] > span"),
          { yPercent: 0, duration: 1.35, stagger: 0.085 },
          0.42
        )
        .to(el.querySelector("[data-hero-rule]"), { scaleX: 1, duration: 1.1 }, 0.5)
        .to(
          el.querySelectorAll("[data-hero-fade]"),
          { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 },
          0.85
        );
    });
    return () => mm.revert();
  }, [start]);

  // Departure + pointer drift.
  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add(MQ.motion, () => {
      gsap.to(el.querySelector("[data-media-scroll]"), {
        scale: 1.18,
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      // copy leaves faster than the photograph — that difference is the depth
      gsap.to(el.querySelector("[data-hero-copy]"), {
        yPercent: -22,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "70% top", scrub: true },
      });
      gsap.to(el.querySelector("[data-hero-scrim]"), {
        opacity: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
    });

    mm.add(`${MQ.fine} and ${MQ.motion}`, () => {
      const media = el.querySelector("[data-media-pointer]");
      const xTo = gsap.quickTo(media, "x", { duration: 1.1, ease: "power3.out" });
      const yTo = gsap.quickTo(media, "y", { duration: 1.1, ease: "power3.out" });

      const onMove = (event: PointerEvent) => {
        const nx = event.clientX / window.innerWidth - 0.5;
        const ny = event.clientY / window.innerHeight - 0.5;
        // deliberately tiny: this should register as atmosphere, not as an effect
        xTo(nx * -18);
        yTo(ny * -12);
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    });

    return () => mm.revert();
  }, []);

  const lines = wide
    ? ["Websites made", "for the beaches."]
    : ["Websites", "made for", "the beaches."];

  return (
    <section
      ref={root}
      id="top"
      className="relative isolate flex h-[100svh] min-h-[34rem] w-full flex-col justify-end overflow-hidden"
    >
      <div data-media-enter className="absolute inset-0 -z-10 will-change-[clip-path,transform]">
        <div data-media-scroll className="absolute inset-0 will-change-transform">
          <div data-media-pointer className="absolute -inset-[3%] will-change-transform">
            <img
              src={asset("hero-coast.webp")}
              srcSet={`${asset("hero-coast-1200.webp")} 1200w, ${asset("hero-coast.webp")} 2400w`}
              sizes="100vw"
              alt="Aerial view of the Northern Beaches coastline at first light"
              width={2400}
              height={1350}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* legibility scrims: one fixed, one that deepens as the page leaves */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(5,11,20,0.72)_0%,rgba(5,11,20,0.12)_32%,rgba(5,11,20,0.42)_62%,rgba(5,11,20,0.92)_100%)]"
      />
      <div
        data-hero-scrim
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-ink opacity-0"
      />

      <div data-hero-copy className="shell relative z-10 pb-[clamp(5rem,12vh,9rem)]">
        <p data-hero-fade className="eyebrow text-sky/90">
          Sydney&rsquo;s Northern Beaches
        </p>

        <h1 className="display mt-7 max-w-[16ch] text-[length:var(--step-display)] text-white">
          {lines.map((line, i) => (
            <span key={i} data-hero-line className="line-mask">
              <span className="block will-change-transform">{line}</span>
            </span>
          ))}
        </h1>

        <div
          data-hero-rule
          aria-hidden="true"
          className="mt-10 h-px w-full max-w-[42rem] origin-left bg-white/25"
        />

        <p
          data-hero-fade
          className="mt-8 max-w-[46ch] text-[length:var(--step-lead)] leading-[1.55] text-white/75"
        >
          Northside Web designs, develops and manages websites for local businesses — from the
          first sketch to the hosting it runs on.
        </p>

        <div data-hero-fade className="mt-11 flex flex-wrap items-center gap-4">
          <Button href={MAILTO}>Start a project</Button>
          <Button href="#work" variant="ghost">
            View our work
          </Button>
        </div>
      </div>

      <div
        data-hero-fade
        className="shell relative z-10 flex items-end justify-between gap-6 pb-8"
      >
        <span className="flex items-center gap-3 text-[0.7rem] tracking-[0.22em] text-white/45 uppercase">
          <span className="relative flex h-8 w-4 items-start justify-center rounded-full border border-white/25 pt-1.5">
            <span className="h-1.5 w-px animate-[scrollcue_2s_ease-in-out_infinite] bg-white/60" />
          </span>
          Scroll
        </span>
        <span className="hidden text-[0.7rem] tracking-[0.22em] text-white/40 uppercase sm:block">
          Design · Development · Hosting · Care
        </span>
      </div>

      <style>{`
        @keyframes scrollcue {
          0%   { transform: translateY(0);    opacity: 0; }
          35%  { opacity: 1; }
          100% { transform: translateY(12px); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
