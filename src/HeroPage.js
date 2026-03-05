import { useState, useEffect, useRef, useCallback } from "react";

const VIDEOS = [
  { src: "/videos/4.mp4"   },
  { src: "/videos/2.mp4" },
  { src: "/videos/3.mp4"    },
];

const SECTIONS = [
  {
    id: "01", heading: null, sub: null,
    tagline: "Where Research Meets Reality.",
    body: null, cta: null, align: "center", eyeColor: "#00BFA5",
  },
  {
    id: "02", heading: "Engineering\nthe Future", sub: null, tagline: null,
    body: "Transforming academic research into intelligent hardware through hands-on innovation and collaborative design.\n\nBridging the gap from a spark of an idea to a functional prototype.",
    cta: null, align: "left", eyeColor: "#E91E8C",
  },
  {
    id: "03", heading: "Industry-Ready\nInnovation", sub: null, tagline: null,
    body: "Empowering India's product nation by delivering production-grade intelligent systems ready for the real world.",
    cta: "Explore Our Labs", align: "right", eyeColor: "#00BFA5",
  },
];

const OVERLAYS = [
  "radial-gradient(ellipse at center, rgba(10,10,22,.08) 0%, rgba(10,10,22,.55) 100%)",
  "linear-gradient(105deg, rgba(10,10,22,.92) 0%, rgba(10,10,22,.52) 58%, rgba(10,10,22,.14) 100%)",
  "linear-gradient(255deg, rgba(10,10,22,.9) 0%, rgba(10,10,22,.52) 50%, rgba(10,10,22,.14) 100%)",
];

const BLOBS = [
  { top:"8%",  left:"50%",  size:520, bg:"radial-gradient(circle, rgba(0,191,165,.16) 0%, transparent 68%)",  tx:"-50%" },
  { top:"55%", left:"4%",   size:440, bg:"radial-gradient(circle, rgba(233,30,140,.13) 0%, transparent 68%)", tx:"0" },
  { top:"15%", right:"4%",  size:480, bg:"radial-gradient(circle, rgba(123,45,139,.18) 0%, transparent 68%)", tx:"0" },
];

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

export default function CiPDHero({ onComplete }) {
  const vRefs     = useRef([]);
  const lastIdx   = useRef(0);
  const inTransit = useRef(false);
  const accDelta  = useRef(0);
  const [active, setActive] = useState(0);
  const [textIn, setTextIn] = useState(true);

  // goTo — defined first so useEffects below can reference it
  const goTo = useCallback((next) => {
    if (next > SECTIONS.length - 1) { if (onComplete) onComplete(); return; }
    if (inTransit.current || next === lastIdx.current) return;
    inTransit.current = true;
    setTextIn(false);
    setTimeout(() => {
      lastIdx.current = next;
      setActive(next);
      setTextIn(true);
      accDelta.current = 0;
      setTimeout(() => { inTransit.current = false; }, 200);
    }, 380);
  }, [onComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fonts
  useEffect(() => {
    if (document.querySelector("#cipd-fonts")) return;
    const l = document.createElement("link");
    l.id   = "cipd-fonts";
    l.rel  = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,300;0,400;0,600;1,300&display=swap";
    document.head.appendChild(l);
  }, []);

  // Play video + auto-advance
  useEffect(() => {
    vRefs.current.forEach((v, i) => {
      if (!v) return;
      v.onended = null;
      if (i === active) {
        v.loop = false;
        v.currentTime = 0;
        v.play().catch(() => {});
        v.onended = () => goTo(active + 1);
      } else {
        v.pause();
      }
    });
  }, [active, goTo]);

  // Scroll / touch / keyboard
  useEffect(() => {
    const onW = e => {
      e.preventDefault();
      if (inTransit.current) return;
      accDelta.current += e.deltaY;
      if (accDelta.current > 110)  { accDelta.current = 0; goTo(lastIdx.current + 1); }
      if (accDelta.current < -110) { accDelta.current = 0; goTo(clamp(lastIdx.current - 1, 0, SECTIONS.length - 1)); }
    };
    let ty = 0;
    const onTS = e => { ty = e.touches[0].clientY; };
    const onTE = e => { const d = ty - e.changedTouches[0].clientY; if (Math.abs(d) > 40) goTo(lastIdx.current + (d > 0 ? 1 : -1)); };
    const onK  = e => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goTo(lastIdx.current + 1);
      if (e.key === "ArrowUp"   || e.key === "ArrowLeft")  goTo(clamp(lastIdx.current - 1, 0, SECTIONS.length - 1));
    };
    window.addEventListener("wheel", onW, { passive: false });
    window.addEventListener("touchstart", onTS, { passive: true });
    window.addEventListener("touchend",   onTE, { passive: true });
    window.addEventListener("keydown",    onK);
    return () => {
      window.removeEventListener("wheel", onW);
      window.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchend",   onTE);
      window.removeEventListener("keydown",    onK);
    };
  }, [goTo]);

  const sec    = SECTIONS[active];
  const bl     = BLOBS[active];
  const isLast = active === SECTIONS.length - 1;

  return (
    <>
      <style>{HERO_CSS}</style>
      <Cursor />
      <div className="h-wrap">

        <div className="h-vids">
          {VIDEOS.map((v, i) => (
            <video key={i} ref={el => { vRefs.current[i] = el; }}
              src={v.src} muted playsInline
              style={{ opacity: i === active ? 1 : 0 }} />
          ))}
        </div>

        <div className="h-grain" />
        <div className="h-ov" style={{ background: OVERLAYS[active] }} />

        {active !== 0 && (
          <div className="h-blob" style={{
            top: bl.top, left: bl.left, right: bl.right,
            width: bl.size, height: bl.size, background: bl.bg,
            transform: `translateX(${bl.tx})`,
          }} />
        )}

        <header className="h-bar">
          {/* <div className="h-wm">
            <SBlob />
            <span className="h-wm-text">Ci<span className="h-acc">P</span>D</span>
          </div> */}
          <span className="h-inst">IIIT Delhi</span>
        </header>

        <div className="h-ctr">
          {String(active + 1).padStart(2, "0")} / {String(SECTIONS.length).padStart(2, "0")}
        </div>

        {/* S1 — just tagline at bottom */}
        {active === 0 && (
          <div className={`h-s1tag ${textIn ? "" : "out"}`}>
            <div className="h-s1line" />
            <span className={`h-s1text ${textIn ? "anim" : ""}`}>Where Research Meets Reality.</span>
          </div>
        )}

        {/* S2 & S3 — full text block */}
        {active !== 0 && (
          <div className={`h-content c-${sec.align}`}>
            <div className={`h-blk ${textIn ? "" : "out"}`}>
              <div className="h-eye anim" style={{ color: sec.eyeColor, animationDelay: ".04s" }}>
                {sec.id} — CiPD IIITD
              </div>
              {sec.heading && (
                <h1 className="h-h1 anim" style={{ animationDelay: ".13s" }}>{sec.heading}</h1>
              )}
              <div className="h-ln anim" style={{ animationDelay: ".25s" }} />
              {sec.sub     && <p className="h-sub  anim" style={{ animationDelay: ".30s" }}>{sec.sub}</p>}
              {sec.tagline && <p className="h-tag  anim" style={{ animationDelay: ".40s" }}>{sec.tagline}</p>}
              {sec.body    && <p className="h-body anim" style={{ animationDelay: ".32s" }}>{sec.body}</p>}
              {sec.cta     && (
                <button className="h-cta anim" style={{ animationDelay: ".50s" }}>
                  {sec.cta}
                  <svg width="18" height="10" fill="none" viewBox="0 0 18 10">
                    <path d="M1 5h16M12 1l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        <nav className="h-dots">
          {SECTIONS.map((_, i) => (
            <button key={i} className={`h-dot ${i === active ? "on" : ""}`}
              onClick={() => goTo(i)} aria-label={`Section ${i + 1}`} />
          ))}
        </nav>

        <div className={`h-scrl ${isLast ? "last" : ""}`}>
          <div className="h-scrl-line" />
          <span>{isLast ? "continue" : "scroll"}</span>
        </div>

        <div className="h-bdg"><strong>IIIT Delhi</strong> · Okhla Phase III</div>

      </div>
    </>
  );
}

function SBlob() {
  return (
    <svg width="28" height="36" viewBox="0 0 60 78" fill="none">
      <defs>
        <linearGradient id="slg" x1="0" y1="78" x2="60" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#E91E8C" />
          <stop offset="48%"  stopColor="#7B2D8B" />
          <stop offset="100%" stopColor="#00BFA5" />
        </linearGradient>
      </defs>
      <path d="M42 7C42 7 56 11 56 24C56 37 36 37 30 44C24 51 18 54 18 65C18 74 36 74 42 74"
        stroke="url(#slg)" strokeWidth="14" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function Cursor() {
  const d = useRef(null), r = useRef(null);
  useEffect(() => {
    const m = e => {
      if (d.current) { d.current.style.left = e.clientX + "px"; d.current.style.top = e.clientY + "px"; }
      if (r.current) { r.current.style.left = e.clientX + "px"; r.current.style.top = e.clientY + "px"; }
    };
    window.addEventListener("mousemove", m, { passive: true });
    return () => window.removeEventListener("mousemove", m);
  }, []);
  return (
    <>
      <div className="h-cur-dot"  ref={d} />
      <div className="h-cur-ring" ref={r} />
    </>
  );
}

const HERO_CSS = `
  @keyframes hFadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes hLineGrw { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  @keyframes hDrop    { 0%{top:-100%} 100%{top:200%} }
  @keyframes hShift   { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes hPulse   { 0%{box-shadow:0 0 0 0 rgba(0,191,165,.45)} 70%{box-shadow:0 0 0 14px rgba(0,191,165,0)} 100%{box-shadow:0 0 0 0 rgba(0,191,165,0)} }
  @keyframes hFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }

  .h-wrap {
    position: fixed; inset: 0;
    font-family: 'Barlow', sans-serif;
    overflow: hidden; cursor: none;
    background: #0A0A16; z-index: 0;
  }
  .h-vids { position:absolute; inset:0; pointer-events:none; }
  .h-vids video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:opacity .8s cubic-bezier(.4,0,.2,1); }
  .h-grain { position:absolute; inset:0; z-index:2; pointer-events:none; opacity:.28;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.07'/%3E%3C/svg%3E");
    background-size:180px; }
  .h-ov   { position:absolute; inset:0; z-index:3; pointer-events:none; transition:background .8s ease; }
  .h-blob { position:absolute; z-index:4; pointer-events:none; border-radius:50%; filter:blur(85px); animation:hFloat 9s ease-in-out infinite; transition:all .9s ease; }
  .h-bar  { position:absolute; top:0; left:0; right:0; z-index:30; display:flex; align-items:center; justify-content:space-between; padding:28px 52px 0; }
  .h-wm   { display:flex; align-items:center; gap:11px; }
  .h-wm-text { font-family:'Bebas Neue',sans-serif; font-size:24px; letter-spacing:.14em; color:#fff; }
  .h-acc  { color:#00BFA5; }
  .h-inst { font-size:11px; font-weight:300; letter-spacing:.22em; color:rgba(255,255,255,.35); text-transform:uppercase; }
  .h-ctr  { position:absolute; top:50%; right:44px; transform:translateY(-50%) rotate(90deg); font-size:10px; letter-spacing:.35em; color:rgba(255,255,255,.3); font-weight:300; z-index:30; text-transform:uppercase; font-family:'Barlow',sans-serif; }

  .h-s1tag { position:absolute; bottom:90px; left:50%; transform:translateX(-50%); z-index:20; display:flex; flex-direction:column; align-items:center; gap:10px; transition:opacity .35s ease, transform .35s ease; }
  .h-s1tag.out { opacity:0; transform:translateX(-50%) translateY(10px); }
  .h-s1line { width:40px; height:2px; border-radius:2px; background:linear-gradient(90deg,#00BFA5,#E91E8C); }
  .h-s1text { font-size:clamp(12px,1.1vw,15px); font-weight:300; letter-spacing:.28em; text-transform:uppercase; color:rgba(255,255,255,.5); white-space:nowrap; }
  .h-s1text.anim { animation:hFadeUp .7s cubic-bezier(.16,1,.3,1) .3s both; }

  .h-content { position:absolute; inset:0; z-index:20; display:flex; align-items:center; padding:0 10vw; }
  .c-center  { justify-content:center; text-align:center; }
  .c-left    { justify-content:flex-start; text-align:left; }
  .c-right   { justify-content:flex-end; text-align:right; }

  .h-blk { max-width:680px; transition:opacity .35s ease, transform .35s ease; }
  .h-blk.out { opacity:0; transform:translateY(-16px); }
  .anim { animation:hFadeUp .62s cubic-bezier(.16,1,.3,1) both; }

  .h-eye  { font-size:11px; letter-spacing:.4em; font-weight:300; text-transform:uppercase; margin-bottom:16px; }
  .h-h1   { font-family:'Bebas Neue',sans-serif; font-size:clamp(66px,9.5vw,134px); line-height:.93; letter-spacing:.02em; color:#fff; white-space:pre-line; }
  .h-ln   { height:3px; width:56px; margin:20px 0; border-radius:2px; background:linear-gradient(90deg,#00BFA5,#E91E8C); transform-origin:left; }
  .c-center .h-ln { margin-left:auto; margin-right:auto; transform-origin:center; }
  .c-right  .h-ln { margin-left:auto; transform-origin:right; }
  .h-ln.anim { animation:hLineGrw .5s cubic-bezier(.16,1,.3,1) both; }
  .h-sub  { font-size:clamp(15px,1.6vw,21px); font-weight:300; font-style:italic; color:rgba(255,255,255,.76); letter-spacing:.05em; line-height:1.55; white-space:pre-line; margin-bottom:10px; }
  .h-tag  { font-size:clamp(12px,1.1vw,16px); font-weight:600; letter-spacing:.18em; text-transform:uppercase; margin-top:8px; background:linear-gradient(90deg,#00BFA5,#E91E8C); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .h-body { font-size:clamp(14px,1.25vw,17px); font-weight:300; color:rgba(255,255,255,.76); line-height:1.82; white-space:pre-line; margin-top:6px; }
  .h-cta  { display:inline-flex; align-items:center; gap:12px; margin-top:36px; padding:14px 36px; border:none; outline:none; cursor:pointer; font-family:'Barlow',sans-serif; font-size:12px; font-weight:600; letter-spacing:.3em; text-transform:uppercase; color:#fff; background:linear-gradient(135deg,#00BFA5,#7B2D8B,#E91E8C); background-size:200% 200%; border-radius:2px; animation:hShift 4s ease infinite,hPulse 2.6s ease-out 1.5s infinite; transition:transform .25s,opacity .25s; }
  .h-cta.anim { animation:hFadeUp .62s cubic-bezier(.16,1,.3,1) both,hShift 4s ease infinite,hPulse 2.6s ease-out 1.5s infinite; }
  .h-cta:hover { transform:translateY(-2px); opacity:.88; }
  .h-cta svg   { transition:transform .25s; }
  .h-cta:hover svg { transform:translateX(5px); }

  .h-dots { position:absolute; bottom:40px; left:50%; transform:translateX(-50%); z-index:30; display:flex; gap:10px; align-items:center; }
  .h-dot  { width:7px; height:7px; border-radius:50%; border:none; cursor:pointer; background:rgba(255,255,255,.22); transition:transform .3s,background .3s; }
  .h-dot.on { transform:scale(1.5); background:linear-gradient(135deg,#00BFA5,#E91E8C); }

  .h-scrl { position:absolute; bottom:42px; right:50px; z-index:30; display:flex; flex-direction:column; align-items:center; gap:6px; opacity:.38; transition:opacity .5s; }
  .h-scrl.last { opacity:.7; }
  .h-scrl span { font-size:9px; letter-spacing:.3em; color:#fff; text-transform:uppercase; writing-mode:vertical-rl; }
  .h-scrl-line { width:1px; height:44px; background:rgba(255,255,255,.28); position:relative; overflow:hidden; }
  .h-scrl-line::after { content:''; position:absolute; top:-100%; left:0; width:100%; height:100%; background:linear-gradient(to bottom,#00BFA5,#E91E8C); animation:hDrop 1.9s ease-in-out infinite; }

  .h-bdg { position:absolute; bottom:44px; left:52px; z-index:30; font-size:10px; letter-spacing:.22em; color:rgba(255,255,255,.3); text-transform:uppercase; font-weight:300; font-family:'Barlow',sans-serif; }
  .h-bdg strong { color:rgba(255,255,255,.48); font-weight:400; }

  .h-cur-dot  { position:fixed; width:10px; height:10px; border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); background:linear-gradient(135deg,#00BFA5,#E91E8C); }
  .h-cur-ring { position:fixed; width:36px; height:36px; border-radius:50%; border:1.5px solid rgba(0,191,165,.42); pointer-events:none; z-index:9998; transform:translate(-50%,-50%); transition:left .15s ease-out,top .15s ease-out; }
`;