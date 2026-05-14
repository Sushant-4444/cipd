import { useState, useRef, useEffect } from "react";

// ── Per-type visual theme ──
const TYPE_THEME = {
  Webinar:            { gradient: "linear-gradient(135deg, #07201c 0%, #091a26 100%)", accent: "#00BFA5" },
  Workshop:           { gradient: "linear-gradient(135deg, #220d1e 0%, #14092a 100%)", accent: "#E91E8C" },
  Conference:         { gradient: "linear-gradient(135deg, #221a07 0%, #1a160a 100%)", accent: "#FFB300" },
  "Community Meetup": { gradient: "linear-gradient(135deg, #07201c 0%, #221a07 100%)", accent: "#00BFA5" },
  Summit:             { gradient: "linear-gradient(135deg, #07201c 0%, #220d1e 50%, #221a07 100%)", accent: "#FFB300" },
};

const TYPE_ICONS = {
  Webinar: (c) => <><rect x="4" y="4" width="16" height="11" rx="2" stroke={c} strokeWidth="1.2" fill="none"/><polygon points="10,7 10,12 14,9.5" fill={c} opacity="0.7"/><line x1="12" y1="15" x2="12" y2="18" stroke={c} strokeWidth="1.2"/><line x1="8" y1="18" x2="16" y2="18" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></>,
  Workshop: (c) => <><path d="M14.7 6.3a1 1 0 010 1.4l-5 5a1 1 0 01-1.4 0l-2-2a1 1 0 011.4-1.4L9 10.6l4.3-4.3a1 1 0 011.4 0z" fill={c} opacity="0.7"/><rect x="3" y="3" width="18" height="18" rx="4" stroke={c} strokeWidth="1.2" fill="none"/></>,
  Conference: (c) => <><rect x="4" y="13" width="3" height="5" rx="0.5" fill={c} opacity="0.5"/><rect x="9" y="9" width="3" height="9" rx="0.5" fill={c} opacity="0.6"/><rect x="14" y="5" width="3" height="13" rx="0.5" fill={c} opacity="0.7"/></>,
  "Community Meetup": (c) => <><circle cx="9" cy="8" r="2.5" stroke={c} strokeWidth="1.2" fill="none"/><circle cx="15" cy="8" r="2.5" stroke={c} strokeWidth="1.2" fill="none"/><path d="M4 18c0-3 2.5-5 5-5s5 2 5 5" stroke={c} strokeWidth="1.2" fill="none"/><path d="M14 13c2.5 0 5 2 5 5" stroke={c} strokeWidth="1.2" fill="none"/></>,
  Summit: (c) => <><path d="M12 3l8 15H4L12 3z" stroke={c} strokeWidth="1.2" fill="none"/><path d="M12 8v5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><circle cx="12" cy="15" r="0.8" fill={c}/></>,
};


export default function EventDetailPage({ event, onBack }) {
  const [regForm, setRegForm] = useState({ name: "", email: "", org: "", role: "" });
  const [regSubmitted, setRegSubmitted] = useState(false);
  const [activeAgendaItem, setActiveAgendaItem] = useState(null);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const agendaRef = useRef(null);
  const regRef = useRef(null);
  const galleryRef = useRef(null);

  // Detail fields come straight off the CMS event document.
  // EventsPage transforms array-of-{value} into plain arrays before passing here.
  const details = event;
  const isPast = event.tag === "Past";
  const images = event.images || [];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [event.id]);

  function handleRegister(e) {
    e.preventDefault();
    if (!regForm.name || !regForm.email) return;
    setRegSubmitted(true);
  }

  function scrollToAgenda() {
    agendaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToRegister() {
    regRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const capacityPct = details.capacity
    ? Math.round((details.registered / details.capacity) * 100)
    : 0;

  return (
    <div className="edp">
      <style>{DETAIL_CSS}</style>

      {/* ── Back bar ── */}
      <div className="edp-shell edp-back-bar">
        <button className="edp-back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to Events
        </button>
      </div>

      {/* ── Hero banner ── */}
      <section className="edp-hero">
        <div className="edp-hero__banner" style={{ background: (TYPE_THEME[event.type] || TYPE_THEME.Webinar).gradient }}>
          {images.length > 0 ? (
            <img src={images[0]} alt={event.title} className="edp-hero__banner-photo" />
          ) : (
            <>
              <svg className="edp-hero__banner-pattern" viewBox="0 0 600 260" fill="none" aria-hidden="true">
                <line x1="0" y1="52" x2="600" y2="52" stroke="rgba(255,255,255,0.03)"/>
                <line x1="0" y1="104" x2="600" y2="104" stroke="rgba(255,255,255,0.03)"/>
                <line x1="0" y1="156" x2="600" y2="156" stroke="rgba(255,255,255,0.03)"/>
                <line x1="0" y1="208" x2="600" y2="208" stroke="rgba(255,255,255,0.03)"/>
                <line x1="100" y1="0" x2="100" y2="260" stroke="rgba(255,255,255,0.03)"/>
                <line x1="200" y1="0" x2="200" y2="260" stroke="rgba(255,255,255,0.03)"/>
                <line x1="300" y1="0" x2="300" y2="260" stroke="rgba(255,255,255,0.03)"/>
                <line x1="400" y1="0" x2="400" y2="260" stroke="rgba(255,255,255,0.03)"/>
                <line x1="500" y1="0" x2="500" y2="260" stroke="rgba(255,255,255,0.03)"/>
                <circle cx="100" cy="52" r="3" fill="rgba(255,255,255,0.06)"/>
                <circle cx="200" cy="104" r="3" fill="rgba(255,255,255,0.06)"/>
                <circle cx="300" cy="156" r="3" fill="rgba(255,255,255,0.06)"/>
                <circle cx="400" cy="104" r="3" fill="rgba(255,255,255,0.06)"/>
                <circle cx="500" cy="208" r="3" fill="rgba(255,255,255,0.06)"/>
                <line x1="100" y1="52" x2="200" y2="104" stroke="rgba(255,255,255,0.035)"/>
                <line x1="200" y1="104" x2="300" y2="156" stroke="rgba(255,255,255,0.035)"/>
                <line x1="300" y1="156" x2="400" y2="104" stroke="rgba(255,255,255,0.035)"/>
                <line x1="400" y1="104" x2="500" y2="208" stroke="rgba(255,255,255,0.035)"/>
              </svg>
              <svg className="edp-hero__banner-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {(TYPE_ICONS[event.type] || TYPE_ICONS.Webinar)((TYPE_THEME[event.type] || TYPE_THEME.Webinar).accent)}
              </svg>
            </>
          )}
          <div className="edp-hero__banner-fade" />
        </div>
        <div className="edp-shell edp-hero__inner">
          <div className="edp-badge">{event.type}</div>
          {event.tag && <span className={`edp-tag edp-tag--${event.tag.toLowerCase()}`}>{event.tag}</span>}
          <h1>{event.title}</h1>
          <div className="edp-meta-row">
            {event.date && (
              <span className="edp-meta-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M2 7h12M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                {event.date}
              </span>
            )}
            {event.time && (
              <span className="edp-meta-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {event.time}
              </span>
            )}
            {event.location && (
              <span className="edp-meta-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
                {event.location}
              </span>
            )}
            {details.format && (
              <span className="edp-meta-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M5 13v2M11 13v2M3 15h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                {details.format}
              </span>
            )}
          </div>
          {!isPast && (
            <div className="edp-hero__actions">
              <button className="events-btn events-btn--primary" onClick={scrollToRegister}>Register Now</button>
              <button className="events-btn events-btn--ghost" onClick={scrollToAgenda}>View Agenda</button>
            </div>
          )}
        </div>
      </section>

      {/* ── Photo Gallery ── */}
      {images.length > 0 && (
        <section className="edp-shell edp-section">
          <div className="edp-section__heading">
            <span className="events-section__eyebrow">Gallery</span>
            <h2>Event Photos <span className="edp-gallery__count">{images.length} photos</span></h2>
          </div>

          {/* Main viewer */}
          <div className="edp-gallery__main">
            {images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`${event.title} — photo ${i + 1}`}
                className={`edp-gallery__main-img ${i === galleryIdx ? "is-active" : ""}`}
              />
            ))}
            <div className="edp-gallery__main-overlay">
              <span className="edp-gallery__indicator">{galleryIdx + 1} / {images.length}</span>
            </div>
            {images.length > 1 && (
              <>
                <button className="edp-gallery__arrow edp-gallery__arrow--prev" onClick={() => setGalleryIdx((galleryIdx - 1 + images.length) % images.length)} aria-label="Previous photo">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className="edp-gallery__arrow edp-gallery__arrow--next" onClick={() => setGalleryIdx((galleryIdx + 1) % images.length)} aria-label="Next photo">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 5L12.5 10L7.5 15" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="edp-gallery__thumbs" ref={galleryRef}>
              {images.map((src, i) => (
                <button
                  key={src}
                  className={`edp-gallery__thumb ${i === galleryIdx ? "is-active" : ""}`}
                  onClick={() => setGalleryIdx(i)}
                  aria-label={`View photo ${i + 1}`}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── About ── */}
      {(details.fullDescription || event.summary || (details.topics && details.topics.length > 0) || details.prerequisites) && (
        <section className="edp-shell edp-section">
          <div className="edp-section__heading">
            <span className="events-section__eyebrow">About This Event</span>
            <h2>What to Expect</h2>
          </div>
          {(details.fullDescription || event.summary) && (
            <p className="edp-description">{details.fullDescription || event.summary}</p>
          )}
          {details.topics && details.topics.length > 0 && (
            <div className="edp-topics">
              {details.topics.map((t) => (
                <span key={t} className="events-pill">{t}</span>
              ))}
            </div>
          )}
          {details.prerequisites && (
            <div className="edp-prereq">
              <strong>Prerequisites:</strong> {details.prerequisites}
            </div>
          )}
        </section>
      )}

      {/* ── Agenda ── */}
      {details.agenda && details.agenda.length > 0 && (
        <section className="edp-shell edp-section" ref={agendaRef}>
          <div className="edp-section__heading">
            <span className="events-section__eyebrow">Agenda</span>
            <h2>{isPast ? "What Happened" : "Schedule"}</h2>
          </div>
          <div className="edp-agenda">
            {details.agenda.map((item, i) => (
              <button
                key={i}
                className={`edp-agenda-item ${activeAgendaItem === i ? "is-expanded" : ""}`}
                onClick={() => setActiveAgendaItem(activeAgendaItem === i ? null : i)}
              >
                <div className="edp-agenda-item__time">{item.time}</div>
                <div className="edp-agenda-item__body">
                  <div className="edp-agenda-item__title">{item.title}</div>
                  {activeAgendaItem === i && item.speaker && (
                    <div className="edp-agenda-item__speaker">{item.speaker}</div>
                  )}
                </div>
                <svg className="edp-agenda-item__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Speakers ── */}
      {details.speakers && details.speakers.length > 0 && (
        <section className="edp-shell edp-section">
          <div className="edp-section__heading">
            <span className="events-section__eyebrow">Speakers</span>
            <h2>Who You'll Hear From</h2>
          </div>
          <div className="edp-speakers">
            {details.speakers.map((s) => (
              <div key={s.name} className="edp-speaker-card">
                <div className="edp-speaker-card__avatar">
                  {s.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="edp-speaker-card__name">{s.name}</div>
                  <div className="edp-speaker-card__role">{s.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Past Event Highlights ── */}
      {isPast && details.highlights && details.highlights.length > 0 && (
        <section className="edp-shell edp-section">
          <div className="edp-section__heading">
            <span className="events-section__eyebrow">Highlights</span>
            <h2>Key Takeaways</h2>
          </div>
          <div className="edp-highlights">
            {details.highlights.map((h, i) => (
              <div key={i} className="edp-highlight-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#00BFA5" strokeWidth="1.5"/><path d="M7 10l2 2 4-4" stroke="#00BFA5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>{h}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Registration (upcoming) or CTA (past) ── */}
      <section className="edp-shell edp-section" ref={regRef}>
        {!isPast ? (
          <>
            <div className="edp-section__heading">
              <span className="events-section__eyebrow">Registration</span>
              <h2>Secure Your Spot</h2>
            </div>

            {details.capacity && (
              <div className="edp-capacity">
                <div className="edp-capacity__bar">
                  <div className="edp-capacity__fill" style={{ width: `${capacityPct}%` }} />
                </div>
                <div className="edp-capacity__text">
                  {details.registered} / {details.capacity} registered ({capacityPct}% full)
                </div>
              </div>
            )}

            {regSubmitted ? (
              <div className="edp-reg-success">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" stroke="#00BFA5" strokeWidth="2"/><path d="M16 24l6 6 10-10" stroke="#00BFA5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <h3>You're Registered!</h3>
                <p>A confirmation has been sent to <strong>{regForm.email}</strong>. We'll send you a reminder before the event.</p>
                <button className="events-btn events-btn--ghost" onClick={onBack}>Back to All Events</button>
              </div>
            ) : (
              <form className="edp-reg-form" onSubmit={handleRegister}>
                <div className="edp-reg-form__grid">
                  <label>
                    <span>Full Name *</span>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    <span>Work Email *</span>
                    <input
                      type="email"
                      placeholder="you@company.com"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    <span>Organization</span>
                    <input
                      type="text"
                      placeholder="Your company or institution"
                      value={regForm.org}
                      onChange={(e) => setRegForm({ ...regForm, org: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Role</span>
                    <input
                      type="text"
                      placeholder="e.g. HR Manager, Data Analyst"
                      value={regForm.role}
                      onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                    />
                  </label>
                </div>
                <button type="submit" className="events-btn events-btn--primary edp-reg-form__submit">
                  Register for This Event
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="edp-past-cta">
            <div className="edp-section__heading">
              <span className="events-section__eyebrow">Missed This One?</span>
              <h2>Stay in the Loop</h2>
            </div>
            <p className="edp-description">This event has concluded, but we're always planning more. Subscribe to get notified about upcoming events like this one.</p>
            <div className="edp-hero__actions">
              <button className="events-btn events-btn--primary" onClick={onBack}>Explore Upcoming Events</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

const DETAIL_CSS = `
  .edp {
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(0,191,165,0.06), transparent 28%),
      radial-gradient(circle at 80% 10%, rgba(233,30,140,0.08), transparent 24%),
      linear-gradient(180deg, #060810 0%, #080a12 100%);
    color: #fff;
    padding-top: 88px;
    padding-bottom: 96px;
    font-family: 'Montserrat', sans-serif;
  }
  .edp-shell {
    width: min(1200px, calc(100% - 40px));
    margin: 0 auto;
  }

  /* ── Back bar ── */
  .edp-back-bar {
    padding: 16px 0 0;
  }
  .edp-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 999px;
    color: rgba(255,255,255,0.7);
    padding: 10px 18px;
    cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    transition: border-color 0.2s, color 0.2s;
  }
  .edp-back-btn:hover {
    border-color: #00BFA5;
    color: #00BFA5;
  }

  /* ── Hero ── */
  .edp-hero {
    position: relative;
    overflow: hidden;
  }
  .edp-hero__banner {
    position: relative;
    width: 100%;
    height: 280px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .edp-hero__banner-photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .edp-hero__banner-pattern {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .edp-hero__banner-icon {
    position: relative;
    z-index: 1;
    width: 80px;
    height: 80px;
    opacity: 0.45;
    filter: drop-shadow(0 0 20px currentColor);
  }
  .edp-hero__banner-fade {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 120px;
    background: linear-gradient(to top, #060810 0%, transparent 100%);
    pointer-events: none;
  }
  .edp-hero__inner {
    position: relative;
    z-index: 2;
    padding: 0 0 40px;
    margin-top: -40px;
  }
  .edp-badge {
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    padding: 8px 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #07110f;
    background: linear-gradient(135deg, #00BFA5 0%, #FFB300 100%);
  }
  .edp-tag {
    display: inline-flex;
    margin-left: 10px;
    padding: 8px 14px;
    border-radius: 999px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }
  .edp-tag--upcoming {
    color: #00BFA5;
    border: 1px solid rgba(0,191,165,0.3);
    background: rgba(0,191,165,0.08);
  }
  .edp-tag--featured {
    color: #FFB300;
    border: 1px solid rgba(255,179,0,0.3);
    background: rgba(255,179,0,0.08);
  }
  .edp-tag--past {
    color: rgba(255,255,255,0.5);
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
  }
  .edp-hero h1 {
    margin: 18px 0 0;
    font-size: clamp(2rem, 5vw, 3.6rem);
    line-height: 1.05;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    max-width: 18ch;
  }
  .edp-meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 24px;
    margin-top: 20px;
  }
  .edp-meta-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: rgba(255,255,255,0.6);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.1em;
  }
  .edp-meta-item svg {
    flex-shrink: 0;
    color: #00BFA5;
  }
  .edp-hero__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 28px;
  }

  /* ── Gallery ── */
  .edp-gallery__count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.08em;
    color: rgba(255,255,255,0.4);
    margin-left: 12px;
  }
  .edp-gallery__main {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 20px;
    overflow: hidden;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .edp-gallery__main-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  .edp-gallery__main-img.is-active {
    opacity: 1;
  }
  .edp-gallery__main-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px 20px;
    background: linear-gradient(to top, rgba(6,8,16,0.7), transparent);
    display: flex;
    justify-content: flex-end;
    pointer-events: none;
  }
  .edp-gallery__indicator {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: rgba(255,255,255,0.7);
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(6,8,16,0.5);
    backdrop-filter: blur(6px);
  }
  .edp-gallery__arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 3;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(6,8,16,0.55);
    backdrop-filter: blur(8px);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    opacity: 0;
    transition: opacity 0.2s, border-color 0.2s, background 0.2s;
  }
  .edp-gallery__main:hover .edp-gallery__arrow { opacity: 1; }
  .edp-gallery__arrow:hover {
    border-color: #00BFA5;
    background: rgba(0,191,165,0.15);
  }
  .edp-gallery__arrow--prev { left: 14px; }
  .edp-gallery__arrow--next { right: 14px; }
  .edp-gallery__thumbs {
    display: flex;
    gap: 10px;
    margin-top: 12px;
    overflow-x: auto;
    padding-bottom: 6px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.1) transparent;
  }
  .edp-gallery__thumbs::-webkit-scrollbar {
    height: 4px;
  }
  .edp-gallery__thumbs::-webkit-scrollbar-track {
    background: transparent;
  }
  .edp-gallery__thumbs::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
  }
  .edp-gallery__thumb {
    flex-shrink: 0;
    width: 100px;
    height: 68px;
    border-radius: 10px;
    overflow: hidden;
    border: 2px solid transparent;
    background: rgba(255,255,255,0.04);
    cursor: pointer;
    padding: 0;
    transition: border-color 0.2s, opacity 0.2s;
    opacity: 0.5;
  }
  .edp-gallery__thumb.is-active {
    border-color: #00BFA5;
    opacity: 1;
    box-shadow: 0 0 12px rgba(0,191,165,0.25);
  }
  .edp-gallery__thumb:hover {
    opacity: 0.85;
  }
  .edp-gallery__thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* ── Sections ── */
  .edp-section {
    margin-top: 48px;
  }
  .edp-section__heading {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }
  .edp-section__heading h2 {
    margin: 0;
    font-size: clamp(1.5rem, 3.5vw, 2.4rem);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  .edp-description {
    color: rgba(255,255,255,0.72);
    line-height: 1.85;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.92rem;
    max-width: 800px;
    margin: 0;
  }
  .edp-topics {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
  }
  .edp-prereq {
    margin-top: 20px;
    padding: 16px 20px;
    border-radius: 14px;
    background: rgba(255,179,0,0.06);
    border: 1px solid rgba(255,179,0,0.15);
    color: rgba(255,255,255,0.8);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.88rem;
    line-height: 1.6;
  }
  .edp-prereq strong {
    color: #FFB300;
  }

  /* ── Agenda ── */
  .edp-agenda {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .edp-agenda-item {
    display: grid;
    grid-template-columns: 100px 1fr 24px;
    align-items: center;
    gap: 16px;
    padding: 18px 20px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    color: #fff;
    cursor: pointer;
    text-align: left;
    transition: background 0.2s, border-color 0.2s;
    font-family: inherit;
  }
  .edp-agenda-item:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.12);
  }
  .edp-agenda-item.is-expanded {
    border-color: rgba(0,191,165,0.3);
    background: rgba(0,191,165,0.04);
  }
  .edp-agenda-item__time {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    color: #00BFA5;
    letter-spacing: 0.08em;
  }
  .edp-agenda-item__body {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .edp-agenda-item__title {
    font-weight: 700;
    font-size: 0.95rem;
  }
  .edp-agenda-item__speaker {
    color: rgba(255,255,255,0.5);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
  }
  .edp-agenda-item__chevron {
    transition: transform 0.2s;
    color: rgba(255,255,255,0.4);
    flex-shrink: 0;
  }
  .edp-agenda-item.is-expanded .edp-agenda-item__chevron {
    transform: rotate(180deg);
    color: #00BFA5;
  }

  /* ── Speakers ── */
  .edp-speakers {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  .edp-speaker-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border-radius: 18px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .edp-speaker-card__avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #07110f;
    background: linear-gradient(135deg, #00BFA5 0%, #E91E8C 100%);
    flex-shrink: 0;
  }
  .edp-speaker-card__name {
    font-weight: 700;
    font-size: 0.95rem;
    margin-bottom: 4px;
  }
  .edp-speaker-card__role {
    color: rgba(255,255,255,0.5);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
  }

  /* ── Highlights (past events) ── */
  .edp-highlights {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .edp-highlight-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px 20px;
    border-radius: 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.82);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    line-height: 1.6;
  }
  .edp-highlight-item svg {
    flex-shrink: 0;
    margin-top: 2px;
  }

  /* ── Capacity bar ── */
  .edp-capacity {
    margin-bottom: 24px;
  }
  .edp-capacity__bar {
    height: 8px;
    border-radius: 999px;
    background: rgba(255,255,255,0.08);
    overflow: hidden;
    margin-bottom: 8px;
  }
  .edp-capacity__fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #00BFA5, #E91E8C);
    transition: width 0.8s ease;
  }
  .edp-capacity__text {
    color: rgba(255,255,255,0.5);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
  }

  /* ── Registration form ── */
  .edp-reg-form {
    max-width: 700px;
  }
  .edp-reg-form__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }
  .edp-reg-form label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.55);
  }
  .edp-reg-form input {
    width: 100%;
    min-height: 48px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(6,8,16,0.72);
    color: #fff;
    padding: 0 14px;
    outline: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    transition: border-color 0.2s;
  }
  .edp-reg-form input:focus {
    border-color: rgba(0,191,165,0.5);
  }
  .edp-reg-form input::placeholder {
    color: rgba(255,255,255,0.3);
  }
  .edp-reg-form__submit {
    width: 100%;
    max-width: 700px;
  }

  /* ── Registration success ── */
  .edp-reg-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
    padding: 48px 24px;
    border-radius: 24px;
    background: rgba(0,191,165,0.04);
    border: 1px solid rgba(0,191,165,0.15);
  }
  .edp-reg-success h3 {
    margin: 0;
    font-size: 1.8rem;
    text-transform: uppercase;
    color: #00BFA5;
  }
  .edp-reg-success p {
    color: rgba(255,255,255,0.65);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    line-height: 1.7;
    margin: 0;
    max-width: 480px;
  }
  .edp-reg-success strong {
    color: #fff;
  }

  /* ── Past CTA ── */
  .edp-past-cta {
    padding: 40px;
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%);
    border: 1px solid rgba(255,255,255,0.08);
  }

  /* ── Responsive ── */
  @media (max-width: 720px) {
    .edp {
      padding-top: 72px;
    }
    .edp-shell {
      width: min(100% - 24px, 1200px);
    }
    .edp-hero h1 {
      font-size: clamp(1.6rem, 6vw, 2.4rem);
    }
    .edp-agenda-item {
      grid-template-columns: 80px 1fr 20px;
      padding: 14px 16px;
    }
    .edp-reg-form__grid {
      grid-template-columns: 1fr;
    }
    .edp-speakers {
      grid-template-columns: 1fr;
    }
  }
`;
