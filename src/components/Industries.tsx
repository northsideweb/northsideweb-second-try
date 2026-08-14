import { EASE, MQ, gsap, useGsap } from "@/lib/motion";
import { MaskLines } from "./ui/MaskLines";

const INDUSTRIES = [
  { label: "Trades", note: "Electrical, plumbing, carpentry" },
  { label: "Builders", note: "New builds and renovations" },
  { label: "Cleaning", note: "Domestic and commercial" },
  { label: "Automotive", note: "Detailing, mechanical, mobile" },
  { label: "Hospitality", note: "Cafés, restaurants, bars" },
  { label: "Fitness", note: "Studios, gyms, coaching" },
  { label: "Professional Services", note: "Advisors, agents, practices" },
  { label: "Local Businesses", note: "Anyone with a shopfront or a ute" },
];

/**
 * Who we build for.
 *
 * The names are the subject here, so nothing else competes with them. Hovering
 * a row settles the rest of the list back, wipes a low wash in from the left,
 * draws the hairline and brings an arrow in beside the note — four small things
 * on the same easing, rather than one loud one. Touch screens get the same
 * content as a pair of counter-running marquees, since there is no hover there
 * to reward.
 */
export function Industries() {
  const scope = useGsap(({ self }) => {
    const mm = gsap.matchMedia();

    mm.add(MQ.motion, () => {
      gsap.fromTo(
        self.querySelectorAll("[data-row]"),
        { opacity: 0, x: -28 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: EASE.out,
          stagger: 0.055,
          scrollTrigger: { trigger: self, start: "top 72%", once: true },
        }
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      id="industries"
      ref={scope}
      className="relative z-10 -mt-[clamp(1.5rem,4vw,3.5rem)] overflow-hidden rounded-t-[clamp(1.5rem,3vw,2.5rem)] bg-ink py-[var(--section-y)]"
    >
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="eyebrow text-sky/80">Who we build for</p>
            <MaskLines
              lines={["Local businesses,", "mostly."]}
              className="display mt-6 text-[length:var(--step-h2)] text-white"
            />
          </div>
          <p className="max-w-[32ch] text-white/55">
            The businesses people find on their phone, ring once, and book. That is the kind of
            site we build.
          </p>
        </div>

        {/* desktop: the list is the interaction */}
        <ul className="industry-list mt-[clamp(3rem,7vw,6rem)] hidden lg:block">
          {INDUSTRIES.map((item) => (
            <li
              key={item.label}
              data-row
              className="industry-row group relative border-t border-white/10 last:border-b"
            >
              {/* the hairline draws across as the row takes over */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-sky transition-transform duration-[800ms] ease-[var(--ease-out-expo)] group-hover:scale-x-100"
              />
              {/* and a wash follows it in, fading out well before the note so it
                  reads as light falling on the row rather than as a filled bar */}
              <span
                aria-hidden="true"
                className="absolute inset-0 origin-left scale-x-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05),transparent_65%)] transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-x-100"
              />

              <div className="industry-row-content relative flex items-baseline justify-between gap-8 py-7">
                <span className="display text-[clamp(1.9rem,4vw,3.4rem)] text-white/80 transition-[color,transform] duration-[700ms] ease-[var(--ease-out-expo)] group-hover:translate-x-4 group-hover:text-white">
                  {item.label}
                </span>

                <span className="flex shrink-0 items-center gap-4">
                  <span className="text-[0.78rem] tracking-[0.14em] text-white/35 uppercase transition-colors duration-500 group-hover:text-white/70">
                    {item.note}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5 -translate-x-3 text-sky opacity-0 transition-[opacity,transform] duration-[700ms] ease-[var(--ease-out-expo)] group-hover:translate-x-0 group-hover:opacity-100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h13m-5-6 6 6-6 6" />
                  </svg>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* below desktop: the same set, moving */}
      <div className="mt-[clamp(2.5rem,7vw,4rem)] lg:hidden">
        <Marquee items={INDUSTRIES.map((i) => i.label)} />
        <Marquee items={[...INDUSTRIES].reverse().map((i) => i.note)} reverse muted />
      </div>
    </section>
  );
}

/**
 * A CSS-only ticker. Two identical tracks, the second sitting exactly one track
 * width along, so the loop point is invisible. Animation, not JS, so it costs
 * nothing on the main thread and stops dead under reduced motion.
 */
function Marquee({
  items,
  reverse = false,
  muted = false,
}: {
  items: string[];
  reverse?: boolean;
  muted?: boolean;
}) {
  const track = (
    <ul className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={undefined}>
      {items.map((item) => (
        <li key={item} className="flex shrink-0 items-center gap-10">
          <span
            className={
              muted
                ? "text-[0.8rem] tracking-[0.16em] text-white/35 uppercase"
                : "display text-[clamp(2rem,9vw,3.4rem)] whitespace-nowrap text-white/85"
            }
          >
            {item}
          </span>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky/60" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="relative flex overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div
        className="flex min-w-full shrink-0 animate-[marquee_38s_linear_infinite] motion-reduce:animate-none"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {track}
        {/* the duplicate is decorative: screen readers read the first copy only */}
        <div aria-hidden="true" className="flex">
          {track}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>
    </div>
  );
}
