import { useMemo, useState, useCallback, useEffect } from "react";
import EventDetailPage from "./EventDetailPage";

// ── CMS API base URL ────────────────────────────────────────────────────
// Override at build time with REACT_APP_CMS_URL if the CMS lives elsewhere.
const API = process.env.REACT_APP_CMS_URL || "http://localhost:3001";

// ── Transformer: CMS event → shape expected by the existing components ──
// The CMS wraps array values in { value } objects (topics, highlights) and
// returns media as relation objects. We flatten everything here so the
// existing components don't need to change.
function transformEvent(e) {
  const images = Array.isArray(e.images)
    ? e.images
        .map((row) => {
          const m = row?.image;
          if (!m) return null;
          if (typeof m === "string") return m; // depth=0 — just the id, no URL
          const url = m.url || m.thumbnailURL;
          return url ? (url.startsWith("http") ? url : `${API}${url}`) : null;
        })
        .filter(Boolean)
    : [];

  return {
    ...e,
    topics:     Array.isArray(e.topics)     ? e.topics.map((t) => t.value).filter(Boolean) : [],
    highlights: Array.isArray(e.highlights) ? e.highlights.map((h) => h.value).filter(Boolean) : [],
    agenda:     Array.isArray(e.agenda)     ? e.agenda    : [],
    speakers:   Array.isArray(e.speakers)   ? e.speakers  : [],
    images,
  };
}

const B = {
  teal:    "#00BFA5",
  magenta: "#E91E8C",
  gold:    "#FFB300",
  navy:    "#060810",
  panel:   "rgba(255,255,255,0.04)",
  border:  "rgba(255,255,255,0.08)",
};

// ── Per-type visual theme (gradient + accent) used for image placeholders ──
const TYPE_THEME = {
  Webinar:            { gradient: "linear-gradient(135deg, #07201c 0%, #091a26 100%)", accent: "#00BFA5" },
  Workshop:           { gradient: "linear-gradient(135deg, #220d1e 0%, #14092a 100%)", accent: "#E91E8C" },
  Conference:         { gradient: "linear-gradient(135deg, #221a07 0%, #1a160a 100%)", accent: "#FFB300" },
  "Community Meetup": { gradient: "linear-gradient(135deg, #07201c 0%, #221a07 100%)", accent: "#00BFA5" },
  Summit:             { gradient: "linear-gradient(135deg, #07201c 0%, #220d1e 50%, #221a07 100%)", accent: "#FFB300" },
};

// SVG icons per type — used when no photo is available
const TYPE_ICONS = {
  Webinar: (c) => <><rect x="4" y="4" width="16" height="11" rx="2" stroke={c} strokeWidth="1.2" fill="none"/><polygon points="10,7 10,12 14,9.5" fill={c} opacity="0.7"/><line x1="12" y1="15" x2="12" y2="18" stroke={c} strokeWidth="1.2"/><line x1="8" y1="18" x2="16" y2="18" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></>,
  Workshop: (c) => <><path d="M14.7 6.3a1 1 0 010 1.4l-5 5a1 1 0 01-1.4 0l-2-2a1 1 0 011.4-1.4L9 10.6l4.3-4.3a1 1 0 011.4 0z" fill={c} opacity="0.7"/><rect x="3" y="3" width="18" height="18" rx="4" stroke={c} strokeWidth="1.2" fill="none"/></>,
  Conference: (c) => <><rect x="4" y="13" width="3" height="5" rx="0.5" fill={c} opacity="0.5"/><rect x="9" y="9" width="3" height="9" rx="0.5" fill={c} opacity="0.6"/><rect x="14" y="5" width="3" height="13" rx="0.5" fill={c} opacity="0.7"/></>,
  "Community Meetup": (c) => <><circle cx="9" cy="8" r="2.5" stroke={c} strokeWidth="1.2" fill="none"/><circle cx="15" cy="8" r="2.5" stroke={c} strokeWidth="1.2" fill="none"/><path d="M4 18c0-3 2.5-5 5-5s5 2 5 5" stroke={c} strokeWidth="1.2" fill="none"/><path d="M14 13c2.5 0 5 2 5 5" stroke={c} strokeWidth="1.2" fill="none"/></>,
  Summit: (c) => <><path d="M12 3l8 15H4L12 3z" stroke={c} strokeWidth="1.2" fill="none"/><path d="M12 8v5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><circle cx="12" cy="15" r="0.8" fill={c}/></>,
};

function EventImage({ event, className, height }) {
  const theme = TYPE_THEME[event.type] || TYPE_THEME.Webinar;
  const iconFn = TYPE_ICONS[event.type] || TYPE_ICONS.Webinar;
  const images = event.images || [];
  const [idx, setIdx] = useState(0);

  // Auto-cycle when multiple images
  const hasMultiple = images.length > 1;

  if (images.length === 0) {
    return (
      <div className={className} style={{ height, background: theme.gradient }}>
        <svg className="ev-img__pattern" viewBox="0 0 240 140" fill="none" aria-hidden="true">
          <line x1="0" y1="35" x2="240" y2="35" stroke="rgba(255,255,255,0.035)"/>
          <line x1="0" y1="70" x2="240" y2="70" stroke="rgba(255,255,255,0.035)"/>
          <line x1="0" y1="105" x2="240" y2="105" stroke="rgba(255,255,255,0.035)"/>
          <line x1="60" y1="0" x2="60" y2="140" stroke="rgba(255,255,255,0.035)"/>
          <line x1="120" y1="0" x2="120" y2="140" stroke="rgba(255,255,255,0.035)"/>
          <line x1="180" y1="0" x2="180" y2="140" stroke="rgba(255,255,255,0.035)"/>
          <circle cx="60" cy="35" r="2.5" fill="rgba(255,255,255,0.07)"/>
          <circle cx="120" cy="70" r="2.5" fill="rgba(255,255,255,0.07)"/>
          <circle cx="180" cy="105" r="2.5" fill="rgba(255,255,255,0.07)"/>
          <line x1="60" y1="35" x2="120" y2="70" stroke="rgba(255,255,255,0.04)"/>
          <line x1="120" y1="70" x2="180" y2="105" stroke="rgba(255,255,255,0.04)"/>
        </svg>
        <svg className="ev-img__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {iconFn(theme.accent)}
        </svg>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${event.title} — photo ${i + 1}`}
          className={`ev-img__photo ${i === idx ? "is-active" : ""}`}
        />
      ))}
      {hasMultiple && (
        <>
          <div className="ev-img__dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`ev-img__dot ${i === idx ? "is-active" : ""}`}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
          <button className="ev-img__nav ev-img__nav--prev" onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + images.length) % images.length); }} aria-label="Previous photo">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className="ev-img__nav ev-img__nav--next" onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % images.length); }} aria-label="Next photo">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </>
      )}
      {images.length > 1 && (
        <span className="ev-img__count">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="2.5" width="7" height="7" rx="1" stroke="#fff" strokeWidth="1"/><path d="M3.5 1.5h6a1 1 0 011 1v6" stroke="#fff" strokeWidth="1" strokeLinecap="round"/></svg>
          {images.length}
        </span>
      )}
    </div>
  );
}

const CALENDAR_DAYS = [
  "", "", "", "1", "2", "3", "4",
  "5", "6", "7", "8", "9", "10", "11",
  "12", "13", "14", "15", "16", "17", "18",
  "19", "20", "21", "22", "23", "24", "25",
  "26", "27", "28", "29", "30", "31", "",
];

// Calendar shows May 2026 as the default month/year.
const CAL_YEAR = 2026;
const CAL_MONTH = 4; // 0-indexed (May)

export default function EventsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState("List");
  const [selectedDay, setSelectedDay] = useState(24);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeSubmitted, setSubscribeSubmitted] = useState(false);

  // ── CMS events ────────────────────────────────────────────────────────
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/events?limit=100&depth=2&sort=-isoDate`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        const docs = (data.docs || []).map(transformEvent);
        setEvents(docs);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load events from CMS:", err);
        setFetchError(err.message || "Could not load events");
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Fetch Events-page testimonials from the Settings global. Best-effort —
  // if the CMS is unreachable, we just hide the section.
  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/globals/settings?depth=0`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setTestimonials(Array.isArray(data.eventTestimonials) ? data.eventTestimonials : []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const featured = events.find((event) => event.featured) || null;

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const searchable = `${event.title} ${event.type} ${event.summary} ${event.location}`.toLowerCase();
      const matchesQuery = searchable.includes(query.trim().toLowerCase());
      const matchesStatus = status === "All" || event.tag === status;
      const matchesCategory = category === "All" || event.type === category;
      return matchesQuery && matchesStatus && matchesCategory && !event.featured;
    });
  }, [events, query, status, category]);

  const pastEvents = useMemo(
    () => events.filter((event) => event.tag === "Past"),
    [events]
  );

  // Derive calendar marks from events that fall in the displayed month.
  const calendarMarks = useMemo(() => {
    const marks = {};
    for (const e of events) {
      if (!e.isoDate) continue;
      const d = new Date(e.isoDate);
      if (d.getUTCFullYear() === CAL_YEAR && d.getUTCMonth() === CAL_MONTH) {
        marks[d.getUTCDate()] = { type: e.type, title: e.title, eventId: e.id };
      }
    }
    return marks;
  }, [events]);

  const selectedCalendarEvent = calendarMarks[selectedDay] || null;

  const openEvent = useCallback((event) => {
    setSelectedEvent(event);
  }, []);

  const openEventById = useCallback((id) => {
    const ev = events.find((e) => e.id === id);
    if (ev) setSelectedEvent(ev);
  }, [events]);

  const closeDetail = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  // While an event detail is open, mark the body so App.js's scroll-up-to-go-back
  // gesture is suppressed (otherwise scrolling up on the detail page would
  // navigate back to the iPD-CP phase).
  useEffect(() => {
    if (selectedEvent) {
      document.body.dataset.modalOpen = "true";
      return () => { delete document.body.dataset.modalOpen; };
    }
  }, [selectedEvent]);

  function handleSubscribe(e) {
    e.preventDefault();
    if (!subscribeEmail.trim()) return;
    setSubscribeSubmitted(true);
  }

  // ── Detail page view ──
  if (selectedEvent) {
    return <EventDetailPage event={selectedEvent} onBack={closeDetail} />;
  }

  return (
    <main className="events-page">
      <style>{CSS}</style>

      <section className="events-hero">
        <div className="events-hero__glow events-hero__glow--teal" />
        <div className="events-hero__glow events-hero__glow--magenta" />
        <div className="events-shell events-hero__inner">
          <div className="events-kicker">CiPD · IIIT Delhi</div>
          <h1>Events</h1>
          <p className="events-hero__lead">
            Where ideas, industry, and innovation converge.
          </p>
          <p className="events-hero__body">
            Explore webinars, workshops, conferences, and showcases hosted by CiPD and partners.
            Join conversations that turn research, practice, and collaboration into real outcomes.
          </p>

          <div className="events-hero__actions">
            <a className="events-btn events-btn--primary" href="#upcoming">Explore Upcoming Events</a>
            <a className="events-btn events-btn--ghost" href="#past-events">View Past Events</a>
          </div>
        </div>
      </section>

      {featured && (
        <section className="events-shell events-section" id="upcoming">
          <div className="events-section__heading">
            <span className="events-section__eyebrow">Featured Event</span>
            <h2>Most Important Session First</h2>
          </div>

          <article className="featured-card">
            <div className="featured-card__visual">
              <EventImage event={featured} className="ev-img featured-card__img" height="100%" />
              <div className="featured-card__badge">Featured Event</div>
            </div>
            <div className="featured-card__content">
              {(featured.date || featured.time || featured.location) && (
                <div className="events-meta-row">
                  {featured.date     && <span>{featured.date}</span>}
                  {featured.time     && <span>{featured.time}</span>}
                  {featured.location && <span>{featured.location}</span>}
                </div>
              )}
              <h3>{featured.title}</h3>
              {featured.summary && <p>{featured.summary}</p>}
              {featured.topics && featured.topics.length > 0 && (
                <div className="events-pill-row">
                  {featured.topics.slice(0, 3).map((t) => (
                    <span key={t} className="events-pill">{t}</span>
                  ))}
                </div>
              )}
              <div className="events-hero__actions">
                <button className="events-btn events-btn--primary" onClick={() => openEvent(featured)}>Register Now</button>
                <button className="events-btn events-btn--ghost" onClick={() => openEvent(featured)}>View Agenda</button>
              </div>
            </div>
          </article>
        </section>
      )}

      <section className="events-shell events-section">
        <div className="events-toolbar">
          <label className="events-search">
            <span>Search</span>
            <input
              type="search"
              placeholder="Search events by title or keyword"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <div className="events-toolbar__filters">
            <div className="events-chips" role="tablist" aria-label="Event status filter">
              {["All", "Upcoming", "Ongoing", "Past"].map((item) => (
                <button
                  key={item}
                  className={`events-chip ${status === item ? "is-active" : ""}`}
                  onClick={() => setStatus(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>All</option>
              <option>Webinar</option>
              <option>Workshop</option>
              <option>Conference</option>
              <option>Community Meetup</option>
              <option>Summit</option>
              <option>Competition</option>
              <option>Industry Visit</option>
              <option>Event</option>
            </select>
          </div>

          <div className="events-view-toggle" aria-label="Calendar or list view">
            <button className={view === "List" ? "is-active" : ""} onClick={() => setView("List")}>List View</button>
            <button className={view === "Calendar" ? "is-active" : ""} onClick={() => setView("Calendar")}>Calendar View</button>
          </div>
        </div>

        {view === "List" ? (
          <div className="events-grid">
            {loading ? (
              <div className="events-empty"><p>Loading events…</p></div>
            ) : fetchError ? (
              <div className="events-empty">
                <p>Could not reach the events CMS ({fetchError}).</p>
                <p>Make sure the backend is running at <code>{API}</code>.</p>
              </div>
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <article key={event.id} className="event-card">
                  <EventImage event={event} className="ev-img event-card__img" height={160} />
                  <div className="event-card__body">
                    <div className="event-card__badge">{event.type}</div>
                    <h3>{event.title}</h3>
                    {(event.date || event.time || event.location) && (
                      <div className="event-card__meta">
                        {event.date     && <span>{event.date}</span>}
                        {event.time     && <span>{event.time}</span>}
                        {event.location && <span>{event.location}</span>}
                      </div>
                    )}
                    {event.summary && <p>{event.summary}</p>}
                    <button className="event-card__link" onClick={() => openEvent(event)}>View Details</button>
                  </div>
                </article>
              ))
            ) : (
              <div className="events-empty">
                <p>No events match your filters.</p>
                <button className="events-btn events-btn--ghost" onClick={() => { setQuery(""); setStatus("All"); setCategory("All"); }}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="calendar-layout">
            <div className="calendar-card">
              <div className="calendar-card__top">
                <div>
                  <span className="events-section__eyebrow">Calendar View</span>
                  <h3>May 2026</h3>
                </div>
                <div className="calendar-card__legend">
                  <span><i className="dot teal" /> Webinar</span>
                  <span><i className="dot magenta" /> Workshop</span>
                  <span><i className="dot gold" /> Conference</span>
                </div>
              </div>

              <div className="calendar-grid">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <div key={`${day}-${i}`} className="calendar-grid__head">{day}</div>)}
                {CALENDAR_DAYS.map((day, index) => {
                  const dayNumber = Number(day);
                  const mark = calendarMarks[dayNumber];
                  const active = selectedDay === dayNumber;
                  return (
                    <button
                      key={`${day}-${index}`}
                      className={`calendar-day ${active ? "is-active" : ""} ${!day ? "is-empty" : ""}`}
                      onClick={() => day && setSelectedDay(dayNumber)}
                    >
                      <span>{day}</span>
                      {mark && <i className={`dot ${mark.type.toLowerCase().includes("workshop") ? "magenta" : mark.type.toLowerCase().includes("conference") ? "gold" : "teal"}`} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="calendar-panel">
              <div className="events-section__eyebrow">Selected Date</div>
              <h3>{selectedDay} May 2026</h3>
              {selectedCalendarEvent ? (
                <>
                  <div className="event-card__badge event-card__badge--inline">{selectedCalendarEvent.type}</div>
                  <h4>{selectedCalendarEvent.title}</h4>
                  <p>Tap any date marker to preview the event details.</p>
                  <button className="event-card__link" onClick={() => openEventById(selectedCalendarEvent.eventId)}>
                    View Full Details
                  </button>
                </>
              ) : (
                <p>No featured event scheduled on this date.</p>
              )}
            </aside>
          </div>
        )}
      </section>

      <section className="events-shell events-section" id="past-events">
        <div className="events-section__heading">
          <span className="events-section__eyebrow">Past Events & Highlights</span>
          <h2>Missed one? Catch up here.</h2>
        </div>

        <div className="past-grid">
          {pastEvents.map((event) => (
            <article key={event.id} className="past-card">
              <EventImage event={event} className="ev-img past-card__img" height={110} />
              <div className="past-card__body">
                <div className="past-card__type">{event.type}</div>
                <h3>{event.title}</h3>
                {event.date && <p className="past-card__date">{event.date}</p>}
                <button className="event-card__link" onClick={() => openEvent(event)}>
                  {event.pastAction || "View Details"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="events-shell events-section">
          <div className="events-section__heading">
            <span className="events-section__eyebrow">Testimonials</span>
            <h2>What attendees say</h2>
          </div>

          <div className="testimonial-row">
            {testimonials.map((item, i) => (
              <blockquote key={item.id || item.by || i} className="testimonial-card">
                <p>"{item.quote}"</p>
                <footer>— {item.by}</footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      <section className="events-shell events-section" id="subscribe">
        <div className="subscribe-card">
          <div>
            <span className="events-section__eyebrow">Never Miss an Event</span>
            <h2>Get monthly updates on upcoming events, early-bird registrations, and speaker announcements.</h2>
          </div>

          {subscribeSubmitted ? (
            <div className="subscribe-success">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="15" stroke="#00BFA5" strokeWidth="2"/>
                <path d="M12 18l4 4 8-8" stroke="#00BFA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p><strong>You're subscribed!</strong></p>
              <p>We'll send updates to <strong>{subscribeEmail}</strong></p>
            </div>
          ) : (
            <form className="subscribe-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your work email"
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                required
              />
              <button type="submit">Subscribe</button>
              <a className="subscribe-form__link" href="mailto:cipd@iiitd.ac.in?subject=Host%20an%20Event%20with%20CiPD">
                Host an Event with Us
              </a>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');

  .events-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(0,191,165,0.08), transparent 28%),
      radial-gradient(circle at 75% 10%, rgba(233,30,140,0.10), transparent 24%),
      linear-gradient(180deg, #060810 0%, #080a12 100%);
    color: #fff;
    padding-top: 88px;
    padding-bottom: 96px;
    font-family: 'Montserrat', sans-serif;
  }

  .events-shell {
    width: min(1200px, calc(100% - 40px));
    margin: 0 auto;
  }

  .events-hero {
    position: relative;
    overflow: hidden;
    padding: 48px 0 24px;
  }
  .events-hero__inner {
    position: relative;
    z-index: 2;
    padding: 48px 0 32px;
  }
  .events-hero__glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(18px);
    pointer-events: none;
  }
  .events-hero__glow--teal {
    width: 360px; height: 360px;
    left: -120px; top: -60px;
    background: rgba(0,191,165,0.18);
  }
  .events-hero__glow--magenta {
    width: 320px; height: 320px;
    right: -100px; top: 40px;
    background: rgba(233,30,140,0.16);
  }
  .events-kicker,
  .events-section__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.24em;
    color: rgba(255,255,255,0.54);
    font-size: 11px;
  }
  .events-kicker::before,
  .events-section__eyebrow::before {
    content: '';
    width: 28px;
    height: 1px;
    background: linear-gradient(90deg, #00BFA5, #E91E8C);
  }
  .events-hero h1,
  .events-section__heading h2,
  .featured-card h3,
  .calendar-panel h3,
  .subscribe-card h2 {
    margin: 0;
    letter-spacing: 0.02em;
  }
  .events-hero h1 {
    margin-top: 14px;
    font-size: clamp(3.25rem, 9vw, 6.5rem);
    line-height: 0.92;
    text-transform: uppercase;
    max-width: 8ch;
  }
  .events-hero__lead {
    margin: 22px 0 12px;
    max-width: 760px;
    font-size: clamp(1.05rem, 2vw, 1.35rem);
    color: rgba(255,255,255,0.92);
  }
  .events-hero__body {
    margin: 0;
    max-width: 720px;
    color: rgba(255,255,255,0.62);
    line-height: 1.8;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.92rem;
  }
  .events-hero__actions,
  .events-pill-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .events-hero__actions { margin-top: 28px; }

  .events-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 46px;
    padding: 0 18px;
    border-radius: 12px;
    text-decoration: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
    cursor: pointer;
    border: none;
  }
  .events-btn:hover { transform: translateY(-1px); }
  .events-btn--primary {
    color: #07110f;
    background: linear-gradient(135deg, #00BFA5 0%, #E91E8C 100%);
    box-shadow: 0 14px 30px rgba(0,191,165,0.16);
  }
  .events-btn--ghost {
    color: #fff;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.03);
  }

  .events-section {
    margin-top: 46px;
  }
  .events-section__heading {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 18px;
  }
  .events-section__heading h2 {
    font-size: clamp(1.7rem, 4vw, 2.8rem);
    text-transform: uppercase;
  }

  .featured-card,
  .subscribe-card,
  .calendar-card,
  .calendar-panel,
  .event-card,
  .past-card,
  .testimonial-card {
    background: linear-gradient(180deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.03) 100%);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 18px 60px rgba(0,0,0,0.35);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
  }

  /* ── Event image / carousel system ── */
  .ev-img {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ev-img__photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.45s ease;
    pointer-events: none;
  }
  .ev-img__photo.is-active {
    opacity: 1;
  }
  .ev-img__pattern {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .ev-img__icon {
    position: relative;
    z-index: 1;
    width: 48px;
    height: 48px;
    opacity: 0.6;
    filter: drop-shadow(0 0 12px currentColor);
  }
  /* Nav arrows */
  .ev-img__nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 3;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.2);
    background: rgba(6,8,16,0.6);
    backdrop-filter: blur(8px);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s, border-color 0.2s, background 0.2s;
    padding: 0;
  }
  .ev-img:hover .ev-img__nav { opacity: 1; }
  .ev-img__nav:hover {
    border-color: #00BFA5;
    background: rgba(0,191,165,0.15);
  }
  .ev-img__nav--prev { left: 8px; }
  .ev-img__nav--next { right: 8px; }
  /* Dot indicators */
  .ev-img__dots {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
    display: flex;
    gap: 6px;
  }
  .ev-img__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    border: none;
    background: rgba(255,255,255,0.35);
    cursor: pointer;
    padding: 0;
    transition: background 0.2s, transform 0.2s;
  }
  .ev-img__dot.is-active {
    background: #00BFA5;
    transform: scale(1.3);
    box-shadow: 0 0 6px rgba(0,191,165,0.6);
  }
  /* Photo count badge */
  .ev-img__count {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 999px;
    background: rgba(6,8,16,0.65);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.85);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .featured-card {
    display: grid;
    grid-template-columns: 1.1fr 1.2fr;
    gap: 0;
    border-radius: 28px;
    overflow: hidden;
  }
  .featured-card__visual {
    position: relative;
    min-height: 340px;
  }
  .featured-card__img {
    position: absolute;
    inset: 0;
    height: 100% !important;
  }
  .featured-card__img .ev-img__icon {
    width: 72px;
    height: 72px;
  }
  .featured-card__badge,
  .event-card__badge {
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    padding: 8px 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #07110f;
    background: linear-gradient(135deg, #00BFA5 0%, #FFB300 100%);
  }
  .featured-card__badge { position: absolute; top: 24px; left: 24px; z-index: 2; }
  .featured-card__content {
    padding: 32px;
  }
  .events-meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 18px;
    margin-bottom: 16px;
    color: rgba(255,255,255,0.58);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .featured-card h3 {
    font-size: clamp(1.7rem, 4vw, 3rem);
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .featured-card p,
  .event-card p,
  .calendar-panel p,
  .past-card a,
  .testimonial-card p,
  .subscribe-card p {
    color: rgba(255,255,255,0.72);
    line-height: 1.8;
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.92rem;
  }
  .events-pill {
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.82);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .events-toolbar {
    display: grid;
    gap: 18px;
    padding: 18px;
    border-radius: 24px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
  }
  .events-toolbar__filters {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 14px;
    align-items: center;
  }
  .events-search {
    display: grid;
    gap: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.55);
  }
  .events-search input,
  .events-toolbar select,
  .subscribe-form input {
    width: 100%;
    min-height: 46px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(6,8,16,0.72);
    color: #fff;
    padding: 0 14px;
    outline: none;
  }
  .events-search input::placeholder,
  .subscribe-form input::placeholder {
    color: rgba(255,255,255,0.36);
  }
  .events-toolbar select {
    max-width: 260px;
    color: rgba(255,255,255,0.86);
  }
  .events-chips,
  .events-view-toggle {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .events-chip,
  .events-view-toggle button {
    min-height: 40px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(255,255,255,0.03);
    color: rgba(255,255,255,0.74);
    cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  .events-chip.is-active,
  .events-view-toggle .is-active {
    color: #07110f;
    background: linear-gradient(135deg, #00BFA5 0%, #E91E8C 100%);
    border-color: transparent;
  }

  .events-grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }
  .event-card,
  .past-card,
  .testimonial-card {
    border-radius: 22px;
    overflow: hidden;
  }
  .event-card {
    padding: 0;
    transition: border-color 0.2s, transform 0.2s;
  }
  .event-card:hover {
    border-color: rgba(0,191,165,0.25);
    transform: translateY(-2px);
  }
  .event-card__img {
    border-radius: 21px 21px 0 0;
  }
  .event-card__body {
    padding: 20px 22px 22px;
  }
  .past-card {
    padding: 0;
  }
  .past-card__img {
    border-radius: 21px 21px 0 0;
  }
  .past-card__img .ev-img__icon {
    width: 36px;
    height: 36px;
  }
  .past-card__body {
    padding: 16px 22px 22px;
  }
  .testimonial-card {
    padding: 22px;
  }
  .event-card h3,
  .past-card h3,
  .testimonial-card footer,
  .calendar-panel h4 {
    margin: 12px 0 10px;
    text-transform: uppercase;
  }
  .event-card__badge--inline {
    margin-top: 12px;
  }
  .event-card__meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 12px 0 16px;
    color: rgba(255,255,255,0.54);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .event-card__link {
    display: inline-flex;
    margin-top: 14px;
    color: #00BFA5;
    text-decoration: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s;
  }
  .event-card__link:hover {
    color: #E91E8C;
  }
  .event-card a,
  .past-card a,
  .subscribe-form__link {
    display: inline-flex;
    margin-top: 14px;
    color: #00BFA5;
    text-decoration: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .events-empty {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 48px 24px;
    text-align: center;
  }
  .events-empty p {
    color: rgba(255,255,255,0.5);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.95rem;
    margin: 0;
  }

  .calendar-layout {
    margin-top: 18px;
    display: grid;
    grid-template-columns: 1.5fr 0.75fr;
    gap: 18px;
  }
  .calendar-card,
  .calendar-panel {
    border-radius: 24px;
    padding: 22px;
  }
  .calendar-card__top {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }
  .calendar-card__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    color: rgba(255,255,255,0.6);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .calendar-card__legend span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 10px;
  }
  .calendar-grid__head,
  .calendar-day {
    min-height: 72px;
    border-radius: 16px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 12px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.03);
    color: #fff;
  }
  .calendar-grid__head {
    min-height: 24px;
    justify-content: center;
    align-items: center;
    color: rgba(255,255,255,0.48);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    text-transform: uppercase;
  }
  .calendar-day {
    cursor: pointer;
    flex-direction: column;
    gap: 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .calendar-day:hover:not(.is-empty) {
    border-color: rgba(255,255,255,0.15);
  }
  .calendar-day.is-empty {
    opacity: 0;
    pointer-events: none;
  }
  .calendar-day.is-active {
    border-color: rgba(0,191,165,0.5);
    box-shadow: inset 0 0 0 1px rgba(0,191,165,0.18), 0 0 24px rgba(0,191,165,0.08);
  }
  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
  }
  .dot.teal { background: #00BFA5; box-shadow: 0 0 10px rgba(0,191,165,0.5); }
  .dot.magenta { background: #E91E8C; box-shadow: 0 0 10px rgba(233,30,140,0.5); }
  .dot.gold { background: #FFB300; box-shadow: 0 0 10px rgba(255,179,0,0.5); }

  .past-grid,
  .testimonial-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }
  .past-card {
    transition: border-color 0.2s, transform 0.2s;
  }
  .past-card:hover {
    border-color: rgba(0,191,165,0.25);
    transform: translateY(-2px);
  }
  .past-card__type {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
  }
  .past-card__date {
    color: rgba(255,255,255,0.4);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    margin: 0;
  }
  .testimonial-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }

  .subscribe-card {
    border-radius: 28px;
    padding: 28px;
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 24px;
    align-items: center;
  }
  .subscribe-card h2 {
    font-size: clamp(1.6rem, 3.5vw, 2.6rem);
    text-transform: uppercase;
    max-width: 14ch;
  }
  .subscribe-form {
    display: grid;
    gap: 12px;
  }
  .subscribe-form button[type="submit"] {
    min-height: 46px;
    border: 0;
    border-radius: 12px;
    cursor: pointer;
    background: linear-gradient(135deg, #00BFA5 0%, #E91E8C 100%);
    color: #07110f;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }
  .subscribe-form__link {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }
  .subscribe-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;
    padding: 24px;
  }
  .subscribe-success p {
    color: rgba(255,255,255,0.65);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.88rem;
    margin: 0;
  }
  .subscribe-success strong {
    color: #00BFA5;
  }

  @media (max-width: 980px) {
    .featured-card,
    .subscribe-card,
    .calendar-layout,
    .events-toolbar__filters {
      grid-template-columns: 1fr;
    }
    .events-grid,
    .past-grid,
    .testimonial-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 720px) {
    .events-page {
      padding-top: 72px;
    }
    .events-shell {
      width: min(100% - 24px, 1200px);
    }
    .featured-card__content,
    .calendar-card,
    .calendar-panel,
    .event-card,
    .past-card,
    .testimonial-card,
    .subscribe-card {
      padding: 18px;
    }
    .events-grid,
    .past-grid,
    .testimonial-row,
    .calendar-grid {
      grid-template-columns: 1fr;
    }
    .calendar-grid__head {
      display: none;
    }
    .calendar-day {
      min-height: 56px;
      flex-direction: row;
      align-items: center;
    }
  }
`;
