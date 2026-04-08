import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// FloatingCTA — Glassmorphic 3D floating bar  (v2 — full rework)
//
// Props:
//   applicationDeadline  {string}   JS date string e.g. "2026-06-01"
//   applyUrl             {string}   href for the Apply button
//   onApply              {function} optional callback instead of href
// ─────────────────────────────────────────────────────────────────────────────

const B = {
  teal:    "#00BFA5",
  magenta: "#E91E8C",
  gold:    "#FFB300",
  dark:    "#060810",
};

function useCountdown(deadlineStr) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  if (!deadlineStr || deadlineStr === "TBA") return null;
  const diff = new Date(deadlineStr).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days:  Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    mins:  Math.floor((diff % 3_600_000)  /    60_000),
    secs:  Math.floor((diff %    60_000)  /     1_000),
  };
}

function pad(n) { return String(n).padStart(2, "0"); }

export default function FloatingCTA({
  applicationDeadline = "TBA",
  applyUrl            = "#apply",
  onApply,
}) {
  const [visible,  setVisible]  = useState(false);
  const [dismissed,setDismissed]= useState(false);
  const [tilt,     setTilt]     = useState({ rx:0, ry:0 });
  const [hovered,  setHovered]  = useState(false);
  const [btnPress, setBtnPress] = useState(false);
  const barRef  = useRef(null);
  const rafRef  = useRef(null);
  const countdown = useCountdown(applicationDeadline);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(id);
  }, []);

  const onMouseMove = useCallback((e) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = barRef.current;
      if (!el) return;
      const r  = el.getBoundingClientRect();
      const nx = (e.clientX - r.left)  / r.width  - 0.5;
      const ny = (e.clientY - r.top)   / r.height - 0.5;
      setTilt({ rx: -ny * 6, ry: nx * 10 });
    });
  }, []);

  const onMouseLeave = useCallback(() => {
    setHovered(false);
    setTilt({ rx:0, ry:0 });
  }, []);

  function handleApply() {
    setBtnPress(true);
    setTimeout(() => setBtnPress(false), 300);
    if (onApply) { onApply(); return; }
    window.open(applyUrl, "_blank", "noopener");
  }

  if (dismissed) return null;

  const transform = hovered
    ? `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(20px)`
    : `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;

  return (
    <>
      <style>{CSS}</style>

      <div
        className={`fcta-wrap ${visible ? "fcta-wrap--in" : ""}`}
        style={{ pointerEvents: visible ? "all" : "none" }}
      >
        {/* Multi-layer glow bloom underneath */}
        <div className="fcta-bloom-outer"/>
        <div className="fcta-bloom-inner" style={{ opacity: hovered ? 1 : 0.7 }}/>

        {/* 3D glass bar */}
        <div
          ref={barRef}
          className={`fcta-bar ${hovered ? "fcta-bar--hover" : ""}`}
          style={{
            transform,
            transition: hovered
              ? "transform 0.07s linear"
              : "transform 0.65s cubic-bezier(0.22,1,0.36,1)",
          }}
          onMouseMove={onMouseMove}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={onMouseLeave}
        >
          {/* ── Glass stack ── */}
          <div className="fcta-g-base"/>
          <div className="fcta-g-frost"/>
          <div className="fcta-g-top-highlight"/>
          <div className="fcta-g-bottom-shadow"/>

          {/* Animated effects */}
          <div className="fcta-beam"/>
          <div className="fcta-shimmer"/>
          <div className="fcta-rim-top"/>
          <div className="fcta-rim-bottom"/>

          {/* ── SECTION 1: Brand ── */}
          <div className="fcta-brand">
            {/* Circuit icon — larger, crisper */}
            <svg className="fcta-icon" width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <rect x="12" y="12" width="12" height="12" rx="2"
                stroke={B.teal} strokeWidth="1.4"
                fill="rgba(0,191,165,0.08)"
              />
              {/* Traces */}
              <line x1="18" y1="2"  x2="18" y2="12" stroke={B.teal}    strokeWidth="1.1" strokeDasharray="3 2.5" strokeLinecap="round"/>
              <line x1="18" y1="24" x2="18" y2="34" stroke={B.teal}    strokeWidth="1.1" strokeDasharray="3 2.5" strokeLinecap="round"/>
              <line x1="2"  y1="18" x2="12" y2="18" stroke={B.magenta} strokeWidth="1.1" strokeDasharray="3 2.5" strokeLinecap="round"/>
              <line x1="24" y1="18" x2="34" y2="18" stroke={B.magenta} strokeWidth="1.1" strokeDasharray="3 2.5" strokeLinecap="round"/>
              {/* End pads */}
              <circle cx="18" cy="2"  r="2" fill={B.teal}    className="fcta-dot-a"/>
              <circle cx="18" cy="34" r="2" fill={B.teal}    opacity="0.5"/>
              <circle cx="2"  cy="18" r="2" fill={B.magenta} className="fcta-dot-b"/>
              <circle cx="34" cy="18" r="2" fill={B.magenta} opacity="0.5"/>
              {/* Centre glow */}
              <circle cx="18" cy="18" r="3" fill={B.teal} opacity="0.5" className="fcta-dot-a" style={{animationDuration:"3s"}}/>
            </svg>

            <div className="fcta-brand-text">
              <span className="fcta-programme">iPD-CP</span>
              <span className="fcta-institute">IIIT Delhi · Intensive Product Development</span>
            </div>
          </div>

          {/* Divider */}
          <div className="fcta-divider"/>

          {/* ── SECTION 2: Deadline ── */}
          <div className="fcta-deadline">
            <span className="fcta-dl-eyebrow" style={{ color: '#FFB300' }}>Regular Application Open Till</span>

            <div className="fcta-tba-wrap">
              <span className="fcta-tba-dot"/>
              <span className="fcta-tba">27 April 2026</span>
            </div>
          </div>

          {/* Divider */}
          <div className="fcta-divider"/>

          {/* ── SECTION 3: CTA ── */}
          <div className="fcta-action">
            <button
              className={`fcta-btn ${btnPress ? "fcta-btn--press" : ""}`}
              onClick={handleApply}
              aria-label="Register for iPD-CP"
            >
              <span className="fcta-btn-bg"/>
              <span className="fcta-btn-sheen"/>
              <span className="fcta-btn-content">
                <span className="fcta-btn-text">Register for iPD-CP</span>
                <svg className="fcta-btn-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>

            <button className="fcta-close" onClick={() => setDismissed(true)} aria-label="Dismiss">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&family=Montserrat:wght@800;900&display=swap');

  /* ── Keyframes ── */
  @keyframes fctaRise {
    0%   { transform: translateX(-50%) translateY(110%) scale(0.96); opacity:0; filter:blur(16px); }
    55%  { filter:blur(0); }
    100% { transform: translateX(-50%) translateY(0)    scale(1);    opacity:1; }
  }
  @keyframes fctaBeamMove {
    0%   { left:-50%; opacity:0; }
    8%   { opacity:1; }
    92%  { opacity:1; }
    100% { left:110%; opacity:0; }
  }
  @keyframes fctaShimmerMove {
    0%   { transform:translateX(-130%) skewX(-15deg); opacity:0; }
    12%  { opacity:1; }
    88%  { opacity:1; }
    100% { transform:translateX(260%) skewX(-15deg); opacity:0; }
  }
  @keyframes fctaDotPulseA {
    0%,100% { opacity:1; r:2; }
    50%     { opacity:0; r:3.5; }
  }
  @keyframes fctaDotPulseB {
    0%,100% { opacity:1; r:2; }
    50%     { opacity:0; r:3.5; }
  }
  @keyframes fctaGradShift {
    0%,100% { background-position:0% 50%;   }
    50%     { background-position:100% 50%; }
  }
  @keyframes fctaDigitIn {
    0%  { transform:translateY(10px);  opacity:0; }
    100%{ transform:translateY(0);     opacity:1; }
  }
  @keyframes fctaBtnRipple {
    0%   { box-shadow: 0 0 0 0px rgba(0,191,165,0.65), 0 10px 32px rgba(0,191,165,0.4), 0 20px 48px rgba(0,0,0,0.5); }
    100% { box-shadow: 0 0 0 16px rgba(0,191,165,0),   0 10px 32px rgba(0,191,165,0.4), 0 20px 48px rgba(0,0,0,0.5); }
  }
  @keyframes fctaBloomPulse {
    0%,100% { opacity:0.8; transform:scale(1); }
    50%     { opacity:1;   transform:scale(1.05); }
  }
  @keyframes fctaTbaBlink {
    0%,100% { opacity:1; }
    50%     { opacity:0.3; }
  }

  /* ── Wrapper ── */
  .fcta-wrap {
    position: fixed;
    bottom: 22px;
    left: 50%;
    transform: translateX(-50%) translateY(120%);
    z-index: 9999;
    width: min(980px, calc(100vw - 28px));
    pointer-events: none;
  }
  .fcta-wrap--in {
    transform: translateX(-50%) translateY(0);
    pointer-events: all;
    animation: fctaRise 1s cubic-bezier(0.22,1,0.36,1) both;
  }

  /* ── Bloom layers ── */
  .fcta-bloom-outer {
    position: absolute;
    inset: -32px -16px;
    border-radius: 40px;
    background: radial-gradient(ellipse 80% 60% at 50% 115%,
      rgba(0,191,165,0.18) 0%,
      rgba(233,30,140,0.09) 50%,
      transparent 72%
    );
    filter: blur(24px);
    pointer-events: none;
    animation: fctaBloomPulse 6s ease-in-out infinite;
  }
  .fcta-bloom-inner {
    position: absolute;
    inset: -8px -4px;
    border-radius: 28px;
    background: radial-gradient(ellipse 60% 40% at 50% 110%,
      rgba(0,191,165,0.28) 0%,
      transparent 65%
    );
    filter: blur(10px);
    pointer-events: none;
    transition: opacity 0.4s ease;
  }

  /* ── Bar shell ── */
  .fcta-bar {
    position: relative;
    width: 100%;
    height: 80px;
    border-radius: 20px;
    overflow: hidden;
    display: grid;
    grid-template-columns: 1fr auto 1fr auto auto;
    align-items: center;
    gap: 0;
    padding: 0 clamp(16px, 2.8vw, 32px);
    will-change: transform;
    transform-style: preserve-3d;

    /* Stronger drop shadow for real levitation */
    box-shadow:
      0 0   0  1px  rgba(0,191,165,0.22),
      0 2px 0  1px  rgba(255,255,255,0.06),
      0 6px 20px    rgba(0,191,165,0.15),
      0 16px 40px   rgba(0,0,0,0.65),
      0 32px 64px   rgba(0,0,0,0.45),
      inset 0 1px 0 rgba(255,255,255,0.14),
      inset 0 -1px 0 rgba(0,0,0,0.4);
    transition: box-shadow 0.4s ease;
  }
  .fcta-bar--hover {
    box-shadow:
      0 0   0  1px  rgba(0,191,165,0.40),
      0 2px 0  1px  rgba(255,255,255,0.09),
      0 8px 24px    rgba(0,191,165,0.28),
      0 20px 52px   rgba(0,0,0,0.60),
      0 36px 72px   rgba(0,0,0,0.40),
      0 0  100px    rgba(233,30,140,0.08),
      inset 0 1px 0 rgba(255,255,255,0.20),
      inset 0 -1px 0 rgba(0,0,0,0.5);
  }

  /* ── Glass layers ── */

  /* Base — dark enough so text is legible */
  .fcta-g-base {
    position: absolute; inset: 0; border-radius: 20px;
    background:
      linear-gradient(135deg,
        rgba(6,8,16,0.82) 0%,
        rgba(0,30,26,0.78) 40%,
        rgba(6,8,16,0.80) 100%
      );
    backdrop-filter: blur(32px) saturate(180%) brightness(1.05);
    -webkit-backdrop-filter: blur(32px) saturate(180%) brightness(1.05);
    border: 1px solid rgba(255,255,255,0.09);
    pointer-events: none;
  }
  /* Frost — subtle coloured inner tint */
  .fcta-g-frost {
    position: absolute; inset: 1px; border-radius: 19px;
    background: linear-gradient(120deg,
      rgba(0,191,165,0.06) 0%,
      transparent 45%,
      rgba(233,30,140,0.04) 100%
    );
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    pointer-events: none;
  }
  /* Top-face highlight — sells the 3D thickness */
  .fcta-g-top-highlight {
    position: absolute;
    left: 6%; right: 6%; top: 0;
    height: 44%;
    border-radius: 0 0 55% 55%;
    background: linear-gradient(to bottom,
      rgba(255,255,255,0.11) 0%,
      rgba(255,255,255,0.02) 60%,
      transparent 100%
    );
    pointer-events: none;
  }
  /* Bottom edge darkening */
  .fcta-g-bottom-shadow {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 35%;
    border-radius: 0 0 20px 20px;
    background: linear-gradient(to top, rgba(0,0,0,0.25), transparent);
    pointer-events: none;
  }

  /* Top rim — bright glass edge */
  .fcta-rim-top {
    position: absolute; top: 0; left: 4%; right: 4%; height: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(255,255,255,0.5) 25%,
      rgba(0,191,165,0.7)   50%,
      rgba(255,255,255,0.5) 75%,
      transparent 100%
    );
    pointer-events: none;
  }
  /* Bottom rim */
  .fcta-rim-bottom {
    position: absolute; bottom: 0; left: 8%; right: 8%; height: 1px;
    background: linear-gradient(90deg,
      transparent,
      rgba(0,191,165,0.15) 50%,
      transparent
    );
    pointer-events: none;
  }
  /* Animated beam on top rim */
  .fcta-beam {
    position: absolute; top: 0; left: -50%; width: 40%; height: 1.5px;
    background: linear-gradient(90deg, transparent, ${B.teal}, ${B.magenta}, transparent);
    pointer-events: none;
    animation: fctaBeamMove 5s ease-in-out infinite;
  }
  /* Diagonal shimmer sweep */
  .fcta-shimmer {
    position: absolute; top: 0; bottom: 0; left: 0; width: 30%;
    background: linear-gradient(105deg,
      transparent 0%,
      rgba(255,255,255,0.03) 35%,
      rgba(255,255,255,0.07) 50%,
      rgba(255,255,255,0.03) 65%,
      transparent 100%
    );
    pointer-events: none;
    animation: fctaShimmerMove 6s ease-in-out infinite;
    animation-delay: 2.5s;
  }

  /* ── Divider ── */
  .fcta-divider {
    width: 1px;
    height: 40px;
    background: linear-gradient(to bottom,
      transparent,
      rgba(255,255,255,0.12) 30%,
      rgba(0,191,165,0.2)    50%,
      rgba(255,255,255,0.12) 70%,
      transparent
    );
    flex-shrink: 0;
    margin: 0 clamp(12px, 2vw, 24px);
    position: relative;
    z-index: 2;
  }

  /* ── Section 1: Brand ── */
  .fcta-brand {
    display: flex;
    align-items: center;
    gap: 13px;
    position: relative;
    z-index: 2;
  }
  .fcta-icon { flex-shrink:0; }
  .fcta-dot-a { animation: fctaDotPulseA 2.2s ease-in-out infinite; }
  .fcta-dot-b { animation: fctaDotPulseB 2.2s ease-in-out infinite 0.5s; }

  .fcta-brand-text {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .fcta-programme {
    font-family: 'Montserrat', sans-serif;
    font-size: 17px;
    font-weight: 900;
    letter-spacing: 0.06em;
    color: #fff;
    line-height: 1;
    text-shadow: 0 0 20px rgba(0,191,165,0.35);
  }
  .fcta-institute {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5px;
    font-weight: 400;
    letter-spacing: 0.08em;
    color: rgba(255,255,255,0.50);
    white-space: nowrap;
  }

  /* ── Section 2: Deadline ── */
  .fcta-deadline {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    position: relative;
    z-index: 2;
    flex: 1;
    min-width: 0;
  }
  .fcta-dl-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.42em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
  }
  /* Countdown */
  .fcta-countdown {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .fcta-unit-group {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  /* Glass pill per digit */
  .fcta-unit-pill {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.13);
    border-top-color: rgba(255,255,255,0.22);
    border-radius: 7px;
    padding: 3px 9px 4px;
    min-width: 36px;
    text-align: center;
    position: relative;
    overflow: hidden;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.14),
      0 3px 10px rgba(0,0,0,0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  /* Pill top-face shine */
  .fcta-unit-pill::after {
    content: '';
    position: absolute;
    top: 0; left: 10%; right: 10%; height: 45%;
    background: linear-gradient(to bottom, rgba(255,255,255,0.10), transparent);
    border-radius: 0 0 50% 50%;
    pointer-events: none;
  }
  .fcta-unit-n {
    font-family: 'JetBrains Mono', monospace;
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    display: block;
    animation: fctaDigitIn 0.25s ease both;
  }
  .fcta-unit-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 7px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
  }
  .fcta-sep {
    font-family: 'JetBrains Mono', monospace;
    font-size: 18px;
    font-weight: 700;
    color: rgba(255,255,255,0.18);
    line-height: 1;
    margin: 0 -2px;
    padding-bottom: 8px;
    align-self: flex-start;
  }

  /* TBA state */
  .fcta-tba-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .fcta-tba-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: ${B.gold};
    box-shadow: 0 0 8px ${B.gold}, 0 0 16px rgba(255,179,0,0.5);
    animation: fctaTbaBlink 1.5s ease-in-out infinite;
    flex-shrink: 0;
  }
  .fcta-tba {
    font-family: 'Montserrat', sans-serif;
    font-size: 13px;
    font-weight: 800;
    color: ${B.gold};
    letter-spacing: 0.07em;
    text-shadow: 0 0 20px rgba(255,179,0,0.5), 0 0 40px rgba(255,179,0,0.25);
  }

  /* ── Section 3: Action ── */
  .fcta-action {
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    z-index: 2;
  }

  /* CTA Button */
  .fcta-btn {
    position: relative;
    height: 46px;
    padding: 0 26px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    outline: none;
    transform-style: preserve-3d;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
    box-shadow:
      0 1px 0 rgba(255,255,255,0.25),
      0 4px 16px rgba(0,191,165,0.35),
      0 10px 28px rgba(0,0,0,0.45),
      inset 0 1px 0 rgba(255,255,255,0.28),
      inset 0 -2px 0 rgba(0,0,0,0.22);
  }
  /* Animated gradient bg */
  .fcta-btn-bg {
    position: absolute; inset: 0; border-radius: 12px;
    background: linear-gradient(
      135deg,
      ${B.teal}    0%,
      #009e87      30%,
      ${B.magenta} 100%
    );
    background-size: 260% 260%;
    animation: fctaGradShift 4s ease infinite;
  }
  /* Sheen sweep on hover */
  .fcta-btn-sheen {
    position: absolute;
    top: 0; left: -80%; width: 55%; height: 100%;
    background: linear-gradient(105deg,
      transparent,
      rgba(255,255,255,0.22) 50%,
      transparent
    );
    pointer-events: none;
    transition: left 0.5s ease;
  }
  .fcta-btn:hover .fcta-btn-sheen { left: 140%; }

  .fcta-btn-content {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 9px;
  }
  .fcta-btn-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #000;
    white-space: nowrap;
  }
  .fcta-btn-arrow {
    flex-shrink: 0;
    color: #000;
    transition: transform 0.2s ease;
  }
  .fcta-btn:hover {
    transform: translateY(-3px) translateZ(10px);
    box-shadow:
      0 1px 0 rgba(255,255,255,0.3),
      0 8px 28px rgba(0,191,165,0.5),
      0 18px 44px rgba(0,0,0,0.5),
      0 0 50px rgba(233,30,140,0.15),
      inset 0 1px 0 rgba(255,255,255,0.32),
      inset 0 -2px 0 rgba(0,0,0,0.28);
  }
  .fcta-btn:hover .fcta-btn-arrow { transform: translateX(4px); }
  .fcta-btn--press,
  .fcta-btn:active {
    transform: translateY(1px) scale(0.97);
    animation: fctaBtnRipple 0.5s ease forwards;
  }

  /* Close button */
  .fcta-close {
    width: 30px; height: 30px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 8px;
    color: rgba(255,255,255,0.28);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: all 0.22s ease;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  .fcta-close:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.22);
    color: rgba(255,255,255,0.7);
    transform: rotate(90deg);
  }

  /* ══════════════════════════════════════════════════════
     RESPONSIVE — 4 breakpoints
     ≥ 900px   Desktop   : Brand | Divider | Deadline | Divider | Action
       768–899 Tablet    : Brand | Deadline | Action  (no dividers, compressed)
       480–767 Mobile    : Brand (icon hidden) | Action stacked below
       < 480   XS Mobile : Full-width pill — logo text + button only
     ══════════════════════════════════════════════════════ */

  /* ── Tablet  768–899px ── */
  @media (max-width: 899px) {
    .fcta-wrap  { width: calc(100vw - 24px); bottom: 16px; }
    .fcta-bar   {
      height: 72px;
      border-radius: 18px;
      grid-template-columns: auto 1fr auto;
      padding: 0 20px;
      gap: 0;
    }
    /* Hide dividers on tablet — too cramped */
    .fcta-divider { display: none; }

    /* Brand shrinks */
    .fcta-brand   { gap: 10px; }
    .fcta-institute { display: none; }
    .fcta-programme { font-size: 15px; }

    /* Deadline goes centred in the flex-1 col */
    .fcta-deadline {
      padding: 0 12px;
    }
    .fcta-dl-eyebrow { font-size: 7px; letter-spacing: 0.3em; }
    .fcta-unit-pill  { min-width: 28px; padding: 2px 6px 3px; }
    .fcta-unit-n     { font-size: 14px; }
    .fcta-sep        { font-size: 14px; }
    .fcta-tba        { font-size: 11px; }

    /* Button compact */
    .fcta-btn      { height: 40px; padding: 0 16px; }
    .fcta-btn-text { font-size: 9.5px; letter-spacing: 0.18em; }
  }

  /* ── Mobile  480–767px ── */
  @media (max-width: 767px) {
    .fcta-wrap { width: calc(100vw - 20px); bottom: 14px; }
    .fcta-bar  {
      height: auto;
      min-height: 64px;
      border-radius: 16px;
      /* Two-row layout: top row = brand + close, bottom row = button */
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding: 12px 16px;
      gap: 10px;
    }

    /* Hide deadline section entirely on mobile */
    .fcta-deadline { display: none; }
    .fcta-divider  { display: none; }

    /* Top row: brand left, close right */
    .fcta-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
    }
    .fcta-icon { width: 26px; height: 26px; }
    .fcta-programme  { font-size: 14px; letter-spacing: 0.04em; }
    .fcta-institute  { display: none; }

    /* Bottom row: button full-width */
    .fcta-action {
      width: 100%;
      gap: 8px;
    }
    .fcta-btn {
      flex: 1;           /* stretch to fill */
      height: 42px;
      padding: 0 16px;
      border-radius: 10px;
    }
    .fcta-btn-text {
      font-size: 10px;
      letter-spacing: 0.18em;
    }

    /* Close sits in action row at the end */
    .fcta-close {
      width: 42px; height: 42px;
      border-radius: 10px;
      flex-shrink: 0;
    }

    /* Bloom scale down */
    .fcta-bloom-outer { inset: -16px -8px; }
    .fcta-bloom-inner { inset: -4px -2px; }
  }

  /* ── XS Mobile  < 480px ── */
  @media (max-width: 479px) {
    .fcta-wrap { width: calc(100vw - 16px); bottom: 10px; }
    .fcta-bar  {
      border-radius: 14px;
      padding: 10px 14px;
      gap: 8px;
    }

    /* Single row on very small: icon gone, just text + button */
    .fcta-bar {
      flex-direction: row;
      align-items: center;
      min-height: 56px;
    }
    .fcta-brand {
      flex: 1;
      min-width: 0;
    }
    .fcta-icon { display: none; }
    .fcta-brand-text { gap: 1px; }
    .fcta-programme {
      font-size: 13px;
      letter-spacing: 0.03em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .fcta-institute { display: none; }

    /* Action row collapses icon, shrinks button */
    .fcta-action {
      width: auto;
      flex-shrink: 0;
    }
    .fcta-btn {
      height: 38px;
      padding: 0 12px;
      flex: none;
    }
    .fcta-btn-text   { font-size: 9px; letter-spacing: 0.12em; }
    .fcta-btn-arrow  { display: none; }   /* arrow hidden at xs, saves space */
    .fcta-close {
      width: 36px; height: 36px;
      border-radius: 8px;
    }

    /* Tilt disabled on touch — no hover events anyway */
  }
`;