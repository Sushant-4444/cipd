import { useState, useEffect, useRef } from "react";
import CiPDHero              from "./HeroPage";
import CiPDScrollStory       from "./CiPDScrollAnimationMilestones";
import IPDCPSection          from "./iPD-CP";
// import YourNextSection    from "./YourNextSection"; ← add future sections here

// ─────────────────────────────────────────────────────────────────────────────
// HOW THE APP WORKS
// ─────────────────────────────────────────────────────────────────────────────
//
//  The app has TWO kinds of components:
//
//  1. HERO  (phase = "hero")
//     • Fixed to the viewport (position: fixed)
//     • Hijacks the wheel — no real page scroll happens
//     • Controls its own internal slide transitions
//     • When done → calls onComplete() → App advances to next phase
//
//  2. STORY SECTIONS  (phase = "story", "ipdcp", "next", ...)
//     • Body scroll is restored (overflow: auto)
//     • Each section is a tall div with a sticky child (scroll-driven animation)
//     • Scrolling DOWN inside a section → section drives its own progress
//     • Scrolling UP at the TOP of a section → calls onScrollUpAtTop()
//       → App goes back to the previous phase
//
//  PHASE FLOW (add yours at the end):
//
//   "hero"  ──onComplete──▶  "story"  ──onComplete──▶  "ipdcp"  ──onComplete──▶  "next" ...
//              scroll-up ◀──              scroll-up ◀──
//
// ─────────────────────────────────────────────────────────────────────────────

// Define all phases in order — makes it easy to add more
const PHASES = ["hero", "story", "ipdcp" /*, "next", "contact" */];

export default function App() {
  const [phaseIdx, setPhaseIdx] = useState(0);   // index into PHASES array
  const cooldown = useRef(false);

  const phase    = PHASES[phaseIdx];
  const isHero   = phase === "hero";

  // ── Advance forward (called by each section's onComplete / onScrollUpAtTop) ──
  function goNext() {
    if (cooldown.current) return;
    cooldown.current = true;
    setPhaseIdx(i => Math.min(i + 1, PHASES.length - 1));
    window.scrollTo({ top: 0 });
    setTimeout(() => { cooldown.current = false; }, 1000);
  }

  function goPrev() {
    if (cooldown.current) return;
    cooldown.current = true;
    setPhaseIdx(i => Math.max(i - 1, 0));
    window.scrollTo({ top: 0 });
    setTimeout(() => { cooldown.current = false; }, 1000);
  }

  // ── Scroll-up-at-top detection for ALL window-scroll sections ──
  // Both CiPDScrollStory and IPDCPSection now use window scroll (position:sticky pattern).
  // So one single useEffect handles going back for every story phase.
  // Just add new phase names to the check as you build more sections.
  useEffect(() => {
    if (isHero) return; // hero handles its own navigation

    function onWheel(e) {
      if (cooldown.current) return;
      if (window.scrollY === 0 && e.deltaY < -30) goPrev();
    }
    let lastTY = 0;
    function onTouchStart(e) { lastTY = e.touches[0].clientY; }
    function onTouchEnd(e) {
      const dy = e.changedTouches[0].clientY - lastTY;
      if (window.scrollY === 0 && dy > 60) goPrev();
    }

    window.addEventListener("wheel",      onWheel,      { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend",   onTouchEnd,   { passive: true });
    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend",   onTouchEnd);
    };
  }, [isHero]); // ← re-runs only when switching to/from hero

  // ── Sync body scroll lock ──
  useEffect(() => {
    document.body.style.overflow = isHero ? "hidden" : "auto";
    if (!isHero) window.scrollTo({ top: 0 });
  }, [isHero]);

  return (
    <>
      <style>{`body { margin:0; padding:0; background:#0A0A16; }`}</style>

      {/* ── PHASE: hero ── */}
      {phase === "hero" && (
        <CiPDHero onComplete={goNext} />
      )}

      {/* ── PHASE: story (CiPDScrollStory uses window scroll — no onScrollUpAtTop needed) ── */}
      {phase === "story" && (
        <CiPDScrollStory onComplete={goNext} />
        // NOTE: scroll-up detection for this section is handled by the useEffect above
        // because CiPDScrollStory uses window.scrollY (not an internal scroll div).
        // If you refactor it to use an internal scroll div later, pass onScrollUpAtTop={goPrev}
      )}

      {/* ── PHASE: ipdcp (now uses window scroll — no special prop needed) ── */}
      {phase === "ipdcp" && (
        <IPDCPSection />
      )}

      {/*
      // ── HOW TO ADD A NEW SECTION ──────────────────────────────────────────
      //
      //  Step 1: Add its phase name to the PHASES array at the top.
      //
      //  Step 2: Import your component.
      //
      //  Step 3: Render it here with the right props.
      //
      //  There are TWO types of new sections:
      //
      //  TYPE A — uses its OWN internal scroll div (like IPDCPSection):
      //    • Add onScrollUpAtTop={goPrev} so it can hand back control when user scrolls up at top
      //    • Optionally add onComplete={goNext} if it should advance when fully scrolled
      //
      //    {phase === "next" && (
      //      <YourNextSection
      //        onScrollUpAtTop={goPrev}
      //        onComplete={goNext}
      //      />
      //    )}
      //
      //  TYPE B — uses window scroll (like CiPDScrollStory):
      //    • Add "next" to the if-check in the useEffect above so App watches for scroll-up
      //    • No prop needed on the component itself
      //
      //    Change:  if (phase !== "story") return;
      //    To:      if (phase !== "story" && phase !== "next") return;
      //
      //    {phase === "next" && (
      //      <YourNextSection />
      //    )}
      //
      // ─────────────────────────────────────────────────────────────────────
      */}
    </>
  );
}