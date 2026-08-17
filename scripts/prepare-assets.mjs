/**
 * Asset pipeline.
 *
 * Pulls the approved Northside Web brand assets out of the existing site and
 * writes optimised derivatives into ./public. It only ever READS from SOURCE —
 * the live project is never written to, moved or deleted.
 *
 *   node scripts/prepare-assets.mjs
 */
import { mkdir, copyFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const PUBLIC = path.join(ROOT, "public");

/*
 * Where the source material lives.
 *
 * Both default to a sibling checkout so the script carries no path belonging to
 * one machine, and both can be pointed elsewhere:
 *
 *   NSW_ASSET_SOURCE=../some/other/public node scripts/prepare-assets.mjs
 *
 * Everything below already skips cleanly when a source is missing, so this is a
 * one-off pipeline: the assets it produced are committed, and a fresh clone
 * never needs to run it.
 */
const SOURCE = path.resolve(
  ROOT,
  process.env.NSW_ASSET_SOURCE ?? "../northside-web-v2/public"
);
/** Full-page captures of the Pristine Finish site, taken with headless Chrome. */
const SCRATCH = path.resolve(ROOT, process.env.NSW_CAPTURE_DIR ?? "../.nsw-captures");
const PRISTINE_CAPTURE = path.join(SCRATCH, "pf-full.png");
const PRISTINE_MOBILE_CAPTURE = path.join(SCRATCH, "pf-mobile.png");

const exists = (p) =>
  access(p).then(
    () => true,
    () => false
  );

/** Brand marks and favicons are copied verbatim — the logo is never re-cut. */
const VERBATIM = [
  "logo-full-white.png",
  "logo-full-navy.png",
  "logo-mark-white.png",
  "logo-mark-navy.png",
  "logo-mark-original.png",
  "favicon-32.png",
  "favicon-192.png",
  "favicon-512.png",
  "apple-touch-icon.png",
  "hero-coast.webp",
  "photo-shore.webp",
  "photo-house.webp",
  // stills, still used by the Services stage
  "work-builder.webp",
  "work-cafe.webp",
  "work-pilates.webp",
  "work-charter.webp",
  /*
   * The matching scroll-through recordings — work-builder.mp4, work-cafe.mp4,
   * work-pilates.mp4 and work-charter.mp4 — are deliberately not copied. Those
   * projects were taken out of the portfolio, so the clips were 14 MB of files
   * nothing referenced. They are untouched in SOURCE; add the four names back
   * to this list to bring them across again.
   */
];

/**
 * Phone-sized copies of the three photographs. A 2400px hero costs a phone
 * roughly four times the bytes it can actually use.
 */
const NARROW = [
  ["hero-coast.webp", "hero-coast-1200.webp", 1200],
  ["photo-shore.webp", "photo-shore-1200.webp", 1200],
  ["photo-house.webp", "photo-house-1200.webp", 1200],
];

await mkdir(PUBLIC, { recursive: true });
await mkdir(path.join(PUBLIC, "media"), { recursive: true });

for (const file of VERBATIM) {
  const from = path.join(SOURCE, file);
  if (!(await exists(from))) {
    console.warn(`skip (missing): ${file}`);
    continue;
  }
  await copyFile(from, path.join(PUBLIC, file));
  console.log(`copied  ${file}`);
}

for (const [from, to, width] of NARROW) {
  const src = path.join(SOURCE, from);
  if (!(await exists(src))) continue;
  await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality: 74 }).toFile(path.join(PUBLIC, to));
  console.log(`resized ${to} @${width}`);
}

if (await exists(PRISTINE_CAPTURE)) {
  const src = sharp(PRISTINE_CAPTURE);
  const { width, height } = await src.metadata();

  /*
   * The tall one drives the showcase: it scrolls inside the browser frame while
   * that frame grows to fill the viewport, so it stays at full capture width —
   * a 1100px source visibly softens once the frame passes 1x.
   *
   * Two bands are stitched rather than one straight crop. A scroll-scrubbed
   * section on the captured site paints one screen and then a tall blank run
   * when it is photographed from a standstill, so that band is cut out and the
   * two good runs are joined.
   */
  const BANDS = [
    { top: 0, height: 2360 }, // hero → detail gallery
    { top: 3000, height: 2600 }, // pricing → results
  ];
  const usable = BANDS.filter((b) => b.top + b.height <= height);
  const stitchedHeight = usable.reduce((sum, b) => sum + b.height, 0);

  const pieces = await Promise.all(
    usable.map((band) =>
      sharp(PRISTINE_CAPTURE)
        .extract({ left: 0, top: band.top, width, height: band.height })
        .png()
        .toBuffer()
    )
  );

  let offset = 0;
  const layers = pieces.map((input, i) => {
    const top = offset;
    offset += usable[i].height;
    return { input, top, left: 0 };
  });

  await sharp({
    create: { width, height: stitchedHeight, channels: 3, background: "#0b0b0b" },
  })
    .composite(layers)
    .webp({ quality: 66 })
    .toFile(path.join(PUBLIC, "media/work-pristine-scroll.webp"));

  // …and a 16:10 crop of the hero for the poster/still.
  const posterH = Math.round((width / 16) * 10);
  await sharp(PRISTINE_CAPTURE)
    .extract({ left: 0, top: 0, width, height: Math.min(posterH, height) })
    .resize({ width: 1400 })
    .webp({ quality: 78 })
    .toFile(path.join(PUBLIC, "media/work-pristine.webp"));

  console.log("built   media/work-pristine-scroll.webp + media/work-pristine.webp");
} else {
  console.warn("skip: no Pristine Finish capture found");
}

/*
 * A phone-width capture of the same site. Blowing the 1440px desktop capture up
 * to fill a 390px viewport needs nearly 4x of scale — unreadable and soft — so
 * small screens step into the site's own mobile layout in a portrait frame.
 */
if (await exists(PRISTINE_MOBILE_CAPTURE)) {
  const { width, height } = await sharp(PRISTINE_MOBILE_CAPTURE).metadata();
  await sharp(PRISTINE_MOBILE_CAPTURE)
    .extract({ left: 0, top: 0, width, height: Math.min(5600, height) })
    .webp({ quality: 70 })
    .toFile(path.join(PUBLIC, "media/work-pristine-mobile.webp"));
  console.log("built   media/work-pristine-mobile.webp");
}

console.log("\nassets ready in ./public");
