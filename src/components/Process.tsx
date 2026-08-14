import { useState } from "react";
import { MQ, gsap, useGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { MaskLines } from "./ui/MaskLines";

const STEPS = [
  {
    num: "01",
    title: "Discover",
    body: "A coffee or a call. What the business does, who you want ringing you, and what the site has to achieve. You get a fixed price before anything starts.",
  },
  {
    num: "02",
    title: "Design",
    body: "You see the design before a line of code exists. We work through it together until it looks like your business rather than a template.",
  },
  {
    num: "03",
    title: "Build",
    body: "Built by hand, fast and accessible, with your words and photography in place. You watch it come together on a live link the whole way.",
  },
  {
    num: "04",
    title: "Launch",
    body: "Domain, certificates, hosting and search listings sorted. The site goes live properly, not half-configured.",
  },
  {
    num: "05",
    title: "Manage",
    body: "Launch is the start. Hosting, updates, backups and changes are handled from then on, for one flat monthly plan.",
  },
];

/**
 * Process as a scroll progression.
 *
 * The numeral on the left is the only element that moves: it swaps as each step
 * takes over, on a mask, while a rail fills alongside it. Nothing fades in —
 * this section is about progression, so progression is the only motion in it.
 */
export function Process() {
  const [active, setActive] = useState(0);

  const scope = useGsap(({ self }) => {
    const mm = gsap.matchMedia();

    mm.add(MQ.motion, () => {
      self.querySelectorAll<HTMLElement>("[data-step]").forEach((step, i) => {
        ScrollTriggerFor(step, () => setActive(i));
      });

      gsap.fromTo(
        self.querySelector("[data-rail-fill]"),
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: self.querySelector("[data-steps]"),
            start: "top 62%",
            end: "bottom 78%",
            scrub: 0.4,
          },
        }
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      id="process"
      ref={scope}
      className="relative z-10 -mt-[clamp(1.5rem,4vw,3.5rem)] rounded-t-[clamp(1.5rem,3vw,2.5rem)] bg-ink py-[var(--section-y)]"
    >
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="eyebrow text-sky/80">How it runs</p>
            <MaskLines
              lines={["Five stages.", "No surprises."]}
              className="display mt-6 text-[length:var(--step-h2)] text-white"
            />
          </div>
          <p className="max-w-[30ch] text-white/55">
            You always know what is happening, what it costs and what happens next.
          </p>
        </div>

        <div className="mt-[clamp(3.5rem,8vw,7rem)] grid gap-x-[clamp(2rem,6vw,6rem)] lg:grid-cols-12">
          {/* the numeral */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-[30vh]">
              <div className="relative h-[clamp(6rem,11vw,9.5rem)] overflow-hidden">
                {STEPS.map((step, i) => (
                  <span
                    key={step.num}
                    aria-hidden="true"
                    className={cn(
                      "display absolute inset-0 text-[clamp(6rem,12vw,11rem)] leading-none text-white",
                      "transition-[transform,opacity] duration-[900ms] ease-[var(--ease-out-expo)]",
                      i === active
                        ? "translate-y-0 opacity-100"
                        : i < active
                          ? "-translate-y-full opacity-0"
                          : "translate-y-full opacity-0"
                    )}
                  >
                    {step.num}
                  </span>
                ))}
              </div>

              <p
                className="mt-6 text-[0.78rem] tracking-[0.2em] text-sky uppercase"
                aria-hidden="true"
              >
                {STEPS[active].title}
              </p>

              <div className="mt-8 h-28 w-px bg-white/12">
                <span
                  data-rail-fill
                  aria-hidden="true"
                  className="block h-full w-full origin-top scale-y-0 bg-sky"
                />
              </div>
            </div>
          </div>

          {/* the steps */}
          <ol data-steps className="lg:col-span-7">
            {STEPS.map((step, i) => (
              <li
                key={step.num}
                data-step
                className="border-t border-white/10 py-[clamp(2rem,5vw,3.5rem)] last:border-b lg:min-h-[36vh] lg:py-[clamp(2.5rem,5vh,4rem)]"
              >
                <div className="flex items-baseline gap-5">
                  <span
                    className={cn(
                      "text-[0.72rem] font-semibold tracking-[0.22em] transition-colors duration-500 lg:hidden",
                      i === active ? "text-sky" : "text-white/35"
                    )}
                  >
                    {step.num}
                  </span>
                  <h3
                    className={cn(
                      "display text-[clamp(1.8rem,3.2vw,2.9rem)] transition-colors duration-[700ms]",
                      i === active ? "text-white" : "text-white/45"
                    )}
                  >
                    {step.title}
                  </h3>
                </div>
                <p className="mt-5 max-w-[48ch] leading-[1.65] text-white/60">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** A ScrollTrigger that only reports which step owns the middle of the screen. */
function ScrollTriggerFor(el: HTMLElement, onActive: () => void) {
  gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: "top 58%",
      end: "bottom 58%",
      onEnter: onActive,
      onEnterBack: onActive,
    },
  });
}
