import { useState } from "react";
import { EASE, MQ, gsap, useGsap } from "@/lib/motion";
import { asset, cn } from "@/lib/utils";
import { BrowserFrame } from "./ui/BrowserFrame";
import { MaskLines } from "./ui/MaskLines";

/*
 * Each service carries the project that best demonstrates it, so the claim and
 * the evidence sit on the same screen. These are the same four builds the
 * portfolio shows further down, using the same captures — nothing here is a
 * mock-up.
 */
const SERVICES = [
  {
    num: "01",
    title: "Website Design",
    body: "Designed from a blank page around your business, your photos and the work you actually want more of.",
    points: ["Custom layout", "Your photography", "Written to be read"],
    media: "projects/restaurant/preview.webp",
    domain: "bower",
    project: "Bower",
    sector: "Hospitality",
  },
  {
    num: "02",
    title: "Website Development",
    body: "Hand-built and fast. Sharp on a phone in a ute, sharp on a laptop, and readable to Google.",
    points: ["Built by hand", "Mobile first", "Accessible markup"],
    media: "projects/gym/preview.webp",
    domain: "headland",
    project: "HEADLAND",
    sector: "Fitness",
  },
  {
    num: "03",
    title: "Managed Hosting",
    body: "Your site lives on Australian servers and stays up. Backups, certificates and monitoring are ours to worry about.",
    points: ["Australian servers", "Daily backups", "Monitored uptime"],
    media: "projects/construction/preview.webp",
    domain: "marram",
    project: "MARRAM",
    sector: "Construction",
  },
  {
    num: "04",
    title: "Ongoing Management",
    body: "New prices, new photos, a new service — send it over and it is done. One flat plan, no surprise invoices.",
    points: ["Content changes", "Software updates", "One flat plan"],
    media: "media/work-pristine.webp",
    domain: "pristine finish",
    project: "Pristine Finish",
    sector: "Automotive",
  },
];

/**
 * Services as an editorial spread rather than four identical cards: the reader
 * moves down the column on the right and the preview on the left changes to
 * match. Below the sticky breakpoint each service simply carries its own
 * preview, because a sticky stage on a phone is just a stuck image.
 */
export function Services() {
  const [active, setActive] = useState(0);

  const scope = useGsap(({ self }) => {
    const mm = gsap.matchMedia();

    mm.add(MQ.desktop, () => {
      self.querySelectorAll<HTMLElement>("[data-service]").forEach((block, i) => {
        gsap.timeline({
          scrollTrigger: {
            trigger: block,
            // a band across the middle: the preview changes when a service
            // genuinely takes over the column, not as it clips the edge
            start: "top 62%",
            end: "bottom 62%",
            onEnter: () => setActive(i),
            onEnterBack: () => setActive(i),
          },
        });
      });
    });

    mm.add(MQ.motion, () => {
      gsap.fromTo(
        self.querySelectorAll("[data-service]"),
        { opacity: 0, y: 42 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: EASE.out,
          stagger: 0.1,
          scrollTrigger: { trigger: self, start: "top 70%", once: true },
        }
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      id="services"
      ref={scope}
      className="relative z-10 -mt-[clamp(1.5rem,4vw,3.5rem)] rounded-t-[clamp(1.5rem,3vw,2.5rem)] bg-paper py-[var(--section-y)] text-ink-2"
    >
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="eyebrow text-blue">What we do</p>
            <MaskLines
              lines={["Four things,", "done properly."]}
              className="display mt-6 text-[length:var(--step-h2)] text-ink-2"
            />
          </div>
          <p className="max-w-[32ch] text-ink-2/60">
            Design, build, host, look after. You only ever deal with the person doing the work.
          </p>
        </div>

        <div className="mt-[clamp(3.5rem,8vw,7rem)] grid gap-x-[clamp(2rem,6vw,6rem)] lg:grid-cols-12">
          {/* the stage — desktop only */}
          <div className="hidden lg:col-span-6 lg:block">
            <div className="sticky top-[22vh]">
              <BrowserFrame url={SERVICES[active].domain} compact className="w-full bg-ink-2">
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  {SERVICES.map((service, i) => (
                    <img
                      key={service.num}
                      src={asset(service.media)}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className={cn(
                        "absolute inset-0 h-full w-full object-cover object-top",
                        "transition-[opacity,transform] duration-[900ms] ease-[var(--ease-out-expo)]",
                        i === active ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"
                      )}
                    />
                  ))}
                </div>
              </BrowserFrame>

              {/* Which build is on the stage. Stacked and crossfaded rather
                  than swapped, so the line changes with the preview above it
                  instead of snapping a beat ahead of it. */}
              <div className="relative mt-5 h-5">
                {SERVICES.map((service, i) => (
                  <p
                    key={service.num}
                    aria-hidden={i !== active}
                    className={cn(
                      "absolute inset-x-0 top-0 flex items-baseline gap-2.5 text-[0.75rem] tracking-[0.14em] uppercase",
                      "transition-[opacity,transform] duration-[700ms] ease-[var(--ease-out-expo)]",
                      i === active ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
                    )}
                  >
                    <span className="font-semibold text-ink-2/75">{service.project}</span>
                    <span className="text-ink-2/40">{service.sector}</span>
                  </p>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-4">
                {SERVICES.map((service, i) => (
                  <span
                    key={service.num}
                    className="relative h-px flex-1 overflow-hidden bg-ink-2/15"
                    aria-hidden="true"
                  >
                    <span
                      className={cn(
                        "absolute inset-0 origin-left bg-blue transition-transform duration-[900ms] ease-[var(--ease-out-expo)]",
                        i <= active ? "scale-x-100" : "scale-x-0"
                      )}
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* the column */}
          <div className="lg:col-span-6">
            {SERVICES.map((service, i) => (
              <article
                key={service.num}
                data-service
                className="border-t border-ink-2/12 py-[clamp(2.5rem,6vw,4.5rem)] first:border-t-0 first:pt-0 lg:min-h-[52vh] lg:py-[clamp(3rem,7vh,5rem)]"
              >
                <div className="flex items-baseline gap-5">
                  <span
                    className={cn(
                      "text-[0.72rem] font-semibold tracking-[0.22em] transition-colors duration-500",
                      i === active ? "text-blue" : "text-ink-2/35"
                    )}
                  >
                    {service.num}
                  </span>
                  <h3 className="display text-[clamp(1.9rem,3.4vw,3rem)] text-ink-2">
                    {service.title}
                  </h3>
                </div>

                <p className="mt-6 max-w-[42ch] text-[length:var(--step-lead)] leading-[1.6] text-ink-2/70">
                  {service.body}
                </p>

                <ul className="mt-8 flex flex-wrap gap-x-3 gap-y-2">
                  {service.points.map((point) => (
                    <li
                      key={point}
                      className="rounded-full border border-ink-2/15 px-4 py-1.5 text-[0.78rem] font-medium text-ink-2/70"
                    >
                      {point}
                    </li>
                  ))}
                </ul>

                {/* the preview travels with its own service on smaller screens */}
                <div className="mt-9 lg:hidden">
                  <p className="mb-3 flex items-baseline gap-2.5 text-[0.75rem] tracking-[0.14em] uppercase">
                    <span className="font-semibold text-ink-2/75">{service.project}</span>
                    <span className="text-ink-2/40">{service.sector}</span>
                  </p>
                  <BrowserFrame url={service.domain} compact className="w-full bg-ink-2">
                    <div className="aspect-[16/9] w-full overflow-hidden">
                      <img
                        src={asset(service.media)}
                        alt={`The ${service.project} website`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                  </BrowserFrame>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
