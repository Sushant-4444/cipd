import { useEffect, useRef, useState, useCallback } from "react";

const B = {
  teal:    "#00BFA5",
  magenta: "#E91E8C",
  gold:    "#FFB300",
  dark:    "#080810",
};

// ── 7-slide flow ──────────────────────────────────────────────────────────────
// pct ranges divide 0-100 evenly across 7 slides (~14% each)
const SLIDES = [
  { pct:[0,14],   id:"01", headline:"iPD-CP:\nTHE ACCELERATOR",   color:B.magenta, type:"identity"     },
  { pct:[15,28],  id:"02", headline:"BEYOND THE\nSIMULATION",     color:B.teal,    type:"handson"      },
  { pct:[29,42],  id:"03", headline:"THE MASTERY\nTRACK",         color:"#FFFFFF", type:"modules"      },
  { pct:[43,57],  id:"04", headline:"ARE YOU THE\nRIGHT FIT?",   color:B.magenta, type:"audience"     },
  { pct:[58,71],  id:"05", headline:"HEAR FROM\nOUR BUILDERS",   color:B.teal,    type:"testimonials" },
  { pct:[72,85],  id:"06", headline:"THE FULL\nSTACK SUPPORT",   color:B.gold,    type:"ecosystem"    },
  { pct:[86,100], id:"07", headline:"RESERVE YOUR\nSEAT",         color:"gold",    type:"cta"          },
];

const TOTAL_SLIDES = SLIDES.length;
const MULTIPLIER   = 7;   // 1 slide per 100vh of scroll
const clamp  = (v,a,b) => Math.max(a, Math.min(b, v));
const accentOf = s => s.color === "gold" ? B.gold : s.color;

const COMPS = [
  { cx:28, cy:32, w:7, h:7,  label:"MCU", pins:[[28,25],[21,32],[35,32],[28,39]] },
  { cx:55, cy:24, w:5, h:3,  label:"R1",  pins:[] },
  { cx:68, cy:32, w:4, h:4,  label:"C1",  pins:[] },
  { cx:18, cy:55, w:8, h:5,  label:"PWR", pins:[[18,50],[26,55]] },
  { cx:72, cy:50, w:5, h:5,  label:"IC2", pins:[[67,50],[77,50],[72,45],[72,55]] },
  { cx:42, cy:62, w:6, h:3,  label:"U3",  pins:[] },
];

const TRACES = [
  { d:"M 28,39 L 28,55 L 26,55",           color:B.teal    },
  { d:"M 35,32 L 55,32 L 55,25.5",         color:B.teal    },
  { d:"M 55,22.5 L 55,18 L 68,18 L 68,30", color:B.magenta },
  { d:"M 72,45 L 72,39 L 42,39 L 42,34.5", color:B.teal    },
  { d:"M 42,65.5 L 42,72 L 72,72 L 72,55", color:B.gold    },
  { d:"M 67,50 L 55,50 L 55,27.5",         color:B.magenta },
];

// ── Video testimonials — swap src paths once you have the split MP4 files ────
const TESTIMONIALS = [
  {
    src:   "/testimonials/segment_1.mp4",   // ← replace with real path
    name:  "Vivek Dagar",
    batch: "Cohort 01 · 2024",
    poster:"/testimonials/segment_1.png", // ← optional thumbnail
  },
  {
    src:   "/testimonials/segment_2.mp4",
    name:  "Yash Agarwal",
    batch: "Cohort 01 · 2024",
    poster:"/testimonials/segment_2.png",
  },
  {
    src:   "/testimonials/segment_4.mp4",
    name:  "Theajus Prakash",
    batch: "Cohort 01 · 2024",
    poster:"/testimonials/segment_4.png",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function IPDCPSection() {
  const containerRef = useRef(null);
  const [prog,     setProg]     = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);
  const [dir,      setDir]      = useState(1);
  const [phase,    setPhase]    = useState("idle");
  const [pcbStep,  setPcbStep]  = useState(0);
  const [modVis,   setModVis]   = useState(-1);
  const [hov,      setHov]      = useState(null);
  const [mounted,  setMounted]  = useState(false);
  const lastIdxRef = useRef(0);
  const timerRef   = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  const goTo = useCallback((next) => {
    if (next === lastIdxRef.current) return;
    const d = next > lastIdxRef.current ? 1 : -1;
    setDir(d);
    lastIdxRef.current = next;
    clearTimeout(timerRef.current);
    setPhase("exit");
    timerRef.current = setTimeout(() => {
      setSlideIdx(next);
      setPhase("enter");
      timerRef.current = setTimeout(() => setPhase("idle"), 700);
    }, 380);
  }, []);

  useEffect(() => {
    function onScroll() {
      const el = containerRef.current;
      if (!el) return;
      const rect    = el.getBoundingClientRect();
      const total   = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      if (rect.top > 0) { setProg(0); return; }
      const p   = clamp(scrolled / total, 0, 1);
      const pct = p * 100;
      setProg(p);

      // PCB animation only on slide 02
      setPcbStep(pct >= 15 && pct <= 28 ? Math.floor(((pct-15)/13)*5) : pct > 28 ? 5 : 0);
      // Module cards reveal on slide 03
      setModVis(pct >= 29 && pct <= 42 ? Math.floor(((pct-29)/13)*3) : pct < 29 ? -1 : 2);

      const idx = SLIDES.findIndex(s => pct >= s.pct[0] && pct <= s.pct[1]);
      goTo(idx === -1 ? (pct > 86 ? TOTAL_SLIDES-1 : 0) : idx);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [goTo]);

  if (!mounted) return null;

  const slide    = SLIDES[slideIdx];
  const accent   = accentOf(slide);

  return (
    <>
      <style>{CSS(B)}</style>

      <div ref={containerRef} className="ip-outer" style={{ height:`${MULTIPLIER * 100}vh` }}>
        <div className="ip-sticky">

          {/* PCB background */}
          <div className="ip-pcb-wrap">
            <PCBBoard step={pcbStep} accent={accent} slideIdx={slideIdx}/>
          </div>

          {/* Overlays */}
          <div className="ip-overlay" style={{
            background:`linear-gradient(105deg,${B.dark}ee 0%,${B.dark}cc 45%,${B.dark}55 75%,transparent 100%)`
          }}/>
          <div className="ip-ambient" style={{
            background:`radial-gradient(ellipse 55% 60% at 72% 50%,${accent}28 0%,transparent 70%)`,
            transition:"background 0.9s ease"
          }}/>

          {/* Progress bar */}
          <div className="ip-prog-track">
            <div className="ip-prog-fill" style={{ width:`${prog*100}%` }}/>
          </div>

          {/* Side nav dots — 7 now */}
          <nav className="ip-nav">
            {SLIDES.map((s,i) => (
              <div key={i} className={`ip-nav-item ${i===slideIdx?"active":i<slideIdx?"done":""}`}>
                <div className="ip-nav-dot" style={i<=slideIdx?{background:`radial-gradient(circle,${accentOf(s)},${accentOf(s)}66)`}:{}}/>
                {i===slideIdx && <div className="ip-nav-ring" style={{borderColor:accent}}/>}
              </div>
            ))}
          </nav>

          {/* Slide content */}
          <div className="ip-stage">
            <SlideFrame key={slideIdx} slide={slide} phase={phase} dir={dir} total={TOTAL_SLIDES}>
              {slide.type==="identity"     && <SlideIdentity    accent={accent}/>}
              {slide.type==="handson"      && <SlideHandson     accent={accent} pcbStep={pcbStep}/>}
              {slide.type==="modules"      && <SlideModules     accent={accent} visible={modVis}/>}
              {slide.type==="audience"     && <SlideAudience    accent={accent} hov={hov} setHov={setHov}/>}
              {slide.type==="testimonials" && <SlideTestimonials accent={accent}/>}
              {slide.type==="ecosystem"    && <SlideEcosystem   accent={accent} hov={hov} setHov={setHov}/>}
              {slide.type==="cta"          && <SlideCTA         accent={accent} hov={hov} setHov={setHov}/>}
            </SlideFrame>
          </div>

          {/* Scroll hint */}
          <div className="ip-scroll-hint" style={{opacity: prog < 0.04 ? 1 : 0}}>
            <div className="ip-scroll-line"/>
            <span className="ip-scroll-label">scroll</span>
          </div>

          <div className="ip-corner">iPD-CP · {slide.id}/{String(TOTAL_SLIDES).padStart(2,"0")}</div>
        </div>
      </div>
    </>
  );
}

// ── SlideFrame ────────────────────────────────────────────────────────────────
function SlideFrame({ slide, phase, dir, total, children }) {
  const accent  = accentOf(slide);
  const isExit  = phase === "exit";
  const isEnter = phase === "enter";
  const yExit   = dir === 1 ? "-6vh" : "6vh";
  const yEnter  = dir === 1 ? "6vh"  : "-6vh";

  // Wide layout for testimonials and ecosystem — they need more horizontal space
  const isWide = slide.type === "testimonials" || slide.type === "ecosystem";

  return (
    <div className={`ip-frame ${isWide ? "ip-frame--wide" : ""}`} style={{
      animation: isEnter ? `ipSlideIn 0.7s cubic-bezier(0.22,1,0.36,1) both` : "none",
      "--y-from": yEnter,
      opacity:    isExit ? 0 : 1,
      transform:  isExit ? `translateY(${yExit}) scale(0.97)` : "translateY(0) scale(1)",
      filter:     isExit ? "blur(8px)" : "blur(0px)",
      transition: isExit
        ? "opacity 0.38s cubic-bezier(0.4,0,1,1), transform 0.38s cubic-bezier(0.4,0,1,1), filter 0.38s ease"
        : "none",
    }}>
      <div className="ip-frame-accent" style={{background:accent}}/>
      <div className="ip-eyebrow" style={{color:accent}}>
        <span className="ip-eyebrow-id">{slide.id}</span> / {String(total).padStart(2,"0")} — iPD-CP
      </div>
      <h2 className="ip-headline" style={
        slide.color === "gold"
          ? {backgroundImage:`linear-gradient(120deg,${B.teal},${B.gold})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text"}
          : {color: slide.color}
      }>{slide.headline}</h2>
      <div className="ip-rule" style={{
        background: slide.color === "gold"
          ? `linear-gradient(90deg,${B.teal},${B.gold})`
          : `linear-gradient(90deg,${slide.color} 0%,transparent 100%)`
      }}/>
      <div className="ip-body-wrap">{children}</div>
    </div>
  );
}

// ── PCBBoard (unchanged) ──────────────────────────────────────────────────────
function PCBBoard({ step, accent, slideIdx }) {
  return (
    <svg className="ip-pcb-svg" viewBox="0 0 100 80" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M5 0L0 0 0 5" fill="none" stroke="rgba(0,191,165,0.07)" strokeWidth="0.2"/>
        </pattern>
        <pattern id="dots" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="0.25" fill="rgba(0,191,165,0.15)"/>
        </pattern>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow2" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="100" height="80" fill="url(#grid)"/>
      <rect width="100" height="80" fill="url(#dots)"/>
      <rect x="8" y="6" width="84" height="68" rx="2" fill="rgba(0,35,28,0.55)" stroke="rgba(0,191,165,0.25)" strokeWidth="0.4"/>
      {[[9,7],[89,7],[9,73],[89,73]].map(([x,y],i) => (
        <g key={i} stroke="rgba(0,191,165,0.4)" strokeWidth="0.5" fill="none">
          <line x1={x} y1={y} x2={x+(i%2===0?3:-3)} y2={y}/>
          <line x1={x} y1={y} x2={x} y2={y+(i<2?3:-3)}/>
        </g>
      ))}
      {TRACES.map((tr,i) => (
        <path key={i} d={tr.d} fill="none" stroke={tr.color} strokeWidth="0.55" strokeLinecap="round"
          opacity="0.7" filter="url(#glow)"
          style={{ strokeDasharray:80, strokeDashoffset: step>i ? 0 : 80, transition:`stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1) ${i*0.12}s` }}
        />
      ))}
      {[[28,39],[55,27.5],[35,32],[42,39],[55,50],[72,55]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="0.7" fill={B.dark} stroke={B.teal} strokeWidth="0.4"
          opacity={step>i ? 0.9 : 0} style={{transition:`opacity 0.4s ease ${i*0.1}s`}}/>
      ))}
      {COMPS.map((c,i) => (
        <g key={i} filter="url(#glow)" style={{opacity:step>i?1:0, transition:`opacity 0.5s ease ${i*0.1}s`}}>
          {c.pins.map(([px,py],j) => <circle key={j} cx={px} cy={py} r="0.6" fill={B.teal} opacity="0.5"/>)}
          <rect x={c.cx-c.w/2} y={c.cy-c.h/2} width={c.w} height={c.h} rx="0.6"
            fill="rgba(0,191,165,0.1)" stroke={accent} strokeWidth="0.35"/>
          <text x={c.cx} y={c.cy+0.7} textAnchor="middle" fill={accent} fontSize="1.5" fontFamily="monospace" opacity="0.9">{c.label}</text>
          {i===slideIdx%COMPS.length && (
            <rect x={c.cx-c.w/2-0.5} y={c.cy-c.h/2-0.5} width={c.w+1} height={c.h+1} rx="1"
              fill="none" stroke={accent} strokeWidth="0.5" opacity="0.6" filter="url(#glow2)"/>
          )}
        </g>
      ))}
      <circle r="1.2" fill={accent} opacity="0.8" filter="url(#glow2)">
        <animateMotion dur="3s" repeatCount="indefinite" path="M 28,39 L 28,55 L 26,55"/>
      </circle>
      <circle r="0.9" fill={B.gold} opacity="0.7" filter="url(#glow2)">
        <animateMotion dur="4s" repeatCount="indefinite" begin="1.2s" path="M 35,32 L 55,32 L 55,25.5"/>
      </circle>
      <circle r="0.8" fill={B.magenta} opacity="0.6" filter="url(#glow2)">
        <animateMotion dur="3.5s" repeatCount="indefinite" begin="0.6s" path="M 67,50 L 55,50 L 55,27.5"/>
      </circle>
    </svg>
  );
}

// ── Slide 01 — Identity ───────────────────────────────────────────────────────
function SlideIdentity({ accent }) {
  return (
    <div className="ip-content">
      <p className="ip-body">A <strong>24-week, full-time on-campus intensive</strong> at IIIT Delhi — bridging the gap between academic theory and production-ready innovation.</p>
      <div className="ip-card" style={{borderLeftColor:accent}}>
        <span className="ip-card-label" style={{color:accent}}>The Goal</span>
        <p className="ip-card-text">Turning India into a Product Nation by upskilling the next generation of hardware innovators.</p>
      </div>
      <div className="ip-stats">
        {[["24","Weeks Full-Time"],["100%","On Campus"],["1","Production-Ready Product"]].map(([n,l],i) => (
          <div key={i} className="ip-stat" style={{"--i":i}}>
            <span className="ip-stat-n" style={{color:accent}}>{n}</span>
            <span className="ip-stat-l">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide 02 — Hands-on ───────────────────────────────────────────────────────
function SlideHandson({ accent, pcbStep }) {
  const feats = [
    { icon:"◈", t:"Concept to Reality",  d:"From initial ideation to a production-ready prototype." },
    { icon:"⬡", t:"The Technical Stack", d:"Embedded Systems, IoT, PCB Design, and Enclosure Design." },
    { icon:"◎", t:"Industry Validation", d:"Comprehensive testing, validation, and production readiness." },
  ];
  return (
    <div className="ip-content">
      <p className="ip-body">Modeled on <strong>industry training for fresh hires</strong> — master the entire <strong>Product Development Life Cycle</strong>.</p>
      <div className="ip-counter" style={{borderColor:`${accent}44`, background:`${accent}0d`}}>
        <span style={{color:"rgba(255,255,255,.5)"}}>Stages complete →</span>
        <span className="ip-counter-n" style={{color:accent}}>{pcbStep + 1}</span>
        <span style={{color:"rgba(255,255,255,.5)"}}>of 5</span>
      </div>
      <div className="ip-feats">
        {feats.map((f,i) => (
          <div key={i} className="ip-feat" style={{"--i":i}}>
            <span className="ip-feat-icon" style={{color:accent}}>{f.icon}</span>
            <div><div className="ip-feat-t">{f.t}</div><div className="ip-feat-d">{f.d}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide 03 — Modules ────────────────────────────────────────────────────────
function SlideModules({ accent, visible }) {
  const mods = [
    { icon:"◐", t:"Design Thinking",      d:"Empathizing with users to build user-centric hardware." },
    { icon:"◑", t:"UX for Hardware",      d:"Managing the integration of hardware, software, and UI." },
    { icon:"◒", t:"Production Readiness", d:"BOM finalization, quality assurance, manufacturing plans." },
  ];
  return (
    <div className="ip-content">
      <p className="ip-body">Three core mastery tracks — from thinking to making to shipping.</p>
      <div className="ip-mod-grid">
        {mods.map((m,i) => (
          <div key={i} className="ip-mod" style={{
            opacity:   visible>=i ? 1 : 0,
            transform: visible>=i ? "none" : "translateY(20px) scale(0.96)",
            transition:`opacity .5s ease ${i*0.15}s, transform .5s ease ${i*0.15}s`,
            borderTopColor: accent,
          }}>
            <span className="ip-mod-icon" style={{color:accent}}>{m.icon}</span>
            <div className="ip-mod-t">{m.t}</div>
            <div className="ip-mod-d">{m.d}</div>
            <div className="ip-mod-n">0{i+1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide 04 — Audience ───────────────────────────────────────────────────────
function SlideAudience({ accent, hov, setHov }) {
  const cards = [
    { icon:"🎓", t:"Final-Year Students",      d:"Keen on building world-class hardware products." },
    { icon:"⚡", t:"Recent Graduates",          d:"Looking to boost employability through specialised upskilling." },
    { icon:"🚀", t:"Startups & Entrepreneurs", d:"Seeking 'first-time-right' commercialisation strategies." },
    { icon:"⚙️", t:"Working Professionals",    d:"Specialised training in Embedded Systems & Product Design." },
  ];
  return (
    <div className="ip-content">
      <p className="ip-body">Built for builders at every stage — find your cohort below.</p>
      <div className="ip-aud-grid">
        {cards.map((c,i) => (
          <div key={i} className="ip-aud"
            style={{borderColor:hov===i?accent:"rgba(255,255,255,.08)", background:hov===i?`${accent}11`:"rgba(255,255,255,.03)", "--i":i}}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
            <span className="ip-aud-icon">{c.icon}</span>
            <div className="ip-aud-t">{c.t}</div>
            <div className="ip-aud-d">{c.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide 05 — Testimonials ───────────────────────────────────────────────────
function SlideTestimonials({ accent }) {
  const [active,  setActive]  = useState(null);
  const [current, setCurrent] = useState(0);
  const trackRef = useRef(null);

  function scrollTo(i) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[i];
    if (card) card.scrollIntoView({ behavior:"smooth", inline:"center", block:"nearest" });
    setCurrent(i);
  }

  function onTrackScroll() {
    const track = trackRef.current;
    if (!track) return;
    const centre = track.scrollLeft + track.clientWidth / 2;
    let closest = 0, minDist = Infinity;
    Array.from(track.children).forEach((c, i) => {
      const dist = Math.abs(c.offsetLeft + c.offsetWidth / 2 - centre);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setCurrent(closest);
  }

  return (
    <div className="ip-testi-wrap">
      <p className="ip-body">Real builders. Real outcomes. <strong>Straight from the cohort.</strong></p>

      {/* Desktop: 3-col grid */}
      <div className="ip-testi-grid">
        {TESTIMONIALS.map((t, i) => (
          <VideoCard key={i} testimonial={t} accent={accent} index={i}
            isActive={active===i} onPlay={()=>setActive(i)}/>
        ))}
      </div>

      {/* Mobile: horizontal snap carousel — never scrolls vertically */}
      <div className="ip-testi-carousel">
        <div className="ip-testi-track" ref={trackRef} onScroll={onTrackScroll}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="ip-testi-slide">
              <VideoCard testimonial={t} accent={accent} index={i}
                isActive={active===i} onPlay={()=>setActive(i)}/>
            </div>
          ))}
        </div>

        <div className="ip-testi-dots">
          {TESTIMONIALS.map((_, i) => (
            <button key={i}
              className={"ip-testi-dot" + (i===current ? " ip-testi-dot--active" : "")}
              style={i===current ? {background:accent, boxShadow:`0 0 8px ${accent}88`} : {}}
              onClick={()=>scrollTo(i)}
              aria-label={`Video ${i+1}`}
            />
          ))}
        </div>

        <div className="ip-testi-hint">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M8 3.5L11.5 7 8 10.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>swipe</span>
        </div>
      </div>
    </div>
  );
}

function VideoCard({ testimonial, accent, index, isActive, onPlay }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      v.pause();
      setPlaying(false);
    } else {
      v.play();
      setPlaying(true);
      onPlay();
    }
  }

  // Pause when another card becomes active
  useEffect(() => {
    if (!isActive && playing) {
      videoRef.current?.pause();
      setPlaying(false);
    }
  }, [isActive]);

  return (
    <div
      className="ip-vc"
      style={{ "--i": index, "--a": accent }}
      onClick={toggle}
    >
      {/* Glass border that lights up when playing */}
      <div className="ip-vc-border" style={{
        borderColor: playing ? accent : "rgba(255,255,255,0.08)",
        boxShadow:   playing ? `0 0 24px ${accent}44` : "none",
      }}/>

      {/* Video element */}
      <video
        ref={videoRef}
        className="ip-vc-video"
        src={testimonial.src}
        poster={testimonial.poster}
        preload="metadata"
        playsInline
        loop
      />

      {/* Play / pause overlay */}
      {!playing && (
        <div className="ip-vc-play">
          <div className="ip-vc-play-ring" style={{borderColor:`${accent}88`}}/>
          <div className="ip-vc-play-ring ip-vc-play-ring--2" style={{borderColor:`${accent}44`}}/>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M6 4l12 6-12 6V4z" fill={accent}/>
          </svg>
        </div>
      )}

      {/* Pause icon when playing */}
      {playing && (
        <div className="ip-vc-pause">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="4" height="12" rx="1" fill="rgba(255,255,255,0.7)"/>
            <rect x="10" y="2" width="4" height="12" rx="1" fill="rgba(255,255,255,0.7)"/>
          </svg>
        </div>
      )}

      {/* Name + batch */}
      <div className="ip-vc-meta">
        <span className="ip-vc-name">{testimonial.name}</span>
        <span className="ip-vc-batch" style={{color:accent}}>{testimonial.batch}</span>
      </div>

      {/* Bottom scan line when playing */}
      {playing && <div className="ip-vc-scanline" style={{background:`linear-gradient(to right,transparent,${accent},transparent)`}}/>}
    </div>
  );
}

// ── Slide 06 — Ecosystem (full detail) ───────────────────────────────────────
//
// Three tiers, each with its own visual language:
//   TIER 1 — Direct Scholarships & GPA Discounts   (teal)
//   TIER 2 — CiPD Product Fellowship (stipend)      (magenta)
//   TIER 3 — Startup Grants & Incubation            (gold)
//
function SlideEcosystem({ accent, hov, setHov }) {
  return (
    <div className="ip-eco-wrap">

      <p className="ip-body" style={{marginBottom:0}}>
        More than a programme — a <strong>launchpad with full-stack financial support</strong> from day one.
      </p>

      {/* ── TIER 1: Direct Scholarships & GPA discounts ── */}
      <div className="ip-tier">
        <div className="ip-tier-header" style={{borderLeftColor:B.teal}}>
          <span className="ip-tier-num" style={{color:B.teal}}>01</span>
          <div>
            <span className="ip-tier-title" style={{color:B.teal}}>Direct Scholarships & Onboarding Discounts</span>
            <span className="ip-tier-sub">Targeted fellowships up to ₹2 Lakhs + GPA-based fee reductions</span>
          </div>
        </div>

        <div className="ip-tier-cards">
          {/* GPA discount cards */}
          {[
            { gpa:"GPA ≥ 8.0", fee:"₹75,000", label:"+ GST", tag:"Highest Discount",  color:B.teal    },
            { gpa:"GPA ≥ 7.5", fee:"₹85,000", label:"+ GST", tag:"Merit Discount",    color:B.teal    },
            { gpa:"Women · GPA ≥ 7.5", fee:"₹75,000", label:"+ GST", tag:"Women in Tech", color:B.magenta },
          ].map((d,i) => (
            <div key={i} className="ip-gpa-card"
              style={{
                "--i": i,
                borderColor: hov===`g${i}` ? d.color : `${d.color}33`,
                background:  hov===`g${i}` ? `${d.color}12` : `${d.color}06`,
                boxShadow:   hov===`g${i}` ? `0 0 20px ${d.color}28` : "none",
              }}
              onMouseEnter={()=>setHov(`g${i}`)} onMouseLeave={()=>setHov(null)}
            >
              <span className="ip-gpa-tag" style={{color:d.color, borderColor:`${d.color}44`}}>{d.tag}</span>
              <span className="ip-gpa-crit">{d.gpa}</span>
              <span className="ip-gpa-fee" style={{color:d.color}}>{d.fee}<sup style={{fontSize:"0.5em",opacity:.6}}>{d.label}</sup></span>
              <span className="ip-gpa-base">Base fee: ₹1,25,000</span>
            </div>
          ))}

          {/* Fellowship card */}
          <div className="ip-gpa-card ip-gpa-card--fellow"
            style={{
              borderColor: hov==="fellow" ? B.gold : `${B.gold}33`,
              background:  hov==="fellow" ? `${B.gold}12` : `${B.gold}06`,
              boxShadow:   hov==="fellow" ? `0 0 20px ${B.gold}28` : "none",
            }}
            onMouseEnter={()=>setHov("fellow")} onMouseLeave={()=>setHov(null)}
          >
            <span className="ip-gpa-tag" style={{color:B.gold, borderColor:`${B.gold}44`}}>Targeted Fellowship</span>
            <span className="ip-gpa-crit">Toppers · Women · EWS</span>
            <span className="ip-gpa-fee" style={{color:B.gold}}>₹2 Lakhs</span>
            <span className="ip-gpa-base">Maximum fellowship value</span>
          </div>
        </div>
      </div>

      {/* ── TIER 2: Product Fellowship (monthly stipend) ── */}
      <div className="ip-tier">
        <div className="ip-tier-header" style={{borderLeftColor:B.magenta}}>
          <span className="ip-tier-num" style={{color:B.magenta}}>02</span>
          <div>
            <span className="ip-tier-title" style={{color:B.magenta}}>CiPD Product Fellowship</span>
            <span className="ip-tier-sub">Monthly stipend for all participants · up to ₹1.5 Lakhs total</span>
          </div>
        </div>

        <div className="ip-stipend-row">
          {[
            { label:"Monthly Stipend",   value:"₹15,000",  note:"From month 3 onwards", color:B.magenta },
            { label:"Duration",          value:"10 months", note:"6 months post-programme", color:B.magenta },
            { label:"Total Support",     value:"₹1.5 L",   note:"Maximum total value", color:B.magenta },
          ].map((s,i) => (
            <div key={i} className="ip-stipend-stat" style={{"--i":i}}>
              <span className="ip-stipend-val" style={{color:B.magenta}}>{s.value}</span>
              <span className="ip-stipend-label">{s.label}</span>
              <span className="ip-stipend-note">{s.note}</span>
            </div>
          ))}
          <div className="ip-stipend-note-card" style={{borderColor:`${B.magenta}33`, background:`${B.magenta}08`}}>
            <span style={{color:B.magenta, fontWeight:700}}>Eligibility:</span> All enrolled participants.
            Stipend begins from month 3 to ensure commitment, and can extend 6 months after completion.
          </div>
        </div>
      </div>

      {/* ── TIER 3: Startup Grants & Incubation ── */}
      <div className="ip-tier">
        <div className="ip-tier-header" style={{borderLeftColor:B.gold}}>
          <span className="ip-tier-num" style={{color:B.gold}}>03</span>
          <div>
            <span className="ip-tier-title" style={{color:B.gold}}>Startup Grants & Incubation</span>
            <span className="ip-tier-sub">For participants building a startup from their product</span>
          </div>
        </div>

        <div className="ip-grant-grid">
          {[
            {
              name:"CiPD Seed Grant",
              amount:"Up to ₹2 L",
              desc:"For high-potential early-stage startups from the cohort.",
              color:B.gold,
            },
            {
              name:"READY (via IHFC)",
              amount:"Up to ₹5 L",
              desc:"₹25K/mo (graduates) or ₹12K/mo (B.Tech) + ₹5L consumables grant.",
              color:B.teal,
            },
            {
              name:"Entrepreneur in Residence",
              amount:"₹4 L total",
              desc:"₹30,000/month scholarship with up to ₹4 Lakhs in total funding support.",
              color:B.magenta,
            },
            {
              name:"NIDHI PRAYAS Scheme",
              amount:"Up to ₹10 L",
              desc:"Significant startup funding for up to one year via the national scheme.",
              color:B.gold,
            },
          ].map((g,i) => (
            <div key={i} className="ip-grant-card"
              style={{
                "--i": i,
                borderColor: hov===`gr${i}` ? g.color : `${g.color}30`,
                background:  hov===`gr${i}` ? `${g.color}10` : "rgba(255,255,255,0.02)",
                boxShadow:   hov===`gr${i}` ? `0 0 16px ${g.color}22` : "none",
              }}
              onMouseEnter={()=>setHov(`gr${i}`)} onMouseLeave={()=>setHov(null)}
            >
              <span className="ip-grant-amt" style={{color:g.color}}>{g.amount}</span>
              <span className="ip-grant-name">{g.name}</span>
              <span className="ip-grant-desc">{g.desc}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ── Slide 07 — CTA ────────────────────────────────────────────────────────────
function SlideCTA({ accent, hov, setHov }) {
  return (
    <div className="ip-content">
      <div className="ip-invest">
        {/* Fee — update when confirmed */}
        <div>
          <div className="ip-inv-lbl">Programme Fee</div>
          <div className="ip-inv-amt">₹1,25,000 <sup>+GST</sup></div>
        </div>
        {/* Cohort date — update when confirmed */}
        <div>
          <div className="ip-inv-lbl">Next Cohort</div>
          <div className="ip-inv-date" style={{color:B.gold}}>TBA — 2026</div>
        </div>
      </div>

      <div className="ip-cta-note" style={{borderLeftColor:accent}}>
        <span className="ip-cta-note-label" style={{color:accent}}>Limited Seats</span>
        <p className="ip-card-text">Each cohort is capped to ensure hands-on mentorship. Early applications are strongly encouraged.</p>
      </div>

      <div className="ip-btns">
        <button
          className="ip-btn-p"
          style={{"--a":B.teal,"--b":B.gold}}
          onClick={() => window.open("#apply","_blank","noopener")}
        >
          Apply Now
        </button>
        <button className="ip-btn-s">Download Brochure</button>
      </div>
    </div>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────
// Breakpoints:
//   ≥ 1024px  Desktop      — full layout, wide grids
//   768–1023  Tablet       — compressed grids, smaller type
//   480–767   Mobile       — single col, frame full-width, PCB faded
//   < 480     XS Mobile    — minimal padding, max legibility
// ─────────────────────────────────────────────────────────────────────────────
function CSS(B){ return `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&family=Montserrat:wght@700;800;900&display=swap');

  /* ── Keyframes ── */
  @keyframes ipSlideIn  { from{opacity:0;transform:translateY(var(--y-from,4vh)) scale(0.97);filter:blur(8px)} to{opacity:1;transform:none;filter:blur(0)} }
  @keyframes ipRuleGrow { from{width:0;opacity:0} to{width:52px;opacity:1} }
  @keyframes ipPing     { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.6);opacity:0} }
  @keyframes ipDrop     { 0%{top:-100%} 100%{top:100%} }
  @keyframes ipGold     { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes ipFadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  @keyframes ipPcbPulse { 0%,100%{opacity:1} 50%{opacity:.82} }
  @keyframes ipPlayPing { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2);opacity:0} }
  @keyframes ipScanline { 0%,100%{opacity:.6} 50%{opacity:.2} }
  @keyframes ipEcoIn    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }

  *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

  /* ══ Shell ══ */
  .ip-outer  { position:relative; width:100%; }
  .ip-sticky { position:sticky; top:0; height:100vh; width:100%; overflow:hidden; background:${B.dark}; }

  .ip-pcb-wrap { position:absolute; inset:0; display:flex; align-items:stretch; justify-content:flex-end; pointer-events:none; z-index:1; animation:ipPcbPulse 6s ease-in-out infinite; }
  .ip-pcb-svg  { width:58%; height:100%; }

  .ip-overlay { position:absolute; inset:0; z-index:2; pointer-events:none; }
  .ip-ambient { position:absolute; inset:0; z-index:3; pointer-events:none; }

  .ip-prog-track { position:absolute; bottom:0; left:0; right:0; height:2px; background:rgba(255,255,255,.07); z-index:20; }
  .ip-prog-fill  { height:100%; background:linear-gradient(90deg,${B.teal},${B.magenta},${B.gold}); transition:width .15s linear; }

  /* Side nav dots */
  .ip-nav      { position:absolute; right:clamp(10px,2.5vw,36px); top:50%; transform:translateY(-50%); display:flex; flex-direction:column; gap:14px; z-index:20; }
  .ip-nav-item { position:relative; width:10px; height:10px; display:flex; align-items:center; justify-content:center; opacity:.28; transition:opacity .4s; }
  .ip-nav-item.active { opacity:1; }
  .ip-nav-item.done   { opacity:.55; }
  .ip-nav-dot  { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,.25); transition:background .4s,transform .3s; }
  .ip-nav-item.active .ip-nav-dot { transform:scale(1.6); }
  .ip-nav-ring { position:absolute; inset:-4px; border-radius:50%; border:1.5px solid; animation:ipPing 1.4s ease-out infinite; }

  /* ══ Frame ══ */
  .ip-stage { position:absolute; inset:0; z-index:10; display:flex; align-items:stretch; }
  .ip-frame {
    flex:1; display:flex; flex-direction:column; justify-content:center;
    padding: clamp(80px,10vh,100px) clamp(28px,7vw,96px) clamp(60px,8vh,80px);
    max-width: min(640px, 55%);
    position:relative; will-change:transform,opacity,filter;
    overflow:hidden;
  }
  .ip-frame--wide { max-width:min(860px,74%); }

  /* ── Tablet 768–1023 ── */
  @media(max-width:1023px) {
    .ip-frame       { max-width:min(580px,60%); padding:clamp(70px,9vh,90px) clamp(20px,4vw,48px) clamp(50px,7vh,70px); }
    .ip-frame--wide { max-width:min(740px,78%); }
    .ip-pcb-svg     { width:52%; }
  }

  /* ── Mobile 480–767 ── */
  @media(max-width:767px) {
    .ip-frame,
    .ip-frame--wide {
      max-width:100%;
      padding: 80px 18px 90px;
    }
    .ip-pcb-wrap  { opacity:.22; }
    .ip-overlay   { background:linear-gradient(180deg,${B.dark}f5 0%,${B.dark}e8 60%,${B.dark}99 100%) !important; }
    .ip-nav       { right:8px; gap:10px; }
    .ip-nav-dot   { width:5px; height:5px; }
  }

  /* ── XS Mobile < 480 ── */
  @media(max-width:479px) {
    .ip-frame,
    .ip-frame--wide { padding:72px 14px 80px; }
    .ip-pcb-wrap  { opacity:.12; }
    .ip-nav       { display:none; } /* too cramped — hide on xs */
  }

  /* ══ Slide chrome ══ */
  .ip-frame-accent { position:absolute; left:0; top:18%; width:3px; height:64%; border-radius:0 2px 2px 0; opacity:.9; animation:ipFadeUp .5s ease .4s both; }
  .ip-eyebrow    { font-family:'JetBrains Mono',monospace; font-size:clamp(8px,.9vw,11px); letter-spacing:.38em; font-weight:300; text-transform:uppercase; margin-bottom:clamp(8px,1.2vh,14px); color:rgba(255,255,255,.45); }
  .ip-eyebrow-id { font-weight:700; }
  .ip-headline   { font-family:'Montserrat','Arial Black',sans-serif; font-size:clamp(22px,4.2vw,66px); font-weight:900; line-height:.92; letter-spacing:-.02em; white-space:pre-line; }
  .ip-rule       { height:3px; border-radius:2px; margin:clamp(10px,1.8vh,18px) 0 clamp(10px,1.8vh,18px); animation:ipRuleGrow .55s cubic-bezier(.16,1,.3,1) .3s both; }
  .ip-body-wrap  { display:flex; flex-direction:column; animation:ipFadeUp .6s ease .22s both; overflow:hidden; }

  /* ══ Shared content primitives ══ */
  .ip-content { display:flex; flex-direction:column; gap:clamp(8px,1.5vh,16px); }
  .ip-body    { font-size:clamp(12px,1.1vw,15px); font-weight:300; color:rgba(255,255,255,.65); line-height:1.75; }
  .ip-body strong { color:#fff; font-weight:600; }

  .ip-card       { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); border-left-width:3px; padding:10px 14px; border-radius:3px; }
  .ip-card-label { display:block; font-family:'JetBrains Mono',monospace; font-size:8px; letter-spacing:.35em; text-transform:uppercase; margin-bottom:4px; }
  .ip-card-text  { font-size:11px; font-weight:300; color:rgba(255,255,255,.6); line-height:1.65; }

  /* ══ Slide 01 — Identity ══ */
  .ip-stats  { display:flex; gap:clamp(12px,2.5vw,32px); flex-wrap:wrap; }
  .ip-stat   { display:flex; flex-direction:column; gap:3px; animation:ipFadeUp .5s ease calc(var(--i)*.1s + .4s) both; }
  .ip-stat-n { font-family:'Montserrat','Arial Black',sans-serif; font-size:clamp(22px,3.2vw,44px); font-weight:900; line-height:1; }
  .ip-stat-l { font-family:'JetBrains Mono',monospace; font-size:8px; letter-spacing:.22em; text-transform:uppercase; color:rgba(255,255,255,.3); }

  /* ══ Slide 02 — Handson ══ */
  .ip-counter   { display:flex; align-items:center; gap:10px; padding:9px 13px; border-radius:3px; border:1px solid; font-family:'JetBrains Mono',monospace; font-size:11px; flex-wrap:wrap; }
  .ip-counter-n { font-size:20px; font-weight:700; color:#fff; }
  .ip-feats     { display:flex; flex-direction:column; gap:7px; }
  .ip-feat      { display:flex; align-items:flex-start; gap:11px; padding:9px 13px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:3px; transition:border-color .3s; animation:ipFadeUp .5s ease calc(var(--i)*.1s + .35s) both; }
  .ip-feat:hover { border-color:rgba(0,191,165,.3); }
  .ip-feat-icon { font-size:16px; flex-shrink:0; margin-top:1px; }
  .ip-feat-t    { font-size:12px; font-weight:600; color:#fff; margin-bottom:2px; }
  .ip-feat-d    { font-size:10px; color:rgba(255,255,255,.45); line-height:1.6; }

  /* ══ Slide 03 — Modules ══ */
  .ip-mod-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .ip-mod      { position:relative; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-top-width:2px; padding:14px 12px 22px; border-radius:3px; overflow:hidden; }
  .ip-mod-icon { font-size:18px; margin-bottom:7px; display:block; }
  .ip-mod-t    { font-family:'Montserrat',sans-serif; font-weight:800; font-size:12px; color:#fff; margin-bottom:4px; }
  .ip-mod-d    { font-size:10px; color:rgba(255,255,255,.45); line-height:1.6; }
  .ip-mod-n    { position:absolute; bottom:5px; right:8px; font-family:'JetBrains Mono',monospace; font-size:22px; font-weight:700; color:rgba(255,255,255,.05); }
  @media(max-width:767px) { .ip-mod-grid { grid-template-columns:1fr; gap:8px; } }

  /* ══ Slide 04 — Audience ══ */
  .ip-aud-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:9px; }
  .ip-aud      { padding:12px 14px; border:1px solid; border-radius:4px; transition:all .35s ease; cursor:default; animation:ipFadeUp .5s ease calc(var(--i)*.08s + .3s) both; }
  .ip-aud-icon { font-size:18px; display:block; margin-bottom:5px; }
  .ip-aud-t    { font-size:12px; font-weight:600; color:#fff; margin-bottom:3px; }
  .ip-aud-d    { font-size:10px; color:rgba(255,255,255,.45); line-height:1.6; }
  @media(max-width:479px) { .ip-aud-grid { grid-template-columns:1fr; } }

  /* ══ Slide 05 — Testimonials ══ */

  /* ip-testi-wrap is the outer container for the whole slide */
  .ip-testi-wrap { display:flex; flex-direction:column; gap:clamp(8px,1.5vh,14px); }

  /* ── Desktop grid (hidden on mobile) ── */
  .ip-testi-grid {
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:11px;
  }

  /* ── Mobile carousel (hidden on desktop) ── */
  .ip-testi-carousel { display:none; flex-direction:column; gap:10px; }

  @media(max-width:767px) {
    .ip-testi-grid     { display:none; }           /* grid off on mobile  */
    .ip-testi-carousel { display:flex; }           /* carousel on mobile  */
  }

  /* Horizontal scroll track — scroll-snap, no visible scrollbar */
  .ip-testi-track {
    display:flex;
    gap:12px;
    overflow-x:auto;
    scroll-snap-type:x mandatory;
    -webkit-overflow-scrolling:touch;  /* smooth momentum on iOS */
    scrollbar-width:none;              /* Firefox */
    padding-bottom:2px;                /* prevent clipping */
    /* CRITICAL: do NOT use overflow-y here, that would fight page scroll */
  }
  .ip-testi-track::-webkit-scrollbar { display:none; }  /* Chrome/Safari */

  /* Each slide in the carousel */
  .ip-testi-slide {
    flex:0 0 80vw;              /* 80% viewport width per card */
    max-width:320px;
    scroll-snap-align:center;
  }

  /* Dot nav */
  .ip-testi-dots {
    display:flex;
    align-items:center;
    justify-content:center;
    gap:8px;
  }
  .ip-testi-dot {
    width:7px; height:7px;
    border-radius:50%;
    background:rgba(255,255,255,0.18);
    border:none; cursor:pointer;
    padding:0;
    transition:background .3s, box-shadow .3s, transform .3s;
  }
  .ip-testi-dot--active { transform:scale(1.4); }

  /* Swipe hint label */
  .ip-testi-hint {
    display:flex; align-items:center; justify-content:center; gap:5px;
    font-family:'JetBrains Mono',monospace;
    font-size:8px; letter-spacing:.3em; text-transform:uppercase;
    color:rgba(255,255,255,.2);
  }

  /* Video card — shared between grid and carousel */
  .ip-vc {
    position:relative; border-radius:8px; overflow:hidden;
    cursor:pointer; aspect-ratio:9/16; background:#000;
    animation:ipFadeUp .5s ease calc(var(--i)*.12s + .25s) both;
    transition:transform .3s ease;
  }
  /* On mobile in carousel, landscape is more watchable */
  @media(max-width:767px) {
    .ip-vc { aspect-ratio:16/9; }
  }
  .ip-vc:hover { transform:scale(1.02) translateY(-2px); }

  .ip-vc-border { position:absolute; inset:0; border-radius:8px; border:1px solid; pointer-events:none; z-index:4; transition:border-color .3s,box-shadow .3s; }
  .ip-vc-video  { width:100%; height:100%; object-fit:cover; display:block; }

  .ip-vc-play   { position:absolute; inset:0; z-index:3; display:flex; align-items:center; justify-content:center; background:rgba(6,8,16,.35); backdrop-filter:blur(2px); }
  .ip-vc-play-ring { position:absolute; width:52px; height:52px; border-radius:50%; border:1.5px solid; animation:ipPlayPing 2s ease-out infinite; }
  .ip-vc-play-ring--2 { animation-delay:.7s; }
  .ip-vc-play svg { position:relative; z-index:1; filter:drop-shadow(0 0 8px var(--a,#00BFA5)); }

  .ip-vc-pause  { position:absolute; top:8px; right:8px; z-index:3; width:28px; height:28px; border-radius:6px; background:rgba(6,8,16,.7); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); }

  .ip-vc-meta   { position:absolute; bottom:0; left:0; right:0; z-index:3; padding:24px 12px 12px; background:linear-gradient(to top,rgba(6,8,16,.95) 0%,transparent 100%); display:flex; flex-direction:column; gap:2px; }
  .ip-vc-name   { font-family:'Montserrat',sans-serif; font-size:13px; font-weight:800; color:#fff; }
  .ip-vc-batch  { font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:.2em; text-transform:uppercase; }
  .ip-vc-scanline { position:absolute; bottom:0; left:0; right:0; height:1px; z-index:4; pointer-events:none; animation:ipScanline 2s ease-in-out infinite; }

  /* ══ Slide 06 — Ecosystem ══ */
  .ip-eco-wrap {
    display:flex; flex-direction:column;
    gap:clamp(8px,1.4vh,14px);
    overflow-y:auto;
    max-height:calc(100vh - 220px);
    padding-right:4px;
    scrollbar-width:thin; scrollbar-color:rgba(0,191,165,.2) transparent;
  }
  .ip-eco-wrap::-webkit-scrollbar       { width:3px; }
  .ip-eco-wrap::-webkit-scrollbar-thumb { background:rgba(0,191,165,.2); border-radius:2px; }

  .ip-tier        { display:flex; flex-direction:column; gap:7px; }
  .ip-tier-header { display:flex; align-items:flex-start; gap:10px; border-left:3px solid; padding-left:10px; }
  .ip-tier-num    { font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:700; letter-spacing:.3em; margin-top:2px; flex-shrink:0; }
  .ip-tier-title  { display:block; font-family:'Montserrat',sans-serif; font-size:clamp(11px,1vw,13px); font-weight:800; margin-bottom:2px; }
  .ip-tier-sub    { display:block; font-family:'JetBrains Mono',monospace; font-size:8.5px; font-weight:300; color:rgba(255,255,255,.38); letter-spacing:.04em; }

  /* Tier 1 — GPA cards */
  .ip-tier-cards  { display:grid; grid-template-columns:repeat(4,1fr); gap:7px; }
  .ip-gpa-card    { border:1px solid; border-radius:6px; padding:9px 10px; display:flex; flex-direction:column; gap:3px; cursor:default; transition:all .3s ease; animation:ipEcoIn .45s ease calc(var(--i)*.08s + .2s) both; }
  .ip-gpa-tag     { font-family:'JetBrains Mono',monospace; font-size:7px; font-weight:700; letter-spacing:.22em; text-transform:uppercase; border:1px solid; border-radius:2px; padding:1px 5px; width:fit-content; margin-bottom:2px; }
  .ip-gpa-crit    { font-family:'JetBrains Mono',monospace; font-size:9.5px; font-weight:600; color:rgba(255,255,255,.7); }
  .ip-gpa-fee     { font-family:'Montserrat',sans-serif; font-size:clamp(14px,1.5vw,19px); font-weight:900; line-height:1.1; }
  .ip-gpa-base    { font-family:'JetBrains Mono',monospace; font-size:7.5px; color:rgba(255,255,255,.25); }

  @media(max-width:1023px) { .ip-tier-cards { grid-template-columns:repeat(2,1fr); } }
  @media(max-width:767px)  { .ip-tier-cards { grid-template-columns:repeat(2,1fr); gap:6px; } }
  @media(max-width:479px)  { .ip-tier-cards { grid-template-columns:1fr; } }

  /* Tier 2 — Stipend */
  .ip-stipend-row       { display:grid; grid-template-columns:repeat(3,1fr) 1.4fr; gap:7px; align-items:stretch; }
  .ip-stipend-stat      { display:flex; flex-direction:column; gap:3px; background:rgba(233,30,140,.06); border:1px solid rgba(233,30,140,.2); border-radius:6px; padding:9px 11px; animation:ipEcoIn .45s ease calc(var(--i)*.08s + .2s) both; }
  .ip-stipend-val       { font-family:'Montserrat',sans-serif; font-size:clamp(14px,1.6vw,21px); font-weight:900; line-height:1; }
  .ip-stipend-label     { font-family:'Montserrat',sans-serif; font-size:10px; font-weight:700; color:#fff; margin-top:2px; }
  .ip-stipend-note      { font-family:'JetBrains Mono',monospace; font-size:7.5px; color:rgba(255,255,255,.3); }
  .ip-stipend-note-card { border:1px solid; border-radius:6px; padding:9px 11px; font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:300; color:rgba(255,255,255,.5); line-height:1.65; }

  @media(max-width:1023px) { .ip-stipend-row { grid-template-columns:repeat(3,1fr); } .ip-stipend-note-card { display:none; } }
  @media(max-width:767px)  { .ip-stipend-row { grid-template-columns:repeat(3,1fr); gap:6px; } }
  @media(max-width:479px)  { .ip-stipend-row { grid-template-columns:1fr; } }

  /* Tier 3 — Grants */
  .ip-grant-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:7px; }
  .ip-grant-card { border:1px solid; border-radius:6px; padding:10px 11px; display:flex; flex-direction:column; gap:4px; cursor:default; transition:all .3s ease; animation:ipEcoIn .45s ease calc(var(--i)*.09s + .25s) both; }
  .ip-grant-amt  { font-family:'Montserrat',sans-serif; font-size:clamp(13px,1.4vw,17px); font-weight:900; line-height:1; }
  .ip-grant-name { font-family:'Montserrat',sans-serif; font-size:10.5px; font-weight:800; color:#fff; line-height:1.3; }
  .ip-grant-desc { font-family:'JetBrains Mono',monospace; font-size:8.5px; font-weight:300; color:rgba(255,255,255,.4); line-height:1.6; margin-top:1px; }

  @media(max-width:1023px) { .ip-grant-grid { grid-template-columns:repeat(2,1fr); } }
  @media(max-width:767px)  { .ip-grant-grid { grid-template-columns:repeat(2,1fr); gap:6px; } }
  @media(max-width:479px)  { .ip-grant-grid { grid-template-columns:1fr; } }

  /* ══ Slide 07 — CTA ══ */
  .ip-invest   { display:flex; gap:clamp(16px,4vw,48px); flex-wrap:wrap; }
  .ip-inv-lbl  { font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:.35em; text-transform:uppercase; color:rgba(255,255,255,.3); margin-bottom:4px; }
  .ip-inv-amt  { font-family:'Montserrat','Arial Black',sans-serif; font-weight:900; font-size:clamp(20px,3vw,38px); color:#fff; }
  .ip-inv-amt sup { font-size:.45em; color:rgba(255,255,255,.35); }
  .ip-inv-date { font-family:'Montserrat',sans-serif; font-weight:700; font-size:clamp(16px,2.2vw,28px); }

  .ip-cta-note       { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-left-width:3px; padding:11px 15px; border-radius:3px; }
  .ip-cta-note-label { display:block; font-family:'JetBrains Mono',monospace; font-size:8px; letter-spacing:.35em; text-transform:uppercase; margin-bottom:4px; }

  .ip-btns   { display:flex; gap:10px; flex-wrap:wrap; }
  .ip-btn-p  { padding:12px 26px; border:none; border-radius:3px; cursor:pointer; font-family:'JetBrains Mono',monospace; font-size:10.5px; font-weight:700; letter-spacing:.28em; text-transform:uppercase; color:#000; background:linear-gradient(135deg,var(--a),var(--b)); background-size:200%; animation:ipGold 3.5s ease infinite; transition:transform .25s,box-shadow .25s; }
  .ip-btn-p:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,191,165,.35); }
  .ip-btn-s  { padding:12px 26px; border:1px solid rgba(255,255,255,.2); border-radius:3px; font-family:'JetBrains Mono',monospace; font-size:10.5px; font-weight:400; letter-spacing:.28em; text-transform:uppercase; color:rgba(255,255,255,.65); background:transparent; cursor:pointer; transition:all .25s; }
  .ip-btn-s:hover { border-color:rgba(255,255,255,.55); color:#fff; }

  @media(max-width:479px) {
    .ip-btn-p, .ip-btn-s { width:100%; text-align:center; padding:13px 16px; }
  }

  /* ══ Scroll hint + corner label ══ */
  .ip-scroll-hint  { position:absolute; bottom:clamp(20px,3vh,36px); left:50%; transform:translateX(-50%); z-index:20; display:flex; flex-direction:column; align-items:center; gap:8px; transition:opacity .6s ease; pointer-events:none; }
  .ip-scroll-line  { width:1px; height:40px; background:rgba(255,255,255,.08); position:relative; overflow:hidden; }
  .ip-scroll-line::after { content:''; position:absolute; top:-100%; left:0; width:100%; height:100%; background:linear-gradient(to bottom,${B.teal},${B.gold}); animation:ipDrop 2s ease-in-out infinite; }
  .ip-scroll-label { font-family:'JetBrains Mono',monospace; font-size:8px; letter-spacing:.4em; text-transform:uppercase; color:rgba(255,255,255,.3); }
  .ip-corner { position:absolute; bottom:14px; left:clamp(10px,2.5vw,36px); font-family:'JetBrains Mono',monospace; font-size:8px; letter-spacing:.3em; text-transform:uppercase; color:rgba(255,255,255,.18); z-index:20; }
  @media(max-width:479px) { .ip-corner { display:none; } }
`;}