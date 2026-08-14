import { useCallback, useState } from "react";
import { useScrollTriggerRefresh, useSmoothScroll } from "@/lib/motion";
import { Preloader } from "@/components/Preloader";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Immersion } from "@/components/Immersion";
import { Work } from "@/components/Work";
import { Services } from "@/components/Services";
import { Industries } from "@/components/Industries";
import { Advantages } from "@/components/Advantages";
import { Process } from "@/components/Process";
import { FinalCta } from "@/components/FinalCta";
import { Cursor } from "@/components/ui/Cursor";

export default function App() {
  const [ready, setReady] = useState(false);
  const onIntroDone = useCallback(() => setReady(true), []);

  useSmoothScroll();
  useScrollTriggerRefresh();

  return (
    <>
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[110] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>

      <Preloader onDone={onIntroDone} />
      <Cursor />
      <Nav ready={ready} />

      {/*
        Opaque and above the closing frame, with a viewport of bottom margin:
        the last stretch of scroll lifts this whole block away and uncovers the
        fixed CTA underneath it.
      */}
      <main className="relative z-10 mb-[100svh] bg-ink">
        <Hero start={ready} />
        <Immersion />
        <Work />
        <Services />
        <Industries />
        <Advantages />
        <Process />
      </main>

      <FinalCta />
    </>
  );
}
