import { EASE, MQ, gsap, useGsap } from "@/lib/motion";
import { asset } from "@/lib/utils";
import { MaskLines } from "./ui/MaskLines";

const POINTS = [
  {
    title: "A Northern Beaches business",
    body: "We are up the road, not offshore. Meetings happen over a coffee and the person who built your site answers the phone.",
  },
  {
    title: "Custom design, every time",
    body: "Designed around your business and your photos. Nothing is picked out of a template gallery.",
  },
  {
    title: "Built for the phone first",
    body: "Most enquiries arrive on a phone, often one-handed in a driveway. That is the screen we design for first.",
  },
  {
    title: "Fast, because slow loses work",
    body: "Light pages, optimised images and no bloated plugins, so the site is up before anyone gives up on it.",
  },
  {
    title: "Managed hosting",
    body: "Australian servers, certificates, backups and monitoring. You never touch a control panel.",
  },
  {
    title: "Ongoing support",
    body: "New prices, new photos, a new service. Send it through and it gets done — no ticket queue.",
  },
  {
    title: "Designed to turn visitors into enquiries",
    body: "Every screen has one obvious next step: call, book or message. That is what the design is for.",
  },
];

/**
 * The argument, laid out as a spec sheet.
 *
 * The movement here is deliberately different from every other section: rules
 * draw themselves left to right and the text settles under them, like a page
 * being set rather than content flying in.
 */
export function Advantages() {
  const scope = useGsap(({ self }) => {
    const mm = gsap.matchMedia();

    mm.add(MQ.motion, () => {
      const rows = gsap.utils.toArray<HTMLElement>(self.querySelectorAll("[data-point]"));

      rows.forEach((row, i) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: row, start: "top 88%", once: true },
        });
        tl.fromTo(
          row.querySelector("[data-rule]"),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, ease: EASE.inOut }
        ).fromTo(
          row.querySelectorAll("[data-point-copy]"),
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.8, ease: EASE.out, stagger: 0.06 },
          0.18
        );
        // the first rows are already close to the fold on a tall screen; a
        // small offset stops them landing as one block
        tl.delay(Math.min(i, 2) * 0.04);
      });
    });

    mm.add(MQ.desktop, () => {
      gsap.fromTo(
        self.querySelector("[data-aside-media]"),
        { yPercent: -6, scale: 1.1 },
        {
          yPercent: 6,
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: self, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      id="why"
      ref={scope}
      className="relative z-10 -mt-[clamp(1.5rem,4vw,3.5rem)] rounded-t-[clamp(1.5rem,3vw,2.5rem)] bg-paper py-[var(--section-y)] text-ink-2"
    >
      <div className="shell grid gap-x-[clamp(2rem,6vw,6rem)] gap-y-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[18vh]">
            <p className="eyebrow text-blue">Why Northside Web</p>
            <MaskLines
              lines={["The short", "version."]}
              className="display mt-6 text-[length:var(--step-h2)] text-ink-2"
            />
            <p className="mt-8 max-w-[36ch] text-[length:var(--step-lead)] leading-[1.6] text-ink-2/65">
              No account managers, no offshore build team, no template licence renewing quietly in
              the background.
            </p>

            <div className="mt-12 hidden overflow-hidden rounded-lg lg:block">
              <img
                data-aside-media
                src={asset("photo-house-1200.webp")}
                alt="A home on the Northern Beaches coastline"
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover will-change-transform"
              />
            </div>
          </div>
        </div>

        <ul className="lg:col-span-7">
          {POINTS.map((point, i) => (
            <li key={point.title} data-point className="relative pt-6 pb-8">
              <span
                data-rule
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px origin-left bg-ink-2/15"
              />
              <div className="flex gap-6">
                <span
                  data-point-copy
                  className="w-8 shrink-0 pt-1.5 text-[0.7rem] font-semibold tracking-[0.2em] text-blue"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 data-point-copy className="text-[length:var(--step-h3)] font-semibold tracking-[-0.015em]">
                    {point.title}
                  </h3>
                  <p data-point-copy className="mt-3 max-w-[52ch] text-ink-2/65">
                    {point.body}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
