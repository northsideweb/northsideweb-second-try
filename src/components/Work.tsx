import { EASE, MQ, gsap, useGsap } from "@/lib/motion";
import { asset, cn } from "@/lib/utils";
import { MaskLines } from "./ui/MaskLines";

type Project = {
  name: string;
  /** One line under the name — what the business is and where. */
  detail: string;
  /** The work done, e.g. "Design · Build · Hosting". */
  scope: string;
  /** Shown in the frame's address bar while the site is arriving. */
  domain: string;
  /** Tall capture of the real site: the thing the visitor scrolls through. */
  page: string;
  /** Its pixel height. Declared, not measured — see `screensIn` below. */
  pageHeight: number;
  /** The same, captured at phone width. */
  pageMobile: string;
  pageMobileHeight: number;
  /** Set only when the site is live. */
  href?: string;
};

/** Captured screen size per breakpoint: the width and height each strip was shot at. */
const SHOT = {
  desktop: { width: 1440, screen: 900 },
  mobile: { width: 430, screen: 932 },
};

/**
 * How many whole screens a strip holds — i.e. how many resting points it gives.
 *
 * Declared from the capture's own dimensions rather than measured off the
 * element: the strips are lazy-loaded, so at the moment the timeline is built
 * the image has no height yet, and measuring would collapse every step to zero
 * and leave the site sitting motionless on its first screen.
 */
const screensIn = (stripHeight: number, shotScreen: number) =>
  Math.max(2, Math.floor(stripHeight / shotScreen));

/*
 * The portfolio.
 *
 * Adding a project is one entry here plus its captures in /public. Both strips
 * are stacks of real, settled screenshots of the running site — the showcase
 * steps through them one screen at a time, so a capture with six screens gives
 * six resting points.
 */
const PROJECTS: Project[] = [
  {
    name: "Pristine Finish",
    detail: "Car detailing, Manly",
    scope: "Design · Build · Hosting",
    domain: "pristine finish",
    page: "media/work-pristine-scroll.webp",
    pageHeight: 4960,
    pageMobile: "media/work-pristine-mobile.webp",
    pageMobileHeight: 5600,
    href: "https://northsidewebsites.com/PFCarCleaning.Github.io/",
  },
  {
    name: "MARRAM",
    detail: "Construction / Residential Builder",
    scope: "Example build",
    domain: "marram",
    page: "projects/construction/scroll.webp",
    pageHeight: 5400,
    pageMobile: "projects/construction/scroll-mobile.webp",
    pageMobileHeight: 5342,
  },
  {
    name: "Bower",
    detail: "Hospitality / Restaurant",
    scope: "Example build",
    domain: "bower",
    page: "projects/restaurant/scroll.webp",
    pageHeight: 5400,
    pageMobile: "projects/restaurant/scroll-mobile.webp",
    pageMobileHeight: 5342,
  },
  {
    name: "HEADLAND",
    detail: "Fitness / Performance",
    scope: "Example build",
    domain: "headland",
    page: "projects/gym/scroll.webp",
    pageHeight: 5400,
    pageMobile: "projects/gym/scroll-mobile.webp",
    pageMobileHeight: 5342,
  },
];

/** Timeline units per project. Each project owns exactly this slice. */
const SLICE = 100;
/** Where the arrival ends and the walk through the site begins. */
const ENTER_END = 11;
/** Where the walk ends and the site starts handing over to the next. */
const EXIT_START = 90;

/**
 * How the walk through one site is paced.
 *
 * The ratio is what makes this read as deliberate rather than fast: a screen
 * rests for 2.4 units and takes 1 unit to move on, so roughly seven tenths of
 * the scrolling spent inside a project happens while the page is standing
 * still. Lengthening the track alone would never buy this — it would just pan
 * the same distance more slowly, which still reads as constant movement.
 */
const HOLD = 2.4;
const MOVE = 1;

export function Work() {
  const scope = useGsap(({ self }) => {
    const mm = gsap.matchMedia();

    const build = (opts: { mobile: boolean }) => () => {
      const track = self.querySelector<HTMLElement>("[data-track]");
      const stages = gsap.utils.toArray<HTMLElement>("[data-stage]", self);
      if (!track || !stages.length) return;

      gsap.set(stages, { opacity: 0 });

      const master = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: track,
          // a little before the track locks, so the first project is already
          // arriving as its screen rises rather than appearing on empty ink
          start: "top 75%",
          end: "bottom bottom",
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });

      stages.forEach((stage, index) => {
        const base = index * SLICE;
        const shot = stage.querySelector<HTMLElement>("[data-shot]");
        const chrome = stage.querySelector<HTMLElement>("[data-chrome]");
        const label = stage.querySelector<HTMLElement>("[data-label]");
        const bar = stage.querySelector<HTMLElement>("[data-bar]");
        if (!shot) return;

        /*
         * Everything is derived from the strip's declared size and the stage's
         * current width — never from the image's own box, which is zero until
         * the lazy-loaded capture arrives. One step is exactly one captured
         * screen, so every rest lands on a real screen of the real site rather
         * than halfway between two.
         */
        const project = PROJECTS[index];
        const spec = opts.mobile ? SHOT.mobile : SHOT.desktop;
        const stripHeight = opts.mobile ? project.pageMobileHeight : project.pageHeight;

        const screenHeight = () => (shot.offsetWidth * spec.screen) / spec.width;
        const stripDisplayed = () => (shot.offsetWidth * stripHeight) / spec.width;
        const maxTravel = () => Math.max(0, stripDisplayed() - stage.offsetHeight);
        const restAt = (n: number) => -Math.min(n * screenHeight(), maxTravel());

        const steps = screensIn(stripHeight, spec.screen);
        const span = steps * HOLD + (steps - 1) * MOVE;
        const unit = (EXIT_START - ENTER_END) / span;

        stage.style.zIndex = String(index);

        /* ---- arrive ------------------------------------------------------
         * The site comes in framed and inset, then the frame gives way: the
         * corners square off, the chrome bar collapses and it fills the
         * screen. Same gesture the showcase higher up the page uses, so
         * arriving at a project always means the same thing.
         */
        master
          .fromTo(
            stage,
            { opacity: 0, scale: 0.84, borderRadius: 20 },
            { opacity: 1, scale: 1, borderRadius: 0, duration: ENTER_END, ease: "power2.out" },
            base
          )
          .fromTo(
            chrome,
            { opacity: 1, height: 34 },
            { opacity: 0, height: 0, duration: ENTER_END * 0.7, ease: "power2.in" },
            base + ENTER_END * 0.3
          )
          .fromTo(
            label,
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 7, ease: EASE.out },
            base + ENTER_END * 0.55
          );

        /* ---- walk through it --------------------------------------------- */
        let at = base + ENTER_END;
        for (let step = 0; step < steps - 1; step++) {
          at += HOLD * unit; // the rest — deliberately nothing scheduled here
          master.to(
            shot,
            {
              y: () => restAt(step + 1),
              duration: MOVE * unit,
              ease: "power2.inOut",
            },
            at
          );
          at += MOVE * unit;
        }

        // A drift slow enough that it never competes with the rest, but stops
        // a held screen from reading as a still image.
        master.fromTo(
          shot,
          { scale: 1 },
          { scale: 1.045, duration: EXIT_START - ENTER_END },
          base + ENTER_END
        );

        if (bar) {
          master.fromTo(
            bar,
            { scaleX: 0 },
            { scaleX: 1, duration: EXIT_START - ENTER_END },
            base + ENTER_END
          );
        }

        /* ---- hand over ---------------------------------------------------
         * The outgoing project recedes rather than sliding away, and the next
         * one is already arriving underneath it — so two sites are never seen
         * side by side, only through each other.
         */
        master
          .to(stage, { opacity: 0, scale: 0.94, duration: SLICE - EXIT_START }, base + EXIT_START)
          .to(label, { opacity: 0, y: -18, duration: 7 }, base + EXIT_START);
      });

      return () => {
        master.scrollTrigger?.kill();
        master.kill();
      };
    };

    mm.add(MQ.desktop, build({ mobile: false }));
    mm.add(MQ.belowDesktop, build({ mobile: true }));

    return () => mm.revert();
  }, []);

  return (
    <section id="work" ref={scope} className="relative bg-ink pt-[var(--section-y)]">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="eyebrow text-sky/80">Selected work</p>
            <MaskLines
              lines={["Sites we've built", "around the beaches."]}
              className="display mt-6 text-[length:var(--step-h2)] text-white"
            />
          </div>
          <p className="max-w-[34ch] text-white/55">
            Every one designed from a blank page, built by hand and looked after long after it
            goes live. Keep scrolling — you are about to walk through them.
          </p>
        </div>
      </div>

      {/*
        The track is the scroll budget for all four projects; the sticky child
        is the screen they take over. 600svh each: about a tenth of that is
        arriving, a tenth is handing over, and the rest is spent inside the site
        — most of it standing still on one screen.

        motion-safe on the sizing, because a `lg:` rule is emitted after a
        `motion-reduce:` one and would otherwise win on a wide screen.
      */}
      <div
        data-track
        className="relative mt-[clamp(3.5rem,7vw,6rem)] motion-safe:h-[2400svh] md:motion-safe:h-[2800svh] lg:motion-safe:h-[3200svh]"
      >
        <div className="motion-safe:sticky motion-safe:top-0 motion-safe:h-[100svh] motion-safe:overflow-hidden">
          {PROJECTS.map((project, index) => (
            <Stage key={project.name} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Stage({ project, index }: { project: Project; index: number }) {
  const live = Boolean(project.href);

  return (
    <div
      data-stage
      className={cn(
        "overflow-hidden bg-ink-2",
        // full-bleed and stacked while the showcase runs; an ordinary block in
        // the flow when motion is off
        "motion-safe:absolute motion-safe:inset-0 motion-safe:will-change-transform",
        "motion-reduce:relative motion-reduce:mt-16 motion-reduce:rounded-xl"
      )}
    >
      {/* the frame it arrives in, which dissolves as it fills the screen */}
      <div
        data-chrome
        className="flex shrink-0 items-center gap-2 overflow-hidden border-b border-white/8 bg-white/[0.04] px-4"
        style={{ height: 34 }}
      >
        <span className="h-2 w-2 rounded-full bg-white/25" aria-hidden="true" />
        <span className="h-2 w-2 rounded-full bg-white/25" aria-hidden="true" />
        <span className="h-2 w-2 rounded-full bg-white/25" aria-hidden="true" />
        <span className="mx-auto max-w-[60%] truncate rounded-full bg-white/[0.06] px-4 py-1 text-[10px] font-medium tracking-[0.06em] text-white/45">
          {project.domain}
        </span>
      </div>

      <div className="relative h-full w-full overflow-hidden motion-reduce:aspect-[16/9] motion-reduce:h-auto">
        {/* Only the matching capture is fetched. Lazy, because the visitor is
            several screens away when this markup first exists. */}
        <picture>
          <source media="(min-width: 1024px)" srcSet={asset(project.page)} />
          <img
            data-shot
            src={asset(project.pageMobile)}
            alt={`The ${project.name} website`}
            loading="lazy"
            decoding="async"
            className="absolute inset-x-0 top-0 w-full origin-top will-change-transform"
          />
        </picture>
      </div>

      {/* the only interface over the imagery */}
      <div
        data-label
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-[linear-gradient(to_top,rgba(5,11,20,0.92),rgba(5,11,20,0.55)_45%,transparent)] pt-28 motion-reduce:static motion-reduce:bg-none motion-reduce:pt-6"
      >
        <div className="shell flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pb-[clamp(1.75rem,4vh,3rem)]">
          <div className="min-w-0">
            <span className="text-[0.7rem] tracking-[0.2em] text-white/45">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="display mt-2 text-[clamp(1.9rem,3.6vw,3.2rem)] text-white">
              {project.name}
            </h3>
            <p className="mt-2 text-[0.95rem] text-white/60">{project.detail}</p>
          </div>

          <div className="flex items-center gap-6">
            <p className="text-[0.7rem] tracking-[0.18em] text-white/45 uppercase">
              {project.scope}
            </p>
            {live && (
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[0.78rem] font-semibold text-white transition-colors duration-500 hover:border-white/60 hover:bg-white/5"
              >
                Open live site
                <svg
                  viewBox="0 0 24 24"
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* how far through this project the visitor is */}
        <div className="shell pb-6 motion-reduce:hidden">
          <span className="block h-px w-full bg-white/12">
            <span data-bar className="block h-full w-full origin-left scale-x-0 bg-sky/80" />
          </span>
        </div>
      </div>
    </div>
  );
}
