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

  // ── Scroll-up-at-top → go back ──
  useEffect(() => {
    if (isHero) return;
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
  }, [isHero]);

  // ── Body scroll lock ──
  useEffect(() => {
    document.body.style.overflow = isHero ? "hidden" : "auto";
    if (!isHero) window.scrollTo({ top: 0 });
  }, [isHero]);

  // ── Shared "Apply Now" handler ──
  // Used by both Navbar ghost CTA and FloatingCTA filled button
  function handleApply() {
    if (phase === "ipdcp") {
      window.open("#apply", "_blank", "noopener"); // ← swap for real URL
      return;
    }
    if (cooldown.current) return;
    cooldown.current = true;
    setPhaseIdx(PHASES.indexOf("ipdcp"));
    window.scrollTo({ top: 0 });
    setTimeout(() => { cooldown.current = false; }, 1000);
  }

  // ── Nav link handler ──
  function handleNavigate(targetPhase) {
    const idx = PHASES.indexOf(targetPhase);
    if (idx === -1 || idx === phaseIdx) return;
    if (cooldown.current) return;
    cooldown.current = true;
    setPhaseIdx(idx);
    window.scrollTo({ top: 0 });
    setTimeout(() => { cooldown.current = false; }, 1000);
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: #060810; }
      `}</style>

      {/* ── Navbar — always mounted, transparent on hero, glass on scroll ── */}
      <Navbar
        logoSrc="/logo.png"          /* ← swap with your actual logo path */
        currentPhase={phase}
        onNavigate={handleNavigate}
        onApply={handleApply}
      />

      {/* ── Phases ── */}
      {phase === "hero"  && <CiPDHero onComplete={goNext} />}
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