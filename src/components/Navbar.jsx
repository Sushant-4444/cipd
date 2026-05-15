import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Navbar
//
// Props:
//   logoSrc        {string}    path to your logo PNG  e.g. "/logo.png"
//   currentPhase   {string}    current app phase: "hero" | "story" | "ipdcp" | "events"
//   onNavigate     {function}  (phase) => void  — called when a nav link is clicked
//   onApply        {function}  called when ghost CTA is clicked
//   applyUrl       {string}    fallback href if no onApply
//
// Usage in App.js:
//   import Navbar from "./Navbar";
//   <Navbar
//     logoSrc="/logo.png"
//     currentPhase={phase}
//     onNavigate={(p) => { setPhaseIdx(PHASES.indexOf(p)); window.scrollTo({top:0}); }}
//     onApply={handleCTAApply}
//   />
// ─────────────────────────────────────────────────────────────────────────────

const B = {
  teal:    "#00BFA5",
  magenta: "#E91E8C",
  gold:    "#FFB300",
  dark:    "#060810",
};

// Map phase names → nav link ids
const LINKS = [
  { label: "Home",      phase: "hero",   id: "home"   },
  { label: "About",     phase: "story",  id: "about"  },
  { label: "iPD-CP",    phase: "ipdcp",  id: "ipdcp"  },
  { label: "Events",    phase: "events", id: "events" },
  { label: "Blog",      phase: "blogs",  id: "blogs"  },
];

export default function Navbar({
  logoSrc      = "/logo.png",
  currentPhase = "hero",
  onNavigate,
  onApply,
  applyUrl     = "#apply",
}) {
  const [scrolled,    setScrolled]    = useState(false);  // transparent → glass
  const [menuOpen,    setMenuOpen]    = useState(false);  // mobile drawer
  const [mounted,     setMounted]     = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navLinksRef = useRef([]);
  const navRef      = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  // ── Scroll → glass transition ──
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20); }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Active indicator pill position ──
  const updateIndicator = useCallback(() => {
    const idx = LINKS.findIndex(l => l.phase === currentPhase);
    const el  = navLinksRef.current[idx];
    const nav = navRef.current;
    if (!el || !nav) { setIndicatorStyle(s => ({ ...s, opacity: 0 })); return; }
    const navR = nav.getBoundingClientRect();
    const elR  = el.getBoundingClientRect();
    setIndicatorStyle({
      left:    elR.left - navR.left,
      width:   elR.width,
      opacity: 1,
    });
  }, [currentPhase]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  function handleNav(phase) {
    setMenuOpen(false);
    if (onNavigate) onNavigate(phase);
  }

  function handleApply() {
    setMenuOpen(false);
    if (onApply) { onApply(); return; }
    window.open(applyUrl, "_blank", "noopener");
  }

  if (!mounted) return null;

  // Decide glass intensity
  const isGlass = scrolled || menuOpen;

  return (
    <>
      <style>{CSS}</style>

      <header className={`nb-header ${isGlass ? "nb-header--glass" : "nb-header--clear"} ${menuOpen ? "nb-header--open" : ""}`}>

        {/* Animated top border beam — only when glass */}
        <div className="nb-beam" style={{ opacity: isGlass ? 1 : 0 }}/>

        {/* Glass layers — only rendered when scrolled */}
        {isGlass && (
          <>
            <div className="nb-glass-base"/>
            <div className="nb-glass-top"/>
            <div className="nb-shimmer"/>
          </>
        )}

        <nav ref={navRef} className="nb-nav" aria-label="Main navigation">

          {/* ── Logo ── */}
          <a
            className="nb-logo"
            href="#"
            onClick={e => { e.preventDefault(); handleNav("hero"); }}
            aria-label="Go to home"
          >
            <img src={logoSrc} alt="CiPD Logo" className="nb-logo-img"/>
            {/* Subtle glow behind logo */}
            <span className="nb-logo-glow" aria-hidden="true"/>
          </a>

          {/* ── Desktop links + sliding indicator ── */}
          <div className="nb-links-wrap">
            {/* Sliding active indicator */}
            <span
              className="nb-indicator"
              aria-hidden="true"
              style={{
                left:    indicatorStyle.left,
                width:   indicatorStyle.width,
                opacity: indicatorStyle.opacity,
              }}
            />

            {LINKS.map((link, i) => {
              const isActive = link.phase === currentPhase;
              return (
                <button
                  key={link.id}
                  ref={el => navLinksRef.current[i] = el}
                  className={`nb-link ${isActive ? "nb-link--active" : ""}`}
                  onClick={() => handleNav(link.phase)}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Circuit-dot prefix on active */}
                  {isActive && (
                    <span className="nb-link-dot" aria-hidden="true"/>
                  )}
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* ── Ghost CTA — desktop ── */}
          <button className="nb-cta" onClick={handleApply} aria-label="Apply for iPD-CP">
            <span className="nb-cta-border"/>
            <span className="nb-cta-sheen"/>
            <span className="nb-cta-label">
              Apply Now
              <svg className="nb-cta-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M1.5 6h9M7 2.5l3.5 3.5L7 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>

          {/* ── Hamburger — mobile ── */}
          <button
            className={`nb-burger ${menuOpen ? "nb-burger--open" : ""}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span className="nb-burger-line nb-burger-line--top"/>
            <span className="nb-burger-line nb-burger-line--mid"/>
            <span className="nb-burger-line nb-burger-line--bot"/>
          </button>
        </nav>

        {/* ── Mobile drawer ── */}
        <div className={`nb-drawer ${menuOpen ? "nb-drawer--open" : ""}`} aria-hidden={!menuOpen}>
          <div className="nb-drawer-inner">

            {/* Decorative circuit lines */}
            <svg className="nb-drawer-deco" viewBox="0 0 300 200" fill="none" aria-hidden="true">
              <line x1="0"   y1="40"  x2="300" y2="40"  stroke="rgba(0,191,165,0.06)" strokeWidth="1"/>
              <line x1="0"   y1="100" x2="300" y2="100" stroke="rgba(0,191,165,0.04)" strokeWidth="1"/>
              <line x1="0"   y1="160" x2="300" y2="160" stroke="rgba(0,191,165,0.06)" strokeWidth="1"/>
              <line x1="40"  y1="0"   x2="40"  y2="200" stroke="rgba(233,30,140,0.04)" strokeWidth="1"/>
              <circle cx="40"  cy="40"  r="3" fill="none" stroke="rgba(0,191,165,0.2)" strokeWidth="1"/>
              <circle cx="40"  cy="100" r="2" fill="rgba(0,191,165,0.15)"/>
              <circle cx="260" cy="160" r="3" fill="none" stroke="rgba(233,30,140,0.2)" strokeWidth="1"/>
            </svg>

            {LINKS.map((link, i) => {
              const isActive = link.phase === currentPhase;
              return (
                <button
                  key={link.id}
                  className={`nb-drawer-link ${isActive ? "nb-drawer-link--active" : ""}`}
                  style={{ "--i": i }}
                  onClick={() => handleNav(link.phase)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="nb-drawer-num">0{i + 1}</span>
                  <span className="nb-drawer-label">{link.label}</span>
                  {isActive && <span className="nb-drawer-active-bar"/>}
                </button>
              );
            })}

            <div className="nb-drawer-divider"/>

            <button className="nb-drawer-cta" onClick={handleApply}>
              <span className="nb-drawer-cta-bg"/>
              <span className="nb-drawer-cta-label">
                Apply Now → iPD-CP
              </span>
            </button>

            <p className="nb-drawer-tagline">IIIT Delhi · 24-Week Full-Time Program</p>
          </div>
        </div>

        {/* Mobile backdrop */}
        {menuOpen && (
          <div className="nb-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true"/>
        )}
      </header>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&family=Montserrat:wght@700;800;900&display=swap');

  /* ── Keyframes ── */
  @keyframes nbBeamSlide {
    0%   { left: -50%; opacity: 0; }
    8%   { opacity: 1; }
    92%  { opacity: 1; }
    100% { left: 110%; opacity: 0; }
  }
  @keyframes nbShimmerSlide {
    0%   { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
    12%  { opacity: 1; }
    88%  { opacity: 1; }
    100% { transform: translateX(300%) skewX(-12deg); opacity: 0; }
  }
  @keyframes nbLogoGlow {
    0%,100% { opacity: 0.4; transform: scale(1); }
    50%     { opacity: 0.7; transform: scale(1.1); }
  }
  @keyframes nbDotPulse {
    0%,100% { transform: scale(1); opacity: 1; }
    50%     { transform: scale(2); opacity: 0; }
  }
  @keyframes nbDrawerIn {
    from { opacity: 0; transform: translateY(-12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes nbDrawerLinkIn {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes nbGlassIn {
    from { opacity: 0; backdrop-filter: blur(0px); }
    to   { opacity: 1; backdrop-filter: blur(28px); }
  }
  @keyframes nbCtaGlow {
    0%,100% { box-shadow: 0 0 0 1px rgba(0,191,165,0.35), 0 0 12px rgba(0,191,165,0.0); }
    50%     { box-shadow: 0 0 0 1px rgba(0,191,165,0.6),  0 0 20px rgba(0,191,165,0.15); }
  }
  @keyframes nbIndicatorSlide {
    from { opacity: 0; transform: scaleX(0.6); }
    to   { opacity: 1; transform: scaleX(1); }
  }

  /* ── Header shell ── */
  .nb-header {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 8888;
    height: 80px;
    padding-top: 10px;
    transition:
      background 0.5s ease,
      box-shadow 0.5s ease,
      border-color 0.5s ease;
  }

  /* Transparent state */
  .nb-header--clear {
    background: transparent;
    box-shadow: none;
    border-bottom: 1px solid transparent;
  }

  /* Glass state */
  .nb-header--glass {
    border-bottom: 1px solid rgba(255,255,255,0.07);
    box-shadow:
      0 1px 0 rgba(0,191,165,0.12),
      0 4px 24px rgba(0,0,0,0.4),
      0 8px 40px rgba(0,0,0,0.25);
  }

  /* When drawer open, extend height slightly */
  .nb-header--open { }

  /* ── Glass layers (conditional) ── */
  .nb-glass-base {
    position: absolute; inset: 0;
    background: linear-gradient(180deg,
      rgba(6,8,16,0.88) 0%,
      rgba(6,8,16,0.82) 100%
    );
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
    animation: nbGlassIn 0.4s ease both;
    pointer-events: none;
  }
  .nb-glass-top {
    position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(255,255,255,0.12) 20%,
      rgba(0,191,165,0.3) 50%,
      rgba(255,255,255,0.12) 80%,
      transparent 100%
    );
    pointer-events: none;
  }
  .nb-shimmer {
    position: absolute; top: 0; bottom: 0; left: 0; width: 28%;
    background: linear-gradient(105deg,
      transparent, rgba(255,255,255,0.04) 50%, transparent
    );
    pointer-events: none;
    animation: nbShimmerSlide 7s ease-in-out infinite;
    animation-delay: 3s;
  }

  /* Animated beam */
  .nb-beam {
    position: absolute; bottom: -1px; left: -50%; width: 40%; height: 1px;
    background: linear-gradient(90deg, transparent, ${B.teal}, ${B.magenta}, transparent);
    pointer-events: none;
    animation: nbBeamSlide 6s ease-in-out infinite;
    transition: opacity 0.4s ease;
  }

  /* ── Nav inner ── */
  .nb-nav {
    position: relative; z-index: 2;
    max-width: 1280px;
    margin: 0 auto;
    height: 70px;
    padding: 0 clamp(20px, 4vw, 56px);
    display: flex;
    align-items: center;
    gap: clamp(16px, 3vw, 40px);
  }

  /* ── Logo ── */
  .nb-logo {
    position: relative;
    display: flex; align-items: center;
    flex-shrink: 0;
    text-decoration: none;
    margin-right: auto;
  }
  .nb-logo-img {
    height: 48px;
    width: auto;
    display: block;
    filter: drop-shadow(0 0 10px rgba(0,191,165,0.35));
    transition: filter 0.3s ease, transform 0.3s ease;
  }
  .nb-logo:hover .nb-logo-img {
    filter: drop-shadow(0 0 20px rgba(0,191,165,0.65));
    transform: scale(1.05);
  }
  .nb-logo-glow {
    position: absolute;
    inset: -12px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,191,165,0.18), transparent 70%);
    animation: nbLogoGlow 3s ease-in-out infinite;
    pointer-events: none;
  }

  /* ── Desktop nav links ── */
  .nb-links-wrap {
    position: relative;
    display: flex;
    align-items: center;
    gap: 2px;
  }

  /* Sliding indicator pill */
  .nb-indicator {
    position: absolute;
    bottom: -22px;              /* sits below the links, outside nav height */
    height: 2px;
    border-radius: 2px;
    background: linear-gradient(90deg, ${B.teal}, ${B.magenta});
    box-shadow: 0 0 10px rgba(0,191,165,0.6), 0 0 20px rgba(0,191,165,0.3);
    transition: left 0.35s cubic-bezier(0.22,1,0.36,1), width 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease;
    pointer-events: none;
  }

  .nb-link {
    position: relative;
    background: none; border: none;
    padding: 6px 14px;
    border-radius: 6px;
    cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    display: flex; align-items: center; gap: 7px;
    transition: color 0.25s ease, background 0.25s ease;
    white-space: nowrap;
  }
  .nb-link:hover {
    color: rgba(255,255,255,0.9);
    background: rgba(255,255,255,0.05);
  }
  .nb-link--active {
    color: #fff;
  }

  /* Active dot */
  .nb-link-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: ${B.teal};
    box-shadow: 0 0 8px ${B.teal}, 0 0 16px rgba(0,191,165,0.5);
    flex-shrink: 0;
    animation: nbDotPulse 2s ease-in-out infinite;
  }

  /* ── Ghost CTA ── */
  .nb-cta {
    position: relative;
    height: 36px;
    padding: 0 18px;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden;
    display: inline-flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: transform 0.2s ease;
    animation: nbCtaGlow 3s ease-in-out infinite;
  }
  /* Ghost border via pseudo */
  .nb-cta-border {
    position: absolute; inset: 0; border-radius: 8px;
    border: 1px solid rgba(0,191,165,0.45);
    transition: border-color 0.25s ease;
    pointer-events: none;
  }
  .nb-cta:hover .nb-cta-border { border-color: rgba(0,191,165,0.85); }

  /* Hover fill */
  .nb-cta::before {
    content: '';
    position: absolute; inset: 0; border-radius: 8px;
    background: rgba(0,191,165,0.08);
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
  }
  .nb-cta:hover::before { opacity: 1; }

  /* Sheen on hover */
  .nb-cta-sheen {
    position: absolute;
    top: 0; left: -80%; width: 50%; height: 100%;
    background: linear-gradient(105deg, transparent, rgba(255,255,255,0.14) 50%, transparent);
    pointer-events: none;
    transition: left 0.4s ease;
  }
  .nb-cta:hover .nb-cta-sheen { left: 140%; }

  .nb-cta-label {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 7px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: ${B.teal};
    transition: color 0.25s ease;
  }
  .nb-cta:hover .nb-cta-label { color: #fff; }
  .nb-cta-arrow {
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }
  .nb-cta:hover .nb-cta-arrow { transform: translateX(3px); }
  .nb-cta:hover { transform: translateY(-1px); }
  .nb-cta:active { transform: translateY(0px) scale(0.97); }

  /* ── Hamburger ── */
  .nb-burger {
    display: none;         /* hidden desktop */
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    width: 38px; height: 38px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 8px;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    transition: background 0.2s, border-color 0.2s;
  }
  .nb-burger:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(0,191,165,0.3);
  }
  .nb-burger-line {
    display: block;
    width: 16px; height: 1.5px;
    background: rgba(255,255,255,0.7);
    border-radius: 2px;
    transform-origin: center;
    transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease, width 0.3s ease;
  }
  /* Open state — X */
  .nb-burger--open .nb-burger-line--top { transform: translateY(6.5px) rotate(45deg); }
  .nb-burger--open .nb-burger-line--mid { opacity: 0; transform: scaleX(0); }
  .nb-burger--open .nb-burger-line--bot { transform: translateY(-6.5px) rotate(-45deg); }

  /* ── Mobile drawer ── */
  .nb-drawer {
    position: absolute;
    top: 80px; left: 0; right: 0;
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.5s cubic-bezier(0.22,1,0.36,1);
    pointer-events: none;
  }
  .nb-drawer--open {
    max-height: 420px;
    pointer-events: all;
  }
  .nb-drawer-inner {
    position: relative;
    padding: 20px 24px 28px;
    background: rgba(6,8,16,0.96);
    border-top: 1px solid rgba(255,255,255,0.06);
    border-bottom: 1px solid rgba(0,191,165,0.12);
    backdrop-filter: blur(32px);
    -webkit-backdrop-filter: blur(32px);
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;
    animation: nbDrawerIn 0.4s ease both;
  }
  /* Circuit decoration */
  .nb-drawer-deco {
    position: absolute;
    inset: 0; width: 100%; height: 100%;
    pointer-events: none;
    opacity: 0.8;
  }

  .nb-drawer-link {
    position: relative;
    background: none; border: none;
    padding: 14px 16px;
    border-radius: 8px;
    cursor: pointer;
    display: flex; align-items: center; gap: 14px;
    text-align: left;
    transition: background 0.2s ease;
    animation: nbDrawerLinkIn 0.4s ease calc(var(--i) * 0.07s + 0.1s) both;
  }
  .nb-drawer-link:hover { background: rgba(255,255,255,0.04); }
  .nb-drawer-link--active { background: rgba(0,191,165,0.06); }

  .nb-drawer-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.2em;
    color: rgba(0,191,165,0.45);
    flex-shrink: 0;
    width: 20px;
  }
  .nb-drawer-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 18px; font-weight: 800;
    letter-spacing: 0.04em;
    color: rgba(255,255,255,0.75);
    transition: color 0.2s;
  }
  .nb-drawer-link--active .nb-drawer-label { color: #fff; }
  .nb-drawer-link:hover .nb-drawer-label   { color: #fff; }

  /* Active bar — left edge */
  .nb-drawer-active-bar {
    position: absolute;
    left: 0; top: 20%; bottom: 20%;
    width: 2px; border-radius: 2px;
    background: linear-gradient(to bottom, ${B.teal}, ${B.magenta});
    box-shadow: 0 0 8px ${B.teal};
  }

  .nb-drawer-divider {
    height: 1px;
    margin: 10px 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 50%, transparent);
  }

  /* Drawer CTA */
  .nb-drawer-cta {
    position: relative;
    height: 50px; width: 100%;
    border: none; border-radius: 10px;
    cursor: pointer; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    animation: nbDrawerLinkIn 0.4s ease 0.32s both;
    box-shadow: 0 4px 20px rgba(0,191,165,0.2), inset 0 1px 0 rgba(255,255,255,0.15);
  }
  .nb-drawer-cta-bg {
    position: absolute; inset: 0; border-radius: 10px;
    background: linear-gradient(135deg, ${B.teal} 0%, #00897B 40%, ${B.magenta} 100%);
    background-size: 220% 220%;
  }
  .nb-drawer-cta-label {
    position: relative; z-index: 1;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: #000;
  }

  .nb-drawer-tagline {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8.5px; font-weight: 400;
    letter-spacing: 0.25em; text-transform: uppercase;
    color: rgba(255,255,255,0.18);
    text-align: center;
    margin: 6px 0 0;
    animation: nbDrawerLinkIn 0.4s ease 0.38s both;
  }

  /* Mobile backdrop */
  .nb-backdrop {
    position: fixed; inset: 0; z-index: -1;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }

  /* ── Responsive breakpoints ── */
  @media (max-width: 768px) {
    .nb-header     { height: 72px; padding-top: 6px; }
    .nb-nav        { height: 66px; padding: 0 clamp(16px, 4vw, 28px); justify-content: space-between; }
    .nb-links-wrap { display: none; }
    .nb-cta        { display: none; }
    .nb-burger     { display: flex; }
    .nb-logo       { margin-right: 0; }
    .nb-logo-img   { height: 40px; }
  }
  @media (max-width: 480px) {
    .nb-header   { height: 64px; padding-top: 4px; }
    .nb-nav      { height: 60px; }
    .nb-logo-img { height: 34px; }
  }
  @media (min-width: 769px) {
    .nb-drawer  { display: none; }
    .nb-backdrop{ display: none; }
  }
`;