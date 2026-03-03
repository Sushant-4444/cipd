import { useEffect, useRef, useState } from "react";

// ─── Brand palette (matches CiPDHero) ────────────────────────────────────────
const B = {
  teal:    "#00BFA5",
  magenta: "#E91E8C",
  purple:  "#7B2D8B",
  navy:    "#0A0A16",
  charcoal:"#0D0D18",
  white:   "#FFFFFF",
  dim:     "rgba(255,255,255,0.42)",
  dimLow:  "rgba(255,255,255,0.22)",
};

// ─── Scroll sequence data (5 slides × 20% each) ──────────────────────────────
const SLIDES = [
  {
    pct:     [0, 20],
    isTitle: true,
    heading: "What is\nCiPD?",
    color:   "gradient",
    body:    null,
    sub:     "Scroll to explore",
    glow:    "rgba(0,191,165,0.10)",
    ipdcp:   false,
  },
  {
    pct:     [21, 40],
    heading: "THE HUB OF\nINNOVATION",
    color:   B.teal,
    body:    "The Centre for Intelligent Product Development (CiPD) at IIIT Delhi is where independent ideas transform into advanced market solutions.",
    sub:     "Reducing design costs. Minimizing risks. Maximizing impact.",
    glow:    "rgba(0,191,165,0.13)",
    ipdcp:   false,
  },
  {
    pct:     [41, 60],
    heading: "MAKING INDIA A\nPRODUCT NATION",
    color:   B.magenta,
    body:    "We are on a mission to nurture a sustainable ecosystem that increases the pace of global product development.",
    sub:     "Globally competitive. Locally designed. Built for the future.",
    glow:    "rgba(233,30,140,0.11)",
    ipdcp:   false,
  },
  {
    pct:     [61, 80],
    heading: "WORLD-CLASS\nMENTORSHIP",
    color:   B.white,
    body:    "Work at the intersection of IIIT Delhi's elite faculty and top-tier industry leaders.",
    sub:     "Exposure to the latest trends, research, and high-performance product engineering.",
    glow:    "rgba(255,255,255,0.06)",
    ipdcp:   false,
  },
  {
    pct:     [81, 100],
    heading: "A PATHWAY\nTO MASTERY",
    color:   "gradient",
    body:    "All this expertise culminates into one rigorous, high-stakes experience...",
    sub:     "The doors to",
    ipdcpWord: "iPD-CP",
    subAfter:  "are about to open. Are you ready for the deep dive?",
    glow:    "rgba(0,191,165,0.15)",
    ipdcp:   true,
  },
];

// ─── How many "scroll pages" to pin for (multiplied by 100vh) ────────────────
const SCROLL_MULTIPLIER = 5; // 5 × 100vh total scroll distance

export default function CiPDScrollStory() {
  const containerRef  = useRef(null);
  const stickyRef     = useRef(null);
  const [progress, setProgress] = useState(0); // 0–1 across entire scroll zone
  const [mounted,  setMounted]  = useState(false);
  const [atTop,    setAtTop]    = useState(true);

  // Font injection
  useEffect(() => {
    const l = document.createElement("link");
    l.rel  = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Barlow:wght@300;400&family=JetBrains+Mono:wght@300;400&display=swap";
    document.head.appendChild(l);
    setMounted(true);
    return () => document.head.removeChild(l);
  }, []);

  // Scroll listener — maps container scroll offset → 0..1
  useEffect(() => {
    function onScroll() {
      const el = containerRef.current;
      if (!el) return;
      // rect.top is negative once we've scrolled past the top of ss-outer
      const rect    = el.getBoundingClientRect();
      const total   = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      // only track progress once ss-outer is in view (rect.top <= 0)
      if (rect.top > 0) { setProgress(0); setAtTop(window.scrollY < 10); return; }
      setProgress(Math.min(1, Math.max(0, scrolled / total)));
      setAtTop(window.scrollY < 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Which slide is active (0–3) based on progress percentage
  const pct         = progress * 100;
  const activeIdx   = SLIDES.findIndex(s => pct >= s.pct[0] && pct <= s.pct[1]);
  const safeIdx     = activeIdx === -1 ? (pct > 80 ? 4 : 0) : activeIdx;

  const slide = SLIDES[safeIdx];

  if (!mounted) return null;

  return (
    <>
      <style>{styles(B)}</style>
      {/* Outer container — tall enough to scroll through */}
      <div
        ref={containerRef}
        className="ss-outer"
        style={{ height: `${SCROLL_MULTIPLIER * 100}vh` }}
      >
        {/* Sticky viewport */}
        <div ref={stickyRef} className="ss-sticky">

          {/* Background canvas */}
          <Canvas glow={slide.glow} idx={safeIdx} />

          {/* Progress bar */}
          <div className="ss-prog-track">
            <div className="ss-prog-fill" style={{ width: `${progress * 100}%` }} />
          </div>

          {/* Step indicators — only show for slides 1-4, not title */}
          {safeIdx > 0 && (
            <div className="ss-steps">
              {SLIDES.slice(1).map((s, i) => {
                const si = i + 1; // real slide index
                return (
                  <div key={si} className={`ss-step ${si === safeIdx ? "on" : si < safeIdx ? "done" : ""}`}>
                    <div className="ss-step-dot" style={si <= safeIdx ? { background: si === 4 ? `linear-gradient(135deg,${B.teal},${B.magenta})` : SLIDES[si].color } : {}} />
                    <span className="ss-step-num">{String(i+1).padStart(2,"0")}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Main text content */}
          <div className="ss-stage">
            {SLIDES.map((s, i) => {
              const isActive = i === safeIdx;
              const isPrev   = i < safeIdx;
              return (
                <div
                  key={i}
                  className="ss-frame"
                  style={{
                    opacity:   isActive ? 1 : 0,
                    transform: isActive
                      ? "translateY(0)"
                      : isPrev
                        ? "translateY(-48px)"
                        : "translateY(48px)",
                    pointerEvents: isActive ? "auto" : "none",
                    transition: "opacity .65s cubic-bezier(.16,1,.3,1), transform .65s cubic-bezier(.16,1,.3,1)",
                  }}
                >
                  {/* ── Title slide (slide 0) ── */}
                  {s.isTitle ? (
                    <div className="ss-title-frame">
                      <span className="ss-title-eyebrow">02 — About CiPD</span>
                      <h2 className="ss-title-heading">
                        What is{" "}
                        <span className="ss-title-accent">CiPD</span>?
                      </h2>
                      <div className="ss-title-line" />
                      <p className="ss-title-sub">Scroll to explore</p>
                    </div>
                  ) : (
                    <>
                      {/* eyebrow */}
                      <div className="ss-eyebrow" style={{ color: s.color === "gradient" ? B.teal : s.color }}>
                        {String(i).padStart(2,"0")} / 04
                      </div>

                      {/* heading */}
                      <h2
                        className="ss-heading"
                        style={
                          s.color === "gradient"
                            ? {
                                background: `linear-gradient(135deg,${B.teal} 0%,${B.purple} 50%,${B.magenta} 100%)`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                              }
                            : { color: s.color }
                        }
                      >
                        {s.heading}
                      </h2>

                      {/* accent line */}
                      <div
                        className="ss-line"
                        style={{
                          background: s.color === "gradient"
                            ? `linear-gradient(90deg,${B.teal},${B.magenta})`
                            : `linear-gradient(90deg,${s.color},transparent)`,
                        }}
                      />

                      {/* body text */}
                      {s.body && <p className="ss-body">{s.body}</p>}

                      {/* subtext */}
                      {!s.ipdcp && (
                        <p className="ss-sub">{s.sub}</p>
                      )}

                      {/* slide 5 — iPD-CP cliffhanger */}
                      {s.ipdcp && (
                        <>
                          <p className="ss-sub ss-sub-ipdcp">
                            {s.sub}{" "}
                            <span className="ss-ipdcp">{s.ipdcpWord}</span>
                            {" "}{s.subAfter}
                          </p>
                          <div className="ss-ipdcp-hint">
                            <span className="ss-hint-dot" />
                            <span className="ss-hint-text">Something is coming</span>
                            <span className="ss-hint-dot" />
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* iPD-CP fullscreen scale-up — triggers at 100% scroll */}
          <div
            className="ss-ipdcp-fullscreen"
            style={{
              opacity:   progress > 0.96 ? 1 : 0,
              transform: `scale(${progress > 0.96 ? 1 + (progress - 0.96) * 60 : 0.8})`,
              pointerEvents: progress > 0.96 ? "none" : "none",
              transition: progress > 0.96 ? "opacity .3s ease, transform .6s cubic-bezier(.16,1,.3,1)" : "none",
            }}
          >
            iPD-CP
          </div>

          {/* Scroll nudge (visible on first slide, fades out) */}
          <div className="ss-scroll-hint" style={{ opacity: progress < 0.1 ? 0.5 : 0 }}>
            <div className="ss-scroll-line" />
            <span>scroll</span>
          </div>

          {/* Scroll-up-to-go-back hint — only visible when at top */}
          <div className={`ss-back-hint ${atTop ? "visible" : ""}`}>
            <div className="ss-back-arrow">↑</div>
            <span>scroll up to go back</span>
          </div>

        </div>
      </div>
    </>
  );
}

// ─── Animated circuit-trace SVG background ────────────────────────────────────
function Canvas({ glow, idx }) {
  return (
    <div className="ss-canvas">
      {/* subtle circuit grid SVG */}
      <svg
        className="ss-grid"
        width="100%" height="100%"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
          </pattern>
          <pattern id="dots" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="1" fill="rgba(255,255,255,0.07)" />
          </pattern>
          {/* circuit traces */}
          <filter id="glow-filter">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#dots)" />
        {/* circuit trace lines */}
        <g opacity="0.12" filter="url(#glow-filter)">
          <polyline points="0,180 120,180 120,320 300,320 300,180 520,180 520,420 800,420"
            fill="none" stroke="#00BFA5" strokeWidth="1"/>
          <polyline points="100%,250 900,250 900,100 700,100 700,350 500,350"
            fill="none" stroke="#E91E8C" strokeWidth="1"/>
          <polyline points="200,0 200,150 450,150 450,80 700,80"
            fill="none" stroke="#7B2D8B" strokeWidth="1"/>
          <polyline points="0,500 180,500 180,380 360,380 360,480 600,480 600,350"
            fill="none" stroke="#00BFA5" strokeWidth="0.7"/>
          <circle cx="120" cy="180" r="3" fill="#00BFA5"/>
          <circle cx="300" cy="320" r="3" fill="#00BFA5"/>
          <circle cx="520" cy="180" r="3" fill="#00BFA5"/>
          <circle cx="700" cy="100" r="3" fill="#E91E8C"/>
          <circle cx="450" cy="150" r="3" fill="#7B2D8B"/>
          <circle cx="360" cy="380" r="3" fill="#00BFA5"/>
        </g>
      </svg>

      {/* ambient glow blob that shifts per slide */}
      <div
        className="ss-glow-blob"
        style={{
          background: `radial-gradient(ellipse at center, ${glow} 0%, transparent 68%)`,
          transition: "background 1s ease",
        }}
      />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function styles(B) { return `
  @keyframes ssLineGrow   { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  @keyframes ssDrop       { 0%{top:-100%} 100%{top:200%} }
  @keyframes ssShift      { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes ssTracePulse { 0%,100%{opacity:.08} 50%{opacity:.18} }
  @keyframes ssDotBlink   { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }
  @keyframes ssBackBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
  @keyframes ssIpdcpPulse {
    0%,100% { text-shadow: 0 0 12px rgba(0,191,165,.5), 0 0 30px rgba(0,191,165,.2); filter: blur(0px); }
    50%     { text-shadow: 0 0 24px rgba(233,30,140,.8), 0 0 55px rgba(233,30,140,.4); filter: blur(.5px); }
  }
  @keyframes ssIpdcpShift {
    0%,100% { background-position: 0% 50%; }
    50%     { background-position: 100% 50%; }
  }


  @media (max-width: 768px) {
  }
  @media (max-width: 480px) {
  }

  .ss-outer  { position: relative; width: 100%; }

  .ss-sticky {
    position: sticky; top: 0;
    height: 100vh; width: 100%;
    overflow: hidden;
    background: ${B.charcoal};
    font-family: 'Barlow', sans-serif;
  }

  /* ── canvas ── */
  .ss-canvas    { position: absolute; inset: 0; pointer-events: none; }
  .ss-grid      { position: absolute; inset: 0; animation: ssTracePulse 6s ease-in-out infinite; }
  .ss-glow-blob { position: absolute; inset: -20%; border-radius: 50%; pointer-events: none; }

  /* ── progress bar ── */
  .ss-prog-track { position:absolute; bottom:0; left:0; right:0; height:2px; background:rgba(255,255,255,.07); z-index:10; }
  .ss-prog-fill  { height:100%; background:linear-gradient(90deg,${B.teal},${B.magenta}); transition:width .1s linear; }

  /* ── step indicators ── */
  .ss-steps { position:absolute; right:clamp(16px,3vw,44px); top:50%; transform:translateY(-50%); display:flex; flex-direction:column; gap:20px; z-index:10; }
  .ss-step  { display:flex; align-items:center; gap:8px; opacity:.3; transition:opacity .4s; flex-direction:row-reverse; }
  .ss-step.on   { opacity:1; }
  .ss-step.done { opacity:.5; }
  .ss-step-dot  { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,.25); transition:background .4s,transform .3s; }
  .ss-step.on .ss-step-dot { transform:scale(1.4); }
  .ss-step-num  { font-size:9px; letter-spacing:.3em; color:rgba(255,255,255,.4); font-weight:300; }
  @media (max-width:600px) { .ss-steps { display:none; } }

  /* ── stage & frames ── */
  .ss-stage { position:absolute; inset:0; z-index:5; }

  .ss-frame {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; justify-content: center;
    padding: 80px clamp(28px, 8vw, 120px);
    will-change: opacity, transform;
  }

  /* ── Title slide (slide 0) ── */
  .ss-title-frame {
    display: flex; flex-direction: column;
    justify-content: center;
    height: 100%;
  }
  .ss-title-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; letter-spacing: .42em; font-weight: 300;
    text-transform: uppercase; color: #00BFA5;
    margin-bottom: 24px; display: block;
  }
  .ss-title-heading {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(60px, 10vw, 140px);
    font-weight: 900; line-height: .9;
    letter-spacing: -.02em; color: #fff;
    margin: 0; white-space: pre-line;
  }
  .ss-title-accent {
    background: linear-gradient(135deg, #00BFA5 0%, #7B2D8B 50%, #E91E8C 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .ss-title-line {
    width: 64px; height: 3px; border-radius: 2px;
    background: linear-gradient(90deg, #00BFA5, #E91E8C);
    margin: 28px 0 20px;
  }
  .ss-title-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; letter-spacing: .35em;
    text-transform: uppercase; color: rgba(255,255,255,.28);
    font-weight: 300; margin: 0;
    display: flex; align-items: center; gap: 10px;
  }
  .ss-title-sub::before {
    content: ''; display: inline-block;
    width: 20px; height: 1px; background: rgba(255,255,255,.25);
  }
  @media (max-width: 768px) {
    .ss-title-heading { font-size: clamp(48px, 12vw, 80px); }
  }
  @media (max-width: 480px) {
    .ss-title-heading { font-size: clamp(38px, 14vw, 60px); }
  }

  /* ── eyebrow ── */
  .ss-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; letter-spacing: .42em; font-weight: 300;
    text-transform: uppercase; margin-bottom: 18px;
    transition: color .4s;
  }

  /* ── heading ── */
  .ss-heading {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(36px, 6vw, 92px);
    font-weight: 900; line-height: .93;
    letter-spacing: -.01em; white-space: pre-line;
    margin: 0; max-width: 680px;
  }

  /* ── accent line ── */
  .ss-line {
    height: 3px; width: 56px; border-radius: 2px;
    margin: 20px 0 24px;
    transform-origin: left;
    animation: ssLineGrow .5s cubic-bezier(.16,1,.3,1) both;
  }

  /* ── body text ── */
  .ss-body {
    font-family: 'Barlow', sans-serif;
    font-size: clamp(15px, 1.4vw, 19px);
    font-weight: 300; color: rgba(255,255,255,.72);
    line-height: 1.75; max-width: 560px;
    margin: 0 0 16px;
  }

  /* ── subtext — monospace, engineering lab feel ── */
  .ss-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(11px, 1vw, 13px);
    font-weight: 300; color: rgba(255,255,255,.38);
    line-height: 1.7; max-width: 540px;
    letter-spacing: .04em;
    border-left: 2px solid rgba(255,255,255,.1);
    padding-left: 14px;
    margin: 0;
  }

  /* slide 4 subtext — no border, inline with iPD-CP word */
  .ss-sub-ipdcp {
    border-left: none; padding-left: 0;
    color: rgba(255,255,255,.5);
    font-size: clamp(12px, 1.1vw, 15px);
  }

  /* ── iPD-CP glowing word ── */
  .ss-ipdcp {
    display: inline;
    font-family: 'Montserrat', sans-serif;
    font-weight: 900; letter-spacing: .08em;
    font-size: 1.15em;
    background: linear-gradient(135deg, ${B.teal}, ${B.purple}, ${B.magenta});
    background-size: 200% 200%;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ssIpdcpPulse 2.6s ease-in-out infinite, ssIpdcpShift 4s ease infinite;
    cursor: default;
  }

  /* ── hint dots ── */
  .ss-ipdcp-hint { display:flex; align-items:center; gap:10px; margin-top:28px; }
  .ss-hint-dot   { display:inline-block; width:5px; height:5px; border-radius:50%; background:linear-gradient(135deg,${B.teal},${B.magenta}); animation:ssDotBlink 1.6s ease-in-out infinite; }
  .ss-hint-dot:last-child { animation-delay:.8s; }
  .ss-hint-text  { font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.35em; text-transform:uppercase; color:rgba(255,255,255,.28); font-weight:300; }

  /* ── iPD-CP fullscreen scale-up overlay ── */
  .ss-ipdcp-fullscreen {
    position: absolute; inset: 0; z-index: 50;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Montserrat', sans-serif;
    font-weight: 900;
    font-size: clamp(80px, 15vw, 180px);
    letter-spacing: -.02em;
    background: linear-gradient(135deg, ${B.teal} 0%, ${B.purple} 50%, ${B.magenta} 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    background-color: ${B.charcoal};
    pointer-events: none;
  }

  /* ── scroll nudge ── */
  .ss-scroll-hint { position:absolute; bottom:40px; right:clamp(16px,3vw,48px); z-index:10; display:flex; flex-direction:column; align-items:center; gap:6px; transition:opacity .6s ease; }
  .ss-scroll-hint span { font-size:9px; letter-spacing:.3em; color:#fff; text-transform:uppercase; writing-mode:vertical-rl; }
  .ss-scroll-line { width:1px; height:40px; background:rgba(255,255,255,.2); position:relative; overflow:hidden; }
  .ss-scroll-line::after { content:''; position:absolute; top:-100%; left:0; width:100%; height:100%; background:linear-gradient(to bottom,${B.teal},${B.magenta}); animation:ssDrop 1.9s ease-in-out infinite; }

  /* ── back hint ── */
  .ss-back-hint {
    position:absolute; top:0; left:0; right:0; z-index:10;
    display:flex; align-items:center; justify-content:center; gap:8px;
    padding:10px 0 8px;
    opacity:0; transform:translateY(-6px);
    transition:opacity .4s ease,transform .4s ease;
    pointer-events:none;
    border-bottom:1px solid rgba(255,255,255,.04);
    background:linear-gradient(to bottom,rgba(10,10,22,.6) 0%,transparent 100%);
  }
  .ss-back-hint.visible { opacity:1; transform:translateY(0); }
  .ss-back-arrow { font-size:11px; color:${B.teal}; animation:ssBackBounce 1.6s ease-in-out infinite; }
  .ss-back-hint span { font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:.3em; text-transform:uppercase; color:rgba(255,255,255,.28); font-weight:300; }

  /* ── corner label ── */
  .ss-corner { position:absolute; top:28px; left:clamp(20px,4vw,44px); font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.3em; text-transform:uppercase; color:rgba(255,255,255,.18); font-weight:300; z-index:10; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .ss-frame   { padding: 72px 28px; justify-content: center; }
    .ss-heading { font-size: clamp(32px, 9vw, 56px); white-space: normal; }
    .ss-body    { font-size: 15px; max-width: 100%; }
    .ss-sub     { font-size: 11px; max-width: 100%; }
    .ss-line    { width: 44px; margin: 18px 0 20px; }
    .ss-eyebrow { font-size: 10px; margin-bottom: 14px; }
  }
  @media (max-width: 480px) {
    .ss-frame   { padding: 60px 20px; }
    .ss-heading { font-size: clamp(28px, 10vw, 44px); }
    .ss-body    { font-size: 14px; line-height: 1.7; }
    .ss-sub     { font-size: 10px; }
    .ss-ipdcp-fullscreen { font-size: clamp(48px, 18vw, 100px); }
  }
`; }