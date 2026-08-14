import { EASE, MQ, gsap, useGsap } from "@/lib/motion";
import { asset } from "@/lib/utils";
import { BrowserFrame } from "./ui/BrowserFrame";
import { MaskLines } from "./ui/MaskLines";

const PRISTINE_URL = "https://northsidewebsites.com/PFCarCleaning.Github.io/";

/**
 * The showcase.
 *
 * A real client build sits in a browser frame; as the page scrolls the frame
 * grows, its chrome dissolves, the site inside it scrolls under its own steam,
 * and the whole thing ends up filling the viewport. The intent is that a
 * visitor stops looking at a screenshot of a website and starts looking at the
 * website.
 *
 * Built on a tall section with an inner sticky child rather than a
 * ScrollTrigger pin: same picture, but no pin-spacer inserted into the layout
 * and nothing to re-measure when the surrounding content reflows.
 */
export function Immersion() {
  const scope = useGsap(({ self }) => {
    const mm = gsap.matchMedia();

    const build = (opts: { startScale: number; travelRatio: number }) => () => {
      const frame = self.querySelector<HTMLElement>("[data-frame]");
      const shell = self.querySelector<HTMLElement>("[data-shell]");
      const ring = self.querySelector<HTMLElement>("[data-frame-ring]");
      const chrome = self.querySelector<HTMLElement>("[data-chrome]");
      const shot = self.querySelector<HTMLElement>("[data-shot]");
      const viewport = self.querySelector<HTMLElement>("[data-shot-viewport]");
      if (!frame || !shell || !shot || !viewport) return;

      // layout sizes, so the maths is immune to whatever transform is applied
      const fillScale = () => {
        const w = frame.offsetWidth;
        const h = frame.offsetHeight;
        if (!w || !h) return 1.6;
        return Math.max(window.innerWidth / w, window.innerHeight / h) * 1.02;
      };

      // how far the captured page can travel inside its viewport
      const travel = () =>
        Math.max(0, shot.offsetHeight - viewport.offsetHeight) * opts.travelRatio;

      gsap.set(frame, { scale: opts.startScale, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: self,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      // 1. the preview steps forward out of the page
      tl.to(frame, { scale: opts.startScale * 1.16, duration: 0.1, ease: "power1.out" }, 0);

      // 2. the surrounding content clears out of its way
      tl.to("[data-push-up]", { yPercent: -140, opacity: 0, duration: 0.22 }, 0.04);
      tl.to("[data-push-down]", { yPercent: 140, opacity: 0, duration: 0.22 }, 0.04);

      // 3. it grows past the viewport while the frame itself dissolves
      tl.to(frame, { scale: fillScale, duration: 0.5, ease: "power1.inOut" }, 0.1);
      tl.to(shell, { borderRadius: 0, duration: 0.4 }, 0.1);
      if (ring) tl.to(ring, { opacity: 0, duration: 0.3 }, 0.1);
      if (chrome) {
        tl.to(chrome, { height: 0, opacity: 0, duration: 0.26, ease: "power2.in" }, 0.12);
      }

      // 4. and the site inside scrolls the whole way through
      tl.to(shot, { y: () => -travel(), duration: 0.82 }, 0.08);

      // 5. hand-off: rather than letting the full-bleed preview slide off the
      // top, it dissolves into the ink the next section is already sitting on,
      // and the closing line resolves out of that
      // the two beats do not overlap: the preview is gone before the line
      // arrives, so neither is read through the other
      tl.to("[data-dissolve]", { opacity: 1, duration: 0.1 }, 0.78);
      tl.to("[data-outro]", { opacity: 1, duration: 0.05 }, 0.89);
      tl.fromTo(
        "[data-outro-line]",
        { yPercent: 110 },
        { yPercent: 0, duration: 0.08, ease: EASE.out },
        0.89
      );

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    };

    mm.add(MQ.desktop, build({ startScale: 0.72, travelRatio: 0.62 }));
    // phones and tablets start closer in: a 0.72 preview is unreadable at 390px
    mm.add(MQ.belowDesktop, build({ startScale: 0.9, travelRatio: 0.45 }));

    return () => mm.revert();
  }, []);

  return (
    <section ref={scope} id="showcase" aria-label="A site we built" className="relative bg-ink">
      {/* The tall track; the sticky child is what the visitor actually sees.
          Under reduced motion none of the scrubbing happens, so the track
          collapses to an ordinary section rather than leaving four screens of
          scrolling past a static picture. */}
      {/* motion-safe on the heights: a `lg:` rule outranks a `motion-reduce:`
          one, so `lg:h-[460svh]` would have kept four viewports of empty track
          here under reduced motion, below a section that had already gone
          static. */}
      <div className="motion-safe:h-[360svh] lg:motion-safe:h-[460svh]">
        <div className="flex items-center justify-center motion-safe:sticky motion-safe:top-0 motion-safe:h-[100svh] motion-safe:overflow-hidden motion-reduce:flex-col motion-reduce:gap-14 motion-reduce:py-[var(--section-y)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(46,124,196,0.16),transparent_62%)]"
          />

          <div className="relative flex w-full flex-col items-center">
            <div data-push-up className="shell mb-[clamp(1.75rem,4vh,3rem)] text-center">
              <p className="eyebrow text-sky/80">The proof</p>
              <MaskLines
                lines={["Step inside one."]}
                className="display mt-4 text-[length:var(--step-h2)] text-white"
              />
            </div>

            <div
              data-frame
              /*
               * min-h-0: this is a flex item, and a flex item's automatic
               * minimum size would let the tall capture inside stretch it
               * straight past the aspect ratio.
               *
               * The third term in the desktop width is a height cap: at 16/10 a
               * frame 84vh wide is 52vh tall, which leaves room for the
               * heading above and the caption below on a short laptop screen.
               *
               * The frame is portrait below lg. A landscape frame on a phone
               * would need close to 4x of scale to fill the viewport, which is
               * both unreadable and visibly soft.
               */
              className="relative aspect-[10/17] min-h-0 w-[min(84vw,352px,50vh)] will-change-transform lg:aspect-[16/10] lg:w-[min(92vw,1040px,84vh)]"
            >
              <BrowserFrame url="pristine finish · northern beaches" className="h-full">
                <div data-shot-viewport className="h-full w-full overflow-hidden">
                  {/* <picture>, not two <img>s: only the matching source is
                      ever fetched, so a phone never pays for the desktop capture */}
                  <picture>
                    <source
                      media="(min-width: 1024px)"
                      srcSet={asset("media/work-pristine-scroll.webp")}
                      width={1440}
                      height={4960}
                    />
                    <img
                      data-shot
                      src={asset("media/work-pristine-mobile.webp")}
                      alt="The Pristine Finish website, scrolling from the top of the page"
                      width={430}
                      height={5600}
                      decoding="async"
                      className="block w-full will-change-transform"
                    />
                  </picture>
                </div>
              </BrowserFrame>
            </div>

            <div
              data-push-down
              className="shell mt-[clamp(1.5rem,3.5vh,2.5rem)] flex w-full items-center justify-between gap-6 text-[0.72rem] tracking-[0.18em] text-white/45 uppercase"
            >
              <span>Pristine Finish · Car detailing, Manly</span>
              <span className="hidden sm:block">Design · Build · Hosting</span>
            </div>
          </div>

          {/* the preview dissolves into the ink the next section starts on */}
          <div
            data-dissolve
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 bg-ink opacity-0 motion-reduce:hidden"
          />

          {/* the last beat, laid over that dissolve */}
          <div
            data-outro
            className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-8 px-6 text-center opacity-0 motion-reduce:static motion-reduce:opacity-100"
          >
            <span className="line-mask">
              <span
                data-outro-line
                className="display block max-w-[18ch] text-[length:var(--step-h2)] text-white"
              >
                That is the standard.
              </span>
            </span>
            <a
              href={PRISTINE_URL}
              target="_blank"
              rel="noreferrer"
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[0.8rem] font-semibold text-white transition-colors duration-500 hover:border-white/60 hover:bg-white/5"
            >
              Open the live site
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
