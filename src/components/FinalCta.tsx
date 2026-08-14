import { EASE, MQ, gsap, useGsap } from "@/lib/motion";
import { EMAIL, MAILTO, asset } from "@/lib/utils";
import { Button } from "./ui/Button";

/**
 * The closing frame, and the footer with it.
 *
 * This layer is fixed behind the page. The page itself is opaque and carries a
 * viewport of bottom margin, so the last stretch of scrolling lifts the whole
 * site off the top of this one like a curtain. No JS drives the reveal — it is
 * two rules and a spacer, which is why it stays smooth on a phone.
 */
export function FinalCta() {
  const scope = useGsap(({ self }) => {
    const mm = gsap.matchMedia();

    mm.add(MQ.motion, () => {
      // the type resolves as the curtain clears, keyed off the page's own end
      gsap.fromTo(
        self.querySelectorAll("[data-cta-line] > span"),
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 1.4,
          ease: EASE.out,
          stagger: 0.09,
          scrollTrigger: {
            trigger: document.body,
            start: "bottom bottom-=45%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        self.querySelectorAll("[data-cta-fade]"),
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: EASE.out,
          stagger: 0.08,
          scrollTrigger: { trigger: document.body, start: "bottom bottom-=35%", once: true },
        }
      );

      // the photograph drifts up behind the reveal, so the two planes separate
      gsap.fromTo(
        self.querySelector("[data-cta-media]"),
        { yPercent: 8, scale: 1.14 },
        {
          yPercent: 0,
          scale: 1.04,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "bottom bottom-=100%",
            end: "bottom bottom",
            scrub: 0.6,
          },
        }
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={scope}
      className="fixed inset-x-0 bottom-0 z-0 flex h-[100svh] flex-col justify-between overflow-hidden bg-ink"
    >
      <div data-cta-media className="absolute inset-0 will-change-transform">
        <img
          src={asset("photo-shore.webp")}
          srcSet={`${asset("photo-shore-1200.webp")} 1200w, ${asset("photo-shore.webp")} 1600w`}
          sizes="100vw"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,11,20,0.82)_0%,rgba(5,11,20,0.62)_45%,rgba(5,11,20,0.94)_100%)]"
      />

      <div className="relative flex flex-1 items-center">
        <div className="shell w-full">
          <p data-cta-fade className="eyebrow text-sky/85">
            Let&rsquo;s start
          </p>

          <h2 className="display mt-8 max-w-[18ch] text-[length:var(--step-display)] text-white">
            <span data-cta-line className="line-mask">
              <span className="block">Your next customer</span>
            </span>
            <span data-cta-line className="line-mask">
              <span className="block">is already looking.</span>
            </span>
          </h2>

          <p
            data-cta-fade
            className="mt-9 max-w-[40ch] text-[length:var(--step-lead)] leading-[1.55] text-white/75"
          >
            Let&rsquo;s make sure they find something worth clicking.
          </p>

          <div data-cta-fade className="mt-11 flex flex-wrap items-center gap-5">
            <Button href={MAILTO}>Start your website</Button>
            <a
              href={`mailto:${EMAIL}`}
              className="text-[0.9rem] text-white/60 underline-offset-4 transition-colors duration-400 hover:text-white hover:underline"
            >
              {EMAIL}
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-white/10">
      <div className="shell flex flex-wrap items-center justify-between gap-6 py-8">
        <img
          src={asset("logo-full-white.png")}
          alt="Northside Web"
          width={440}
          height={240}
          loading="lazy"
          className="h-9 w-auto opacity-80"
        />

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-6 text-[0.8rem] text-white/50">
          <a href="#work" className="transition-colors duration-400 hover:text-white">
            Work
          </a>
          <a href="#services" className="transition-colors duration-400 hover:text-white">
            Services
          </a>
          <a href="#process" className="transition-colors duration-400 hover:text-white">
            Process
          </a>
          <a href={MAILTO} className="transition-colors duration-400 hover:text-white">
            Contact
          </a>
        </nav>

        <p className="text-[0.72rem] tracking-[0.16em] text-white/35 uppercase">
          Northern Beaches, Sydney
        </p>
      </div>
    </footer>
  );
}
