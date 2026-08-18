import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EASE, MQ, gsap, useGsap } from "@/lib/motion";
import { asset, cn } from "@/lib/utils";
import { MaskLines } from "./ui/MaskLines";

type Example = {
  name: string;
  sector: string;
  blurb: string;
  /** What the address bar reads. */
  domain: string;
  /** The site that is actually loaded into the frame. */
  url: string;
  /** True for a published client site; false for a studio example build. */
  live: boolean;
};

/*
 * The examples.
 *
 * Each of these is the real website, loaded into the frame and left alone —
 * its own scrolling, its own navigation, its own hover states, its own
 * full-resolution photography. Nothing here is a screenshot or a recreation.
 *
 * Each site is a static export of the real project, committed under
 * public/examples/<slug>/ and served from this same origin. That means the
 * previews work from a clone, on GitHub Pages, and offline — no dev servers,
 * no cross-origin embedding, and no mixed content when the page is on HTTPS.
 *
 * To refresh one, rebuild that project as a static export under the matching
 * basePath and replace the folder. See README, "Refreshing an example".
 */
const EXAMPLES: Example[] = [
  {
    name: "Pristine Finish",
    sector: "Automotive / Car detailing",
    blurb: "A real client site — services, pricing and booking, built to be used one-handed in a driveway.",
    domain: "pristine finish",
    /*
     * Bundled like the others. Its published home, northsidewebsites.com, was
     * returning a GitHub Pages 404 when this was wired up; once that is serving
     * again, `live: true` restores the "Visit the live site" link.
     */
    url: asset("examples/pristine/"),
    live: false,
  },
  {
    name: "MARRAM",
    sector: "Construction / Residential builder",
    blurb: "Project-led, photography-first, with the works archive doing the selling.",
    domain: "marram",
    url: asset("examples/construction/"),
    live: false,
  },
  {
    name: "Bower",
    sector: "Hospitality / Restaurant",
    blurb: "Menus, the room and reservations for a coastal dining room.",
    domain: "bower",
    url: asset("examples/restaurant/"),
    live: false,
  },
  {
    name: "HEADLAND",
    sector: "Fitness / Performance",
    blurb: "Programmes, memberships and the floor itself for a performance studio.",
    domain: "headland",
    url: asset("examples/gym/"),
    live: false,
  },
];

/**
 * Mounts the frame's contents only once it is nearly on screen.
 *
 * Four websites is four full applications; booting them all at page load costs
 * far more than the section is worth, and would stutter the scrolling on
 * everything above it. `rootMargin` gives each one a screen and a half of
 * warning, which is enough to have painted by the time it is looked at.
 */
function useNearViewport<T extends HTMLElement>(rootMargin = "150% 0px") {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, rootMargin]);

  return [ref, near] as const;
}

export function Work() {
  const [expanded, setExpanded] = useState<Example | null>(null);

  const scope = useGsap(({ self }) => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      // the frame is uncovered rather than faded in — the same curtain the rest
      // of the site uses, and it leaves the layout untouched while it runs
      gsap.utils.toArray<HTMLElement>("[data-frame]", self).forEach((frame) => {
        gsap.fromTo(
          frame,
          { clipPath: "inset(10% 4% 0% 4% round 18px)", y: 40 },
          {
            clipPath: "inset(0% 0% 0% 0% round 18px)",
            y: 0,
            duration: 1.4,
            ease: EASE.out,
            scrollTrigger: { trigger: frame, start: "top 88%", once: true },
          }
        );
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="work" ref={scope} className="relative bg-ink py-[var(--section-y)]">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="eyebrow text-sky/80">Examples</p>
            <MaskLines
              lines={["Explore our work."]}
              className="display mt-6 text-[length:var(--step-h2)] text-white"
            />
          </div>
          <p className="max-w-[34ch] text-white/55">
            These are the real websites, not pictures of them. Scroll inside any frame and have a
            look around.
          </p>
        </div>

        <div className="mt-[clamp(3.5rem,8vw,7rem)] flex flex-col gap-[clamp(4.5rem,9vw,8rem)]">
          {EXAMPLES.map((example) => (
            <ExampleCard key={example.name} example={example} onExpand={setExpanded} />
          ))}
        </div>
      </div>

      {expanded && <Lightbox example={expanded} onClose={() => setExpanded(null)} />}
    </section>
  );
}

function ExampleCard({
  example,
  onExpand,
}: {
  example: Example;
  onExpand: (example: Example) => void;
}) {
  const [ref, near] = useNearViewport<HTMLDivElement>();
  const [loaded, setLoaded] = useState(false);
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<"checking" | "up" | "down">("checking");

  /*
   * Is the site actually being served?
   *
   * The exports are committed, so this should always succeed — but if a folder
   * ever goes missing from a build, the frame would render Chrome's broken-page
   * icon, which reads as the portfolio being broken. The probe cannot see the
   * response body, only whether the request resolved, which is all that matters.
   */
  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    fetch(example.url, { mode: "no-cors", cache: "no-store" })
      .then(() => !cancelled && setStatus("up"))
      .catch(() => !cancelled && setStatus("down"));
    return () => {
      cancelled = true;
    };
  }, [near, example.url]);

  return (
    <article ref={ref} className="group">
      <BrowserWindow
        example={example}
        onExpand={() => onExpand(example)}
        className="transition-[transform,box-shadow] duration-[900ms] ease-[var(--ease-out-expo)] group-hover:-translate-y-1.5 group-hover:shadow-[0_60px_140px_-40px_rgba(46,124,196,0.45)]"
      >
        {near && status === "up" ? (
          <iframe
            src={example.url}
            title={`The ${example.name} website`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            // the site inside owns its own scrolling, links and hover states;
            // nothing is scripted into it from here
            className="h-full w-full border-0 bg-ink-2"
          />
        ) : (
          <div className="h-full w-full bg-ink-2" />
        )}

        {/* while the application inside is booting */}
        {near && status === "up" && !loaded && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink-2">
            <span className="h-8 w-8 animate-spin rounded-full border border-white/15 border-t-white/70" />
          </div>
        )}

        {status === "down" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink-2 px-8 text-center">
            <p className="display text-[clamp(1.3rem,2.2vw,1.9rem)] text-white/85">
              {example.name} is not being served
            </p>
            <p className="max-w-[46ch] text-[0.9rem] leading-relaxed text-white/50">
              This preview loads the real website from this site. The files may be missing
              from the build — rebuild the example export and redeploy.
            </p>
            <code className="rounded-md bg-black/40 px-3.5 py-2 font-mono text-[0.78rem] text-sky/90 ring-1 ring-white/10">
              {example.url}
            </code>
          </div>
        )}

        {/* the hint that this is not a picture; it retires once used */}
        <div
          onPointerDown={() => setTouched(true)}
          onWheel={() => setTouched(true)}
          className={cn(
            // bottom-right, not centred: these sites all lead with a large
            // centred headline, and the hint was landing straight on top of it
            "pointer-events-none absolute right-5 bottom-5 z-10 flex justify-end",
            "transition-opacity duration-700",
            touched || !loaded ? "opacity-0" : "opacity-100"
          )}
        >
          <span className="flex items-center gap-2.5 rounded-full bg-ink/85 px-4 py-2 text-[0.72rem] font-medium tracking-[0.14em] text-white/75 uppercase ring-1 ring-white/15 backdrop-blur-sm">
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 animate-bounce"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 5v14m-6-6 6 6 6-6" />
            </svg>
            Scroll to explore
          </span>
        </div>
      </BrowserWindow>

      <div className="mt-7 flex flex-wrap items-start justify-between gap-x-10 gap-y-4">
        <div className="min-w-0">
          <h3 className="display text-[clamp(1.7rem,3vw,2.6rem)] text-white">{example.name}</h3>
          <p className="mt-2 text-[0.8rem] tracking-[0.16em] text-sky/80 uppercase">
            {example.sector}
          </p>
          <p className="mt-4 max-w-[52ch] leading-relaxed text-white/60">{example.blurb}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onExpand(example)}
            className="inline-flex items-center gap-2.5 rounded-full border border-white/25 px-5 py-2.5 text-[0.8rem] font-semibold text-white transition-colors duration-500 hover:border-white/60 hover:bg-white/5"
          >
            Open full screen
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
              <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
            </svg>
          </button>
          {example.live && (
            <a
              href={example.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[0.8rem] font-semibold text-sky transition-colors duration-500 hover:text-white"
            >
              Visit the live site
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
    </article>
  );
}

/**
 * The frame.
 *
 * Deliberately quiet: a hairline, a shallow chrome bar and a shadow. It has to
 * read as a browser without competing with the website inside it, which is the
 * thing worth looking at.
 */
function BrowserWindow({
  example,
  children,
  className,
  onExpand,
  tall = false,
}: {
  example: Example;
  children: React.ReactNode;
  className?: string;
  onExpand?: () => void;
  tall?: boolean;
}) {
  return (
    <div
      data-frame={onExpand ? "" : undefined}
      className={cn(
        "relative overflow-hidden rounded-[18px] bg-ink-2 ring-1 ring-white/12",
        "shadow-[0_50px_120px_-45px_rgba(0,0,0,0.95)]",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.05] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/85" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/85" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]/85" aria-hidden="true" />

        <span className="mx-auto flex max-w-[60%] min-w-0 items-center gap-2 rounded-md bg-black/30 px-3.5 py-1.5 ring-1 ring-white/8">
          <svg
            viewBox="0 0 24 24"
            className="h-3 w-3 shrink-0 text-white/40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden="true"
          >
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          <span className="truncate text-[11px] font-medium tracking-[0.04em] text-white/55">
            {example.domain}
          </span>
        </span>

        {onExpand && (
          <button
            type="button"
            onClick={onExpand}
            aria-label={`Open ${example.name} full screen`}
            className="shrink-0 rounded-md p-1.5 text-white/40 transition-colors duration-400 hover:bg-white/10 hover:text-white"
          >
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
              <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
            </svg>
          </button>
        )}
      </div>

      {/*
        data-lenis-prevent: Lenis listens for wheel on window and preventDefaults
        it to drive its own smoothing. A wheel over an embedded site must belong
        to that site, not to this page — this tells Lenis to keep its hands off
        anything originating in here, so the preview scrolls rather than the
        page underneath it.
      */}
      <div
        data-lenis-prevent
        className={cn(
          "relative w-full",
          tall ? "h-[calc(100svh-7.5rem)]" : "h-[clamp(26rem,64svh,44rem)]"
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** The same site again, given the whole screen. */
function Lightbox({ example, onClose }: { example: Example; onClose: () => void }) {
  const onKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKey);
    // the page behind must not scroll while the overlay owns the screen
    document.documentElement.classList.add("menu-open", "lenis-stopped");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("menu-open", "lenis-stopped");
    };
  }, [onKey]);

  /*
   * Portalled to <body> on purpose.
   *
   * This section lives inside a `relative z-10` <main>, which is its own
   * stacking context — a z-index set in here can only compete with its
   * siblings, so the fixed header at z-50 was painting straight over the
   * dialog. Out at the body it outranks everything.
   */
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${example.name}, full screen`}
      className="fixed inset-0 z-[120] flex flex-col bg-ink/95 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-6 px-[clamp(1rem,4vw,2.5rem)] py-4">
        <div className="min-w-0">
          <p className="truncate text-[0.95rem] font-semibold text-white">{example.name}</p>
          <p className="truncate text-[0.72rem] tracking-[0.16em] text-white/45 uppercase">
            {example.sector}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/25 px-5 py-2.5 text-[0.8rem] font-semibold text-white transition-colors duration-400 hover:border-white/60 hover:bg-white/10"
        >
          Close
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <div className="min-h-0 flex-1 px-[clamp(0.5rem,3vw,2.5rem)] pb-[clamp(0.75rem,3vh,2rem)]">
        <BrowserWindow example={example} tall className="h-full">
          <iframe
            src={example.url}
            title={`The ${example.name} website, full screen`}
            className="h-full w-full border-0 bg-ink-2"
          />
        </BrowserWindow>
      </div>
    </div>,
    document.body
  );
}
