import { useState, useEffect, useRef } from "react";
import CiPDHero        from "./HeroPage";
import CiPDScrollStory from "./CiPDScrollAnimationMilestones";

/**
 * Two-phase layout
 * ─────────────────────────────────────────────────────────────
 * Phase "hero"  → CiPDHero is fixed, wheel hijacked, body locked.
 *                 Scrolling past last section → phase "story".
 *
 * Phase "story" → body scroll restored, normal sticky scroll.
 *                 Scrolling UP at the very top → phase "hero".
 * ─────────────────────────────────────────────────────────────
 */
export default function App() {
  const [phase, setPhase] = useState("hero");
  const cooldown = useRef(false);

  // When in story phase, watch for scroll-up at the top of the page
  useEffect(() => {
    if (phase !== "story") return;

    function onWheel(e) {
      if (cooldown.current) return;
      // only trigger if scrolled back to very top AND scrolling up
      if (window.scrollY === 0 && e.deltaY < -30) {
        cooldown.current = true;
        // scroll page back to top cleanly before switching
        window.scrollTo({ top: 0 });
        setPhase("hero");
        setTimeout(() => { cooldown.current = false; }, 1000);
      }
    }

    let lastTY = 0;
    function onTouchStart(e) { lastTY = e.touches[0].clientY; }
    function onTouchEnd(e) {
      const dy = e.changedTouches[0].clientY - lastTY; // positive = swipe down = scroll up
      if (cooldown.current) return;
      if (window.scrollY === 0 && dy > 60) {
        cooldown.current = true;
        setPhase("hero");
        setTimeout(() => { cooldown.current = false; }, 1000);
      }
    }

    window.addEventListener("wheel",      onWheel,     { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend",   onTouchEnd,   { passive: true });
    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend",   onTouchEnd);
    };
  }, [phase]);

  // Sync body class + reset scroll position on phase change
  useEffect(() => {
    document.body.className = phase === "hero" ? "phase-hero" : "phase-story";
    if (phase === "story") window.scrollTo({ top: 0 });
  }, [phase]);

  return (
    <>
      <style>{`
        body { margin: 0; padding: 0; background: #0A0A16; }
        body.phase-hero  { overflow: hidden; }
        body.phase-story { overflow: auto;   }
      `}</style>

      {phase === "hero" && (
        <CiPDHero onComplete={() => setPhase("story")} />
      )}

      {phase === "story" && (
        <CiPDScrollStory />
      )}
    </>
  );
}