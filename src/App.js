import { useState, useEffect, useRef } from "react";
import CiPDHero        from "./HeroPage";
import CiPDScrollStory from "./CiPDScrollAnimationMilestones";
import IPDCPSection    from "./iPD-CP";
import Navbar          from "./components/Navbar";          // ← NEW
import FloatingCTA     from  "./components/CTA"; // ← NEW

const PHASES = ["hero", "story", "ipdcp"];

export default function App() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const cooldown = useRef(false);

  const phase  = PHASES[phaseIdx];
  const isHero = phase === "hero";

  function goNext() {
    if (cooldown.current) return;
    cooldown.current = true;
    setPhaseIdx(i => Math.min(i + 1, PHASES.length - 1));
    // Delay scrollTo until React has re-rendered to avoid old listener flash
    requestAnimationFrame(() => { window.scrollTo({ top: 0 }); });
    setTimeout(() => { cooldown.current = false; }, 1000);
  }

  function goPrev() {
    if (cooldown.current) return;
    cooldown.current = true;
    setPhaseIdx(i => Math.max(i - 1, 0));
    requestAnimationFrame(() => { window.scrollTo({ top: 0 }); });
    setTimeout(() => { cooldown.current = false; }, 1000);
  }

  // ── Scroll-up-at-top → go back ──
  useEffect(() => {
    if (isHero) return;

    let armed = false;
    const armTimer = setTimeout(() => { armed = true; }, 800);

    function onWheel(e) {
      if (!armed || cooldown.current) return;
      if (window.scrollY <= 2 && e.deltaY < -30) goPrev();
    }
    let lastTY = 0;
    let touchStartTime = 0;
    function onTouchStart(e) { lastTY = e.touches[0].clientY; touchStartTime = Date.now(); }
    function onTouchEnd(e) {
      if (!armed || cooldown.current) return;
      const dy = e.changedTouches[0].clientY - lastTY;
      const elapsed = Date.now() - touchStartTime;
      const velocity = Math.abs(dy) / Math.max(elapsed, 1) * 1000;
      if (window.scrollY <= 2 && dy > 50 && velocity > 200) goPrev();
    }
    window.addEventListener("wheel",      onWheel,      { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend",   onTouchEnd,   { passive: true });
    return () => {
      clearTimeout(armTimer);
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend",   onTouchEnd);
    };
  }, [isHero]);

  // ── Body scroll lock ──
  useEffect(() => {
    document.body.style.overflow = isHero ? "hidden" : "auto";
    if (!isHero) window.scrollTo({ top: 0 });
  }, [isHero]);

  // ── Shared "Apply Now" handler ──
  // Used by both Navbar ghost CTA and FloatingCTA filled button
  const APPLY_URL = "https://docs.google.com/forms/d/e/1FAIpQLScnTQdnzGalnaqckHoUXKlMnYAXiHdn2qpATLaJCVtRCjMCOQ/viewform";

  function handleApply() {
    window.open(APPLY_URL, "_blank", "noopener");
  }

  // ── Nav link handler ──
  function handleNavigate(targetPhase) {
    const idx = PHASES.indexOf(targetPhase);
    if (idx === -1 || idx === phaseIdx) return;
    if (cooldown.current) return;
    cooldown.current = true;
    setPhaseIdx(idx);
    requestAnimationFrame(() => { window.scrollTo({ top: 0 }); });
    setTimeout(() => { cooldown.current = false; }, 1000);
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html { background: #060810; }
        body { margin: 0; padding: 0; background: #060810; }
        #root { background: #060810; min-height: 100vh; }
      `}</style>

      {/* ── Navbar — always mounted, transparent on hero, glass on scroll ── */}
      <Navbar
        logoSrc="/logo.png"          /* ← swap with your actual logo path */
        currentPhase={phase}
        onNavigate={handleNavigate}
        onApply={handleApply}
      />

      {/* ── Phases — Hero stays mounted (videos preloaded); others conditional ── */}
      <div style={{
        position: phase === "hero" ? "relative" : "fixed",
        inset: 0,
        zIndex: phase === "hero" ? 1 : -1,
        visibility: phase === "hero" ? "visible" : "hidden",
        pointerEvents: phase === "hero" ? "auto" : "none",
      }}>
        <CiPDHero onComplete={goNext} isActive={phase === "hero"} />
      </div>
      {phase === "story" && <CiPDScrollStory onComplete={goNext} />}
      {phase === "ipdcp" && <IPDCPSection />}

      {/* ── Floating CTA — always visible ── */}
      <FloatingCTA
        applicationDeadline="TBA"    /* ← swap e.g. "2026-06-01" once confirmed */
        onApply={handleApply}
      />
    </>
  );
}