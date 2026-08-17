# Northside Web — second try

A rebuild of the Northside Web homepage as a standalone project. Same brand,
same photography, same logo; a different site.

**Nothing in this repo writes to the existing project.** The assets were copied
out of a sibling `northside-web-v2/public` checkout by
`scripts/prepare-assets.mjs`, which only ever reads from there — and its
generated output is committed, so a fresh clone never needs to run it. Point it
somewhere else with `NSW_ASSET_SOURCE=…` if you ever do.

---

## Run it

```bash
npm install
npm run dev
```

http://localhost:5180

```bash
npm run build     # type-check + production build into ./dist
npm run preview   # serve ./dist
```

Nothing here is wired to a host. There is no deploy step, no CNAME and no CI.

---

## The stack, and why

| | |
|---|---|
| **Vite + React 19 + TypeScript** | Fast dev loop, one page, no framework tax. |
| **Tailwind v4** | Tokens live in `src/index.css` under `@theme`; no config file. |
| **GSAP + ScrollTrigger** | Every scroll-linked effect on the page. |
| **Lenis** | Scroll smoothing, wired into ScrollTrigger so scrubs stay locked to the smoothed position. |
| **sharp** (dev only) | The image pipeline in `scripts/`. |

Four runtime dependencies. No component library, no animation wrapper, no
icon package — the handful of icons used are inline SVG.

---

## Layout

```
src/
  App.tsx                  section order, and the curtain that reveals the CTA
  index.css                tokens, fonts, primitives
  lib/
    motion.ts              easing vocabulary, Lenis↔ScrollTrigger, useGsap
    utils.ts               cn, asset(), contact details
  components/
    Preloader.tsx          page-load sequence
    Nav.tsx                bar + mobile overlay
    Hero.tsx               opening frame
    Immersion.tsx          the showcase — the signature scroll
    Work.tsx               portfolio
    Services.tsx           editorial spread with a sticky preview
    Industries.tsx         who we build for
    Advantages.tsx         why Northside Web
    Process.tsx            01–05
    FinalCta.tsx           closing frame + footer
    ui/                    MaskLines, Magnetic, Button, BrowserFrame, Cursor
scripts/
  prepare-assets.mjs       copies brand assets in, builds derivatives
public/                    the result of that script
```

---

## The motion system

One easing vocabulary (`EASE` in `src/lib/motion.ts`), and a different kind of
movement per section, so movement carries meaning instead of decorating:

| Section | Movement |
|---|---|
| Hero | Unmask + settle on entry; photograph and copy leave at different rates |
| Showcase | Scroll-scrubbed: the frame grows, its chrome dissolves, the site inside scrolls, then it dissolves into the next section |
| Work | Clip-path curtains, columns drifting at different rates, hover walks down the real page |
| Services | Sticky preview swapping against a scrolled column |
| Who we build for | Cursor-trailing preview on desktop, counter-running marquees below it |
| Why | Rules drawing left-to-right, like a page being set |
| Process | Only the numeral moves — the section is about progression |
| Final CTA | The whole page lifts off it, CSS only |

### Reduced motion

`gsap.matchMedia` gates every timeline on `prefers-reduced-motion:
no-preference`, so under reduced motion no ScrollTrigger is created at all.
Everything renders in its final state, Lenis never initialises, the preloader
skips, and the showcase's 4.6-viewport scroll track collapses to an ordinary
section rather than leaving a static picture to scroll past.

---

## Performance notes

- **Fonts** are two self-hosted variable woff2 files, Latin subset only, 62 KB
  for both. No third-party connection on the critical path.
- **The hero photograph** is preloaded with a matching `srcset`, so a phone
  fetches the 1200px copy and nothing else.
- **The showcase capture** ships in two versions — a 1440px desktop capture and
  a 430px phone capture of the site's own mobile layout — selected with
  `<picture>`, so each screen size downloads exactly one. The work card reuses
  the same pair, so it costs nothing extra.
- **Portfolio clips** are `preload="none"` and only play at 55% visibility, so
  four videos never decode at once.
- **Only transforms and opacity** are animated in scrubbed timelines.
- Build output: ~124 KB gzipped JS, ~7.5 KB gzipped CSS.

---

## Content

Everything on the page comes from the existing site or from a real build:

- **Pristine Finish** is a live client build. Its preview is a real full-page
  capture of <https://northsidewebsites.com/PFCarCleaning.Github.io/> and the
  card links to it.
- **MARRAM, Bower and HEADLAND** are the studio's own example builds, running
  locally at ports 5200, 5195 and 5190. Every frame of their previews is a real
  screenshot of those running sites. They are labelled *Example build* and do
  not link out, because they are not deployed — no public URL is implied for
  any of them.
- The four projects carried over from the current Northside Web site — Bower &
  Co., Saltgrain, Saltline and Stillwater — were taken out on request. Their
  scroll-through recordings are no longer copied into `public/` (see
  `scripts/prepare-assets.mjs`); their still frames stay, because the Services
  stage still uses them.
- There are no invented statistics, testimonials or client claims anywhere on
  the page, and no placeholder cards.

### The example-site previews

`public/projects/<slug>/` holds, per project:

| File | Used by | Notes |
|---|---|---|
| `scroll.webp` | the card, ≥1024px | six real screens stitched into one strip |
| `scroll-mobile.webp` | the card, <1024px | the same, captured at 430px |
| `preview.webp` | `poster` in the data | 16:9 still of the homepage |
| `hero.webp` | — | full 16:10 homepage still, kept for future use |
| `detail.webp` | — | a second section, kept for future use |

The strips are **curated, not contiguous**. A full-document screenshot of these
sites photographs half the page mid-animation, and a straight top-to-bottom
strip repeats the same pinned section several screens running — both of these
were tried first. What ships instead is one viewport screenshot per chosen
scroll position, taken after the reveals have settled, with the site's fixed nav
suppressed on every screen but the first so it isn't stamped in six times.

Two quirks are worth knowing if these are ever recaptured. Sections that
cross-fade stacked copy only resolve if the page is *walked* to the position in
small steps — jumping straight there lands them mid-blend, drawing two
paragraphs over each other. And the phone strips are cropped 250px from the top,
because the card's window would otherwise stop just above each site's headline.

There is no video preview: `ffmpeg` is not installed on this machine, and the
only binary present is sandboxed inside another app and will not run. The motion
in these cards is the same hover scroll-through Pristine Finish uses, which is
lighter than video and needs no autoplay.

### Adding a project back

One entry in `PROJECTS` at the top of `src/components/Work.tsx`, plus its files
in `public/`. Nothing below that array is per-project. A project supplies either
a `page` (a tall capture, which walks down the real page on hover — the Pristine
Finish treatment) or a `video` (a recorded scroll-through, played only while on
screen), and only gets `href` once it is live. Rows lay out on an alternating
grid keyed off their index, so the editorial rhythm returns by itself as the
list grows.

Contact throughout is `northsideweb2@gmail.com`, as on the live site.

---

## Regenerating the assets

```bash
npm run assets
```

`scripts/prepare-assets.mjs` copies the brand files, builds phone-sized copies
of the three photographs, and stitches the Pristine Finish showcase captures.
The captures themselves are taken separately with headless Chrome; the script
skips that step cleanly if they are not present, leaving whatever is already in
`public/` alone.
