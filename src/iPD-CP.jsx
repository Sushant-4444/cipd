import { useEffect, useRef, useState, useCallback } from "react";

const B = {
  teal:    "#00BFA5",
  magenta: "#E91E8C",
  gold:    "#FFB300",
  dark:    "#080810",
};

const SLIDES = [
  { pct:[0,20],   id:"01", headline:"iPD-CP:\nTHE ACCELERATOR", color:B.magenta, type:"identity" },
  { pct:[21,40],  id:"02", headline:"BEYOND THE\nSIMULATION",    color:B.teal,    type:"handson"  },
  { pct:[41,60],  id:"03", headline:"THE MASTERY\nTRACK",        color:"#FFFFFF", type:"modules"  },
  { pct:[61,80],  id:"04", headline:"ARE YOU THE\nRIGHT FIT?",  color:B.magenta, type:"audience" },
  { pct:[81,100], id:"05", headline:"RESERVE YOUR\nSEAT",        color:"gold",    type:"cta"      },
];

const MULTIPLIER = 5;
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const accentOf = s => s.color === "gold" ? B.gold : s.color;

const COMPS = [
  { cx:28, cy:32, w:7,  h:7,  label:"MCU",  pins:[[28,25],[21,32],[35,32],[28,39]] },
  { cx:55, cy:24, w:5,  h:3,  label:"R1",   pins:[] },
  { cx:68, cy:32, w:4,  h:4,  label:"C1",   pins:[] },
  { cx:18, cy:55, w:8,  h:5,  label:"PWR",  pins:[[18,50],[26,55]] },
  { cx:72, cy:50, w:5,  h:5,  label:"IC2",  pins:[[67,50],[77,50],[72,45],[72,55]] },
  { cx:42, cy:62, w:6,  h:3,  label:"U3",   pins:[] },
];

const TRACES = [
  { d:"M 28,39 L 28,55 L 26,55",          color:B.teal    },
  { d:"M 35,32 L 55,32 L 55,25.5",        color:B.teal    },
  { d:"M 55,22.5 L 55,18 L 68,18 L 68,30",color:B.magenta },
  { d:"M 72,45 L 72,39 L 42,39 L 42,34.5",color:B.teal    },
  { d:"M 42,65.5 L 42,72 L 72,72 L 72,55",color:B.gold    },
  { d:"M 67,50 L 55,50 L 55,27.5",        color:B.magenta },
];

export default function IPDCPSection() {
  const containerRef = useRef(null);       // the tall outer div
  const [prog,      setProg]     = useState(0);
  const [slideIdx,  setSlideIdx] = useState(0);
  const [dir,       setDir]      = useState(1);
  const [phase,     setPhase]    = useState("idle");
  const [pcbStep,   setPcbStep]  = useState(0);
  const [modVis,    setModVis]   = useState(-1);
  const [hov,       setHov]      = useState(null);
  const [mounted,   setMounted]  = useState(false);
  const lastIdxRef  = useRef(0);
  const timerRef    = useRef(null);

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

  // ── Window scroll listener — same pattern as CiPDScrollStory ──
  useEffect(() => {
    function onScroll() {
      const el = containerRef.current;
      if (!el) return;

      const rect    = el.getBoundingClientRect();
      const total   = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;

      // not yet scrolled into this section
      if (rect.top > 0) { setProg(0); return; }

      const p   = clamp(scrolled / total, 0, 1);
      const pct = p * 100;
      setProg(p);
      setPcbStep(pct >= 21 && pct <= 40 ? Math.floor(((pct-21)/19)*5) : pct > 40 ? 5 : 0);
      setModVis(pct >= 41 && pct <= 60 ? Math.floor(((pct-41)/19)*3)  : pct < 41 ? -1 : 2);
      const idx = SLIDES.findIndex(s => pct >= s.pct[0] && pct <= s.pct[1]);
      goTo(idx === -1 ? (pct > 80 ? 4 : 0) : idx);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, [goTo]);

  if (!mounted) return null;

  const slide  = SLIDES[slideIdx];
  const accent = accentOf(slide);
//   const localPct = clamp((prog*100 - slide.pct[0]) / (slide.pct[1] - slide.pct[0]), 0, 1);

  return (
    <>
      <style>{CSS(B)}</style>

      {/* Tall outer div — sits in normal document flow, drives window scroll */}
      <div ref={containerRef} className="ip-outer" style={{ height:`${MULTIPLIER * 100}vh` }}>

        {/* Sticky viewport — pins while outer div scrolls past */}
        <div className="ip-sticky">

          <div className="ip-pcb-wrap">
            <PCBBoard step={pcbStep} accent={accent} slideIdx={slideIdx} />
          </div>

          <div className="ip-overlay" style={{
            background:`linear-gradient(105deg, ${B.dark}ee 0%, ${B.dark}cc 45%, ${B.dark}55 75%, transparent 100%)`
          }}/>
          <div className="ip-ambient" style={{
            background:`radial-gradient(ellipse 55% 60% at 72% 50%, ${accent}28 0%, transparent 70%)`,
            transition:"background 0.9s ease"
          }}/>

          <div className="ip-prog-track">
            <div className="ip-prog-fill" style={{ width:`${prog*100}%` }}/>
          </div>

          <nav className="ip-nav">
            {SLIDES.map((s,i) => (
              <div key={i} className={`ip-nav-item ${i===slideIdx?"active":i<slideIdx?"done":""}`}>
                <div className="ip-nav-dot" style={i<=slideIdx?{background:`radial-gradient(circle, ${accentOf(s)}, ${accentOf(s)}66)`}:{}}/>
                {i===slideIdx && <div className="ip-nav-ring" style={{borderColor:accent}}/>}
              </div>
            ))}
          </nav>

          <div className="ip-stage">
            <SlideFrame key={slideIdx} slide={slide} phase={phase} dir={dir}>
              {slide.type==="identity"  && <SlideIdentity  accent={accent}/>}
              {slide.type==="handson"   && <SlideHandson   accent={accent} pcbStep={pcbStep}/>}
              {slide.type==="modules"   && <SlideModules   accent={accent} visible={modVis}/>}
              {slide.type==="audience"  && <SlideAudience  accent={accent} hov={hov} setHov={setHov}/>}
              {slide.type==="cta"       && <SlideCTA       accent={accent} hov={hov} setHov={setHov}/>}
            </SlideFrame>
          </div>

          <div className="ip-scroll-hint" style={{opacity: prog < 0.05 ? 1 : 0}}>
            <div className="ip-scroll-line"/>
            <span className="ip-scroll-label">scroll</span>
          </div>

          <div className="ip-corner">iPD-CP · {slide.id}/05</div>
        </div>
      </div>
    </>
  );
}

// ── Frame with smooth transition ──
function SlideFrame({ slide, phase, dir, children }) {
  const accent  = accentOf(slide);
  const isExit  = phase === "exit";
  const isEnter = phase === "enter";
  const yExit   = dir === 1 ? "-6vh" : "6vh";
  const yEnter  = dir === 1 ? "6vh"  : "-6vh";

  return (
    <div className="ip-frame" style={{
      animation: isEnter ? `ipSlideIn 0.7s cubic-bezier(0.22,1,0.36,1) both` : "none",
      "--y-from": yEnter,
      opacity:   isExit ? 0 : 1,
      transform: isExit ? `translateY(${yExit}) scale(0.97)` : "translateY(0) scale(1)",
      filter:    isExit ? "blur(8px)" : "blur(0px)",
      transition: isExit
        ? "opacity 0.38s cubic-bezier(0.4,0,1,1), transform 0.38s cubic-bezier(0.4,0,1,1), filter 0.38s ease"
        : "none",
    }}>
      <div className="ip-frame-accent" style={{background:accent}}/>
      <div className="ip-eyebrow" style={{color:accent}}>
        <span className="ip-eyebrow-id">{slide.id}</span> / 05 — iPD-CP
      </div>
      <h2 className="ip-headline" style={
        slide.color==="gold"
          ? {backgroundImage:`linear-gradient(120deg,${B.teal},${B.gold})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text"}
          : {color:slide.color}
      }>{slide.headline}</h2>
      <div className="ip-rule" style={{
        background: slide.color==="gold"
          ? `linear-gradient(90deg,${B.teal},${B.gold})`
          : `linear-gradient(90deg,${slide.color} 0%,transparent 100%)`
      }}/>
      <div className="ip-body-wrap">{children}</div>
    </div>
  );
}

// ── PCB Board ──
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
      <rect x="8" y="6" width="84" height="68" rx="2"
        fill="rgba(0,35,28,0.55)" stroke="rgba(0,191,165,0.25)" strokeWidth="0.4"/>
      {[[9,7],[89,7],[9,73],[89,73]].map(([x,y],i) => (
        <g key={i} stroke="rgba(0,191,165,0.4)" strokeWidth="0.5" fill="none">
          <line x1={x} y1={y} x2={x+(i%2===0?3:-3)} y2={y}/>
          <line x1={x} y1={y} x2={x} y2={y+(i<2?3:-3)}/>
        </g>
      ))}
      {TRACES.map((tr,i) => (
        <path key={i} d={tr.d} fill="none" stroke={tr.color} strokeWidth="0.55" strokeLinecap="round"
          opacity="0.7" filter="url(#glow)"
          style={{
            strokeDasharray:80,
            strokeDashoffset: step > i ? 0 : 80,
            transition:`stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1) ${i*0.12}s`,
          }}
        />
      ))}
      {[[28,39],[55,27.5],[35,32],[42,39],[55,50],[72,55]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="0.7"
          fill={B.dark} stroke={B.teal} strokeWidth="0.4"
          opacity={step > i ? 0.9 : 0}
          style={{transition:`opacity 0.4s ease ${i*0.1}s`}}
        />
      ))}
      {COMPS.map((c,i) => (
        <g key={i} filter="url(#glow)"
          style={{opacity: step > i ? 1 : 0, transition:`opacity 0.5s ease ${i*0.1}s`}}>
          {c.pins.map(([px,py],j) => (
            <circle key={j} cx={px} cy={py} r="0.6" fill={B.teal} opacity="0.5"/>
          ))}
          <rect x={c.cx-c.w/2} y={c.cy-c.h/2} width={c.w} height={c.h} rx="0.6"
            fill="rgba(0,191,165,0.1)" stroke={accent} strokeWidth="0.35"/>
          <text x={c.cx} y={c.cy+0.7} textAnchor="middle"
            fill={accent} fontSize="1.5" fontFamily="monospace" opacity="0.9">{c.label}</text>
          {i === slideIdx % COMPS.length && (
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

// ── Slides ──
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
            opacity:   visible >= i ? 1 : 0,
            transform: visible >= i ? "none" : "translateY(20px) scale(0.96)",
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

function SlideAudience({ accent, hov, setHov }) {
  const cards = [
    { icon:"🎓", t:"Final-Year Students",      d:"Keen on building world-class hardware products." },
    { icon:"⚡", t:"Recent Graduates",          d:"Looking to boost employability through specialized upskilling." },
    { icon:"🚀", t:"Startups & Entrepreneurs", d:"Seeking 'first-time-right' commercialization strategies." },
    { icon:"⚙️", t:"Professionals",             d:"Specialized training in Embedded Systems & Product Design." },
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

function SlideCTA({ accent, hov, setHov }) {
  const schs = [
    { l:"Women in Tech",   d:"Scholarship worth ₹10,000 for women candidates.", c:B.magenta },
    { l:"EWS Scholarship", d:"Fee concession for economically weaker sections.", c:B.teal   },
    { l:"Merit Award",     d:"Up to ₹25,000 for degree toppers & hackathon winners.", c:B.gold },
  ];
  return (
    <div className="ip-content">
      <div className="ip-invest">
        <div><div className="ip-inv-lbl">Programme Fee</div><div className="ip-inv-amt">₹1,25,000 <sup>+GST</sup></div></div>
        <div><div className="ip-inv-lbl">Next Cohort</div><div className="ip-inv-date" style={{color:B.gold}}>June 23, 2025</div></div>
      </div>
      <div className="ip-sch-wrap">
        <div className="ip-sch-lbl">Scholarships Available</div>
        <div className="ip-sch-row">
          {schs.map((s,i) => (
            <div key={i} className="ip-sch"
              style={{borderColor:s.c, background:hov===`s${i}`?`${s.c}18`:"transparent", boxShadow:hov===`s${i}`?`0 0 16px ${s.c}44`:"none"}}
              onMouseEnter={()=>setHov(`s${i}`)} onMouseLeave={()=>setHov(null)}>
              <span className="ip-sch-name">{s.l}</span>
              <span className="ip-sch-d">{s.d}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="ip-btns">
        <button className="ip-btn-p" style={{"--a":B.teal,"--b":B.gold}}>Apply Now</button>
        <button className="ip-btn-s">Download Brochure</button>
      </div>
    </div>
  );
}

// ── CSS ──
function CSS(B){ return `
  @keyframes ipSlideIn {
    from { opacity:0; transform:translateY(var(--y-from,6vh)) scale(0.97); filter:blur(10px); }
    to   { opacity:1; transform:translateY(0) scale(1); filter:blur(0px); }
  }
  @keyframes ipRuleGrow { from{width:0;opacity:0} to{width:52px;opacity:1} }
  @keyframes ipPing     { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.6);opacity:0} }
  @keyframes ipDrop     { 0%{top:-100%} 100%{top:100%} }
  @keyframes ipGold     { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes ipFadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
  @keyframes ipPcbPulse { 0%,100%{opacity:1} 50%{opacity:0.82} }

  *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

  /* Tall outer div — in normal document flow */
  .ip-outer { position:relative; width:100%; }

  /* Sticky panel — stays pinned while outer scrolls */
  .ip-sticky {
    position:sticky; top:0; height:100vh; width:100%;
    overflow:hidden; background:${B.dark};
  }

  .ip-pcb-wrap {
    position:absolute; inset:0; display:flex; align-items:stretch; justify-content:flex-end;
    pointer-events:none; z-index:1; animation:ipPcbPulse 6s ease-in-out infinite;
  }
  .ip-pcb-svg { width:58%; height:100%; }

  .ip-overlay { position:absolute; inset:0; z-index:2; pointer-events:none; }
  .ip-ambient { position:absolute; inset:0; z-index:3; pointer-events:none; }

  .ip-prog-track { position:absolute; bottom:0; left:0; right:0; height:2px; background:rgba(255,255,255,.07); z-index:20; }
  .ip-prog-fill  { height:100%; background:linear-gradient(90deg,${B.teal},${B.magenta},${B.gold}); transition:width .15s linear; }

  .ip-nav { position:absolute; right:clamp(12px,2.5vw,36px); top:50%; transform:translateY(-50%); display:flex; flex-direction:column; gap:16px; z-index:20; }
  .ip-nav-item { position:relative; width:10px; height:10px; display:flex; align-items:center; justify-content:center; opacity:.28; transition:opacity .4s; }
  .ip-nav-item.active { opacity:1; }
  .ip-nav-item.done   { opacity:.55; }
  .ip-nav-dot  { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,.25); transition:background .4s,transform .3s; }
  .ip-nav-item.active .ip-nav-dot { transform:scale(1.6); }
  .ip-nav-ring { position:absolute; inset:-4px; border-radius:50%; border:1.5px solid; animation:ipPing 1.4s ease-out infinite; }

  .ip-stage { position:absolute; inset:0; z-index:10; display:flex; align-items:stretch; }
  .ip-frame {
    flex:1; display:flex; flex-direction:column; justify-content:center;
    padding:clamp(48px,8vh,80px) clamp(24px,7vw,96px);
    max-width:min(640px,55%); position:relative; will-change:transform,opacity,filter;
  }
  @media(max-width:700px) {
    .ip-frame { max-width:100%; padding:60px 24px 80px; }
    .ip-pcb-wrap { opacity:0.35; }
    .ip-overlay { background:linear-gradient(105deg,${B.dark}ff 0%,${B.dark}dd 60%,${B.dark}88 100%) !important; }
  }

  .ip-frame-accent { position:absolute; left:0; top:18%; width:3px; height:64%; border-radius:0 2px 2px 0; opacity:0.9; animation:ipFadeUp .5s ease .4s both; }
  .ip-eyebrow { font-family:'JetBrains Mono',monospace; font-size:clamp(9px,1vw,11px); letter-spacing:.38em; font-weight:300; text-transform:uppercase; margin-bottom:14px; color:rgba(255,255,255,.45); }
  .ip-eyebrow-id { font-weight:700; }
  .ip-headline { font-family:'Montserrat','Arial Black',sans-serif; font-size:clamp(28px,4.8vw,72px); font-weight:900; line-height:.92; letter-spacing:-.02em; white-space:pre-line; }
  .ip-rule { height:3px; border-radius:2px; margin:18px 0 20px; animation:ipRuleGrow .55s cubic-bezier(.16,1,.3,1) .3s both; }
  .ip-body-wrap { display:flex; flex-direction:column; animation:ipFadeUp .6s ease .22s both; }

  .ip-content { display:flex; flex-direction:column; gap:clamp(12px,2vh,20px); }
  .ip-body { font-size:clamp(13px,1.2vw,16px); font-weight:300; color:rgba(255,255,255,.65); line-height:1.8; }
  .ip-body strong { color:#fff; font-weight:600; }

  .ip-card { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); border-left-width:3px; padding:12px 16px; border-radius:2px; }
  .ip-card-label { display:block; font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:.35em; text-transform:uppercase; margin-bottom:5px; }
  .ip-card-text  { font-size:13px; font-weight:300; color:rgba(255,255,255,.65); line-height:1.65; }

  .ip-stats { display:flex; gap:clamp(16px,3vw,32px); flex-wrap:wrap; }
  .ip-stat  { display:flex; flex-direction:column; gap:3px; animation:ipFadeUp .5s ease calc(var(--i)*.1s + .4s) both; }
  .ip-stat-n { font-family:'Montserrat','Arial Black',sans-serif; font-size:clamp(26px,3.5vw,44px); font-weight:900; line-height:1; }
  .ip-stat-l { font-family:'JetBrains Mono',monospace; font-size:8px; letter-spacing:.25em; text-transform:uppercase; color:rgba(255,255,255,.3); }

  .ip-counter { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:2px; border:1px solid; font-family:'JetBrains Mono',monospace; font-size:12px; flex-wrap:wrap; }
  .ip-counter-n { font-size:22px; font-weight:700; color:#fff; }

  .ip-feats { display:flex; flex-direction:column; gap:8px; }
  .ip-feat  { display:flex; align-items:flex-start; gap:12px; padding:10px 14px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:2px; transition:border-color .3s; animation:ipFadeUp .5s ease calc(var(--i)*.1s + .35s) both; }
  .ip-feat:hover { border-color:rgba(0,191,165,.3); }
  .ip-feat-icon { font-size:18px; flex-shrink:0; margin-top:1px; }
  .ip-feat-t { font-size:13px; font-weight:600; color:#fff; margin-bottom:2px; }
  .ip-feat-d { font-size:11px; color:rgba(255,255,255,.45); line-height:1.6; }

  .ip-mod-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  @media(max-width:500px){ .ip-mod-grid { grid-template-columns:1fr; } }
  .ip-mod { position:relative; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-top-width:2px; padding:16px 14px 24px; border-radius:3px; overflow:hidden; }
  .ip-mod-icon { font-size:20px; margin-bottom:8px; display:block; }
  .ip-mod-t { font-family:'Montserrat',sans-serif; font-weight:800; font-size:13px; color:#fff; margin-bottom:5px; }
  .ip-mod-d { font-size:11px; color:rgba(255,255,255,.45); line-height:1.6; }
  .ip-mod-n { position:absolute; bottom:6px; right:10px; font-family:'JetBrains Mono',monospace; font-size:24px; font-weight:700; color:rgba(255,255,255,.05); }

  .ip-aud-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
  @media(max-width:500px){ .ip-aud-grid { grid-template-columns:1fr; } }
  .ip-aud { padding:14px 16px; border:1px solid; border-radius:4px; transition:all .35s ease; cursor:default; animation:ipFadeUp .5s ease calc(var(--i)*.08s + .3s) both; }
  .ip-aud-icon { font-size:20px; display:block; margin-bottom:6px; }
  .ip-aud-t { font-size:13px; font-weight:600; color:#fff; margin-bottom:3px; }
  .ip-aud-d { font-size:11px; color:rgba(255,255,255,.45); line-height:1.6; }

  .ip-invest { display:flex; gap:clamp(20px,4vw,48px); flex-wrap:wrap; }
  .ip-inv-lbl  { font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:.35em; text-transform:uppercase; color:rgba(255,255,255,.3); margin-bottom:4px; }
  .ip-inv-amt  { font-family:'Montserrat','Arial Black',sans-serif; font-weight:900; font-size:clamp(22px,3vw,38px); color:#fff; }
  .ip-inv-amt sup { font-size:.45em; color:rgba(255,255,255,.35); }
  .ip-inv-date { font-family:'Montserrat',sans-serif; font-weight:700; font-size:clamp(18px,2.2vw,28px); }

  .ip-sch-wrap { }
  .ip-sch-lbl  { font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:.35em; text-transform:uppercase; color:rgba(255,255,255,.3); margin-bottom:10px; display:block; }
  .ip-sch-row  { display:flex; gap:10px; flex-wrap:wrap; }
  .ip-sch  { padding:10px 14px; border:1px solid; border-radius:2px; cursor:default; transition:all .35s ease; flex:1; min-width:120px; }
  .ip-sch-name { display:block; font-size:12px; font-weight:600; color:#fff; margin-bottom:3px; }
  .ip-sch-d    { display:block; font-size:10px; color:rgba(255,255,255,.45); line-height:1.5; }

  .ip-btns { display:flex; gap:12px; flex-wrap:wrap; }
  .ip-btn-p { padding:12px 28px; border:none; border-radius:2px; cursor:pointer; font-size:11px; font-weight:700; letter-spacing:.3em; text-transform:uppercase; color:#000; background:linear-gradient(135deg,var(--a),var(--b)); background-size:200%; animation:ipGold 3.5s ease infinite; transition:transform .25s,box-shadow .25s; }
  .ip-btn-p:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,191,165,0.35); }
  .ip-btn-s { padding:12px 28px; border:1px solid rgba(255,255,255,.2); border-radius:2px; font-size:11px; font-weight:400; letter-spacing:.3em; text-transform:uppercase; color:rgba(255,255,255,.65); background:transparent; cursor:pointer; transition:all .25s; }
  .ip-btn-s:hover { border-color:rgba(255,255,255,.55); color:#fff; }

  .ip-scroll-hint { position:absolute; bottom:36px; left:50%; transform:translateX(-50%); z-index:20; display:flex; flex-direction:column; align-items:center; gap:8px; transition:opacity .6s ease; pointer-events:none; }
  .ip-scroll-line { width:1px; height:44px; background:rgba(255,255,255,.08); position:relative; overflow:hidden; }
  .ip-scroll-line::after { content:''; position:absolute; top:-100%; left:0; width:100%; height:100%; background:linear-gradient(to bottom,${B.teal},${B.gold}); animation:ipDrop 2s ease-in-out infinite; }
  .ip-scroll-label { font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:.4em; text-transform:uppercase; color:rgba(255,255,255,.3); }
  .ip-corner { position:absolute; bottom:16px; left:clamp(12px,2.5vw,36px); font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:.3em; text-transform:uppercase; color:rgba(255,255,255,.18); z-index:20; }
`;}