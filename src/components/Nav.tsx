import { useEffect, useRef, useState } from "react";
import { EASE, MQ, gsap, useGsap } from "@/lib/motion";
import { MAILTO, asset, cn } from "@/lib/utils";
import { Magnetic } from "./ui/Magnetic";

const LINKS = [
  { id: "work", label: "Work" },
  { id: "services", label: "Services" },
  { id: "industries", label: "Who we build for" },
  { id: "process", label: "Process" },
];

/** Highlights whichever section owns the middle band of the viewport. */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-48% 0px -48% 0px", threshold: 0 }
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return active;
}

export function Nav({ ready }: { ready: boolean }) {
  const active = useActiveSection();
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Compaction is driven off the hero's height rather than a fixed 40px, so the
  // bar changes character exactly when the visitor leaves the opening frame.
  const scope = useGsap(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const bar = barRef.current;
      // queried off the document, not as a selector string: gsap.context scopes
      // selector strings to this component, and the hero lives outside it
      const hero = document.getElementById("top");
      if (!bar || !hero) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "bottom 92%",
          end: "bottom 55%",
          scrub: 0.6,
        },
      });
      tl.to(bar, {
        backgroundColor: "rgba(5,11,20,0.86)",
        borderBottomColor: "rgba(255,255,255,0.09)",
        paddingTop: 12,
        paddingBottom: 12,
        ease: "none",
      }).to("[data-nav-logo]", { scale: 0.88, ease: "none" }, 0);
    });
    return () => mm.revert();
  }, []);

  // entrance: the bar arrives just after the intro panel clears
  useEffect(() => {
    if (!ready) return;
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.fromTo(
        "[data-nav-in]",
        { y: -18, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: EASE.out, stagger: 0.06, delay: 0.35 }
      );
    });
    return () => mm.revert();
  }, [ready]);

  // the overlay owns the scroll while it is open
  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    document.documentElement.classList.toggle("lenis-stopped", open);
    return () => {
      document.documentElement.classList.remove("menu-open");
      document.documentElement.classList.remove("lenis-stopped");
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={scope}>
      <header className="fixed inset-x-0 top-0 z-50">
        <div
          ref={barRef}
          className="border-b border-transparent transition-colors duration-300"
          style={{ paddingTop: 22, paddingBottom: 22 }}
        >
          <div className="shell flex items-center justify-between gap-8">
            <a
              data-nav-in
              href="#top"
              aria-label="Northside Web, home"
              className="shrink-0"
              onClick={() => setOpen(false)}
            >
              <img
                data-nav-logo
                src={asset("logo-full-white.png")}
                alt="Northside Web"
                width={440}
                height={240}
                className="h-9 w-auto origin-left md:h-11"
              />
            </a>

            <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
              {LINKS.map((link) => (
                <a
                  key={link.id}
                  data-nav-in
                  href={`#${link.id}`}
                  aria-current={active === link.id ? "true" : undefined}
                  className={cn(
                    "group relative py-1 text-[0.82rem] font-medium tracking-[0.01em] transition-colors duration-400",
                    active === link.id ? "text-white" : "text-white/55 hover:text-white"
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -bottom-0.5 left-0 h-px w-full origin-left bg-sky/80",
                      "transition-transform duration-600 ease-[var(--ease-out-expo)]",
                      active === link.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </a>
              ))}
            </nav>

            <div data-nav-in className="flex items-center gap-3">
              <Magnetic className="hidden sm:inline-block">
                <a
                  href={MAILTO}
                  className="group inline-flex items-center gap-2.5 rounded-full border border-white/20 px-5 py-2.5 text-[0.8rem] font-semibold text-white transition-colors duration-500 hover:border-white/60 hover:bg-white/5"
                >
                  Start a Project
                  <span className="h-1.5 w-1.5 rounded-full bg-sky transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-150" />
                </a>
              </Magnetic>

              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 lg:hidden"
              >
                <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
                <span className="relative block h-2.5 w-4">
                  <span
                    className={cn(
                      "absolute left-0 block h-px w-full bg-white transition-transform duration-400 ease-[var(--ease-out-expo)]",
                      open ? "top-1/2 rotate-45" : "top-0"
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 block h-px w-full bg-white transition-transform duration-400 ease-[var(--ease-out-expo)]",
                      open ? "top-1/2 -rotate-45" : "top-full"
                    )}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu open={open} onClose={() => setOpen(false)} active={active} />
    </div>
  );
}

function MobileMenu({
  open,
  onClose,
  active,
}: {
  open: boolean;
  onClose: () => void;
  active: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // don't play the close animation on the first render
    if (first.current) {
      first.current = false;
      gsap.set(el, { autoAlpha: 0 });
      return;
    }

    const items = el.querySelectorAll("[data-menu-item]");
    if (open) {
      gsap.set(el, { autoAlpha: 1 });
      gsap.fromTo(
        el,
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: EASE.inOut }
      );
      gsap.fromTo(
        items,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.9, ease: EASE.out, stagger: 0.06, delay: 0.16 }
      );
    } else {
      // exit is quicker than entrance, so dismissing feels responsive
      gsap.to(el, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.5,
        ease: EASE.inOut,
        onComplete: () => gsap.set(el, { autoAlpha: 0 }),
      });
    }
  }, [open]);

  return (
    <div
      id="mobile-menu"
      ref={ref}
      className="fixed inset-0 z-40 bg-ink lg:hidden"
      style={{ visibility: "hidden", opacity: 0 }}
      aria-hidden={!open}
    >
      <div className="shell flex h-full flex-col justify-center gap-2 pt-24 pb-16">
        {LINKS.map((link) => (
          <span key={link.id} className="line-mask">
            <a
              data-menu-item
              href={`#${link.id}`}
              onClick={onClose}
              tabIndex={open ? 0 : -1}
              className={cn(
                "display block py-2 text-[clamp(2.4rem,11vw,4rem)]",
                active === link.id ? "text-white" : "text-white/70"
              )}
            >
              {link.label}
            </a>
          </span>
        ))}
        <a
          href={MAILTO}
          onClick={onClose}
          tabIndex={open ? 0 : -1}
          className="mt-10 inline-flex w-fit items-center gap-3 rounded-full bg-blue px-7 py-4 font-semibold text-white"
        >
          Start a Project
        </a>
      </div>
    </div>
  );
}
