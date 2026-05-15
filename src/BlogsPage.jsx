import { useMemo, useState, useCallback, useEffect } from "react";
import BlogDetailPage from "./BlogDetailPage";

const API = process.env.REACT_APP_CMS_URL || "http://localhost:3001";

// ── Per-category theme (matches Events page style) ──────────────────────
const CATEGORY_THEME = {
  Insight:      { gradient: "linear-gradient(135deg, #07201c 0%, #091a26 100%)", accent: "#00BFA5" },
  Tutorial:     { gradient: "linear-gradient(135deg, #220d1e 0%, #14092a 100%)", accent: "#E91E8C" },
  Announcement: { gradient: "linear-gradient(135deg, #221a07 0%, #1a160a 100%)", accent: "#FFB300" },
  "Case Study": { gradient: "linear-gradient(135deg, #07201c 0%, #221a07 100%)", accent: "#FFB300" },
  Interview:    { gradient: "linear-gradient(135deg, #220d1e 0%, #14092a 100%)", accent: "#E91E8C" },
  Research:     { gradient: "linear-gradient(135deg, #07201c 0%, #091a26 100%)", accent: "#00BFA5" },
  Industry:     { gradient: "linear-gradient(135deg, #07201c 0%, #220d1e 50%, #221a07 100%)", accent: "#FFB300" },
};

const TYPE_ICONS = {
  Insight:      (c) => <><circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.2" fill="none"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></>,
  Tutorial:     (c) => <><path d="M4 5h16v11H4z" stroke={c} strokeWidth="1.2" fill="none"/><path d="M4 16l16 0M8 19h8M10 16v3M14 16v3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></>,
  Announcement: (c) => <><path d="M11 5v14l-7-4V9l7-4z M11 7l9 5-9 5" stroke={c} strokeWidth="1.2" fill="none" strokeLinejoin="round"/></>,
  "Case Study": (c) => <><rect x="4" y="4" width="16" height="16" rx="2" stroke={c} strokeWidth="1.2" fill="none"/><path d="M8 9h8M8 13h8M8 17h5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></>,
  Interview:    (c) => <><circle cx="12" cy="8" r="3" stroke={c} strokeWidth="1.2" fill="none"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke={c} strokeWidth="1.2" fill="none"/></>,
  Research:     (c) => <><circle cx="11" cy="11" r="6" stroke={c} strokeWidth="1.2" fill="none"/><path d="M16 16l4 4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></>,
  Industry:     (c) => <><path d="M4 20V8l5-3v15M9 12l5-3v11M14 14l5-3v9" stroke={c} strokeWidth="1.2" fill="none" strokeLinejoin="round"/></>,
};

// ── Helper: turn a populated Media object into a usable URL ─────────────
function mediaUrl(m) {
  if (!m || typeof m !== "object") return null;
  const u = m.url || m.thumbnailURL;
  if (!u) return null;
  return u.startsWith("http") ? u : `${API}${u}`;
}

// ── Transformer: CMS blog → flat shape expected by components ───────────
function transformBlog(b) {
  return {
    ...b,
    tags:        Array.isArray(b.tags) ? b.tags.map((t) => t.value).filter(Boolean) : [],
    coverUrl:    mediaUrl(b.coverImage),
    authorPhotoUrl: mediaUrl(b.authorPhoto),
    galleryUrls: Array.isArray(b.gallery)
      ? b.gallery.map((g) => ({ url: mediaUrl(g.image), caption: g.caption })).filter((g) => g.url)
      : [],
  };
}

// ── Date formatter ──────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

// ── Card image with themed placeholder ──────────────────────────────────
function BlogImage({ blog, className, height }) {
  const theme = CATEGORY_THEME[blog.category] || CATEGORY_THEME.Insight;
  const iconFn = TYPE_ICONS[blog.category] || TYPE_ICONS.Insight;
  if (blog.coverUrl) {
    return (
      <div className={className} style={{ height }}>
        <img src={blog.coverUrl} alt={blog.title} className="bp-img__photo" />
      </div>
    );
  }
  return (
    <div className={className} style={{ height, background: theme.gradient }}>
      <svg className="bp-img__pattern" viewBox="0 0 240 140" fill="none" aria-hidden="true">
        <line x1="0" y1="35"  x2="240" y2="35"  stroke="rgba(255,255,255,0.035)"/>
        <line x1="0" y1="70"  x2="240" y2="70"  stroke="rgba(255,255,255,0.035)"/>
        <line x1="0" y1="105" x2="240" y2="105" stroke="rgba(255,255,255,0.035)"/>
        <line x1="60"  y1="0" x2="60"  y2="140" stroke="rgba(255,255,255,0.035)"/>
        <line x1="120" y1="0" x2="120" y2="140" stroke="rgba(255,255,255,0.035)"/>
        <line x1="180" y1="0" x2="180" y2="140" stroke="rgba(255,255,255,0.035)"/>
        <circle cx="60"  cy="35"  r="2.5" fill="rgba(255,255,255,0.07)"/>
        <circle cx="120" cy="70"  r="2.5" fill="rgba(255,255,255,0.07)"/>
        <circle cx="180" cy="105" r="2.5" fill="rgba(255,255,255,0.07)"/>
      </svg>
      <svg className="bp-img__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {iconFn(theme.accent)}
      </svg>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
export default function BlogsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedBlog, setSelectedBlog] = useState(null);

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // ── Page copy from Settings global ──
  const [pageCopy, setPageCopy] = useState({
    kicker:   "CiPD · IIIT Delhi",
    headline: "Blog",
    lead:     "Ideas, research, and stories from the CiPD community.",
    body:     "Deep dives on intelligent product development, industry insights, and lessons from our cohorts. Written by researchers, mentors, and builders.",
  });

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/blogs?limit=100&depth=2&sort=-publishedDate&where[status][equals]=published`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setBlogs((data.docs || []).map(transformBlog));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load blogs from CMS:", err);
        setFetchError(err.message || "Could not load blogs");
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/globals/settings?depth=0`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setPageCopy((p) => ({
          kicker:   data.blogsKicker   || p.kicker,
          headline: data.blogsHeadline || p.headline,
          lead:     data.blogsLead     || p.lead,
          body:     data.blogsBody     || p.body,
        }));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const featured = blogs.find((b) => b.featured) || null;

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const searchable = `${b.title} ${b.author} ${b.excerpt} ${b.category} ${(b.tags || []).join(" ")}`.toLowerCase();
      const matchesQuery = searchable.includes(query.trim().toLowerCase());
      const matchesCategory = category === "All" || b.category === category;
      return matchesQuery && matchesCategory && !b.featured;
    });
  }, [blogs, query, category]);

  const openBlog = useCallback((blog) => setSelectedBlog(blog), []);
  const closeDetail = useCallback(() => setSelectedBlog(null), []);

  // Suppress the App-level scroll-up-to-go-back gesture while a detail is open
  useEffect(() => {
    if (selectedBlog) {
      document.body.dataset.modalOpen = "true";
      return () => { delete document.body.dataset.modalOpen; };
    }
  }, [selectedBlog]);

  if (selectedBlog) {
    return <BlogDetailPage blog={selectedBlog} onBack={closeDetail} allBlogs={blogs} onOpenBlog={openBlog} />;
  }

  return (
    <main className="blogs-page">
      <style>{CSS}</style>

      <section className="blogs-hero">
        <div className="blogs-hero__glow blogs-hero__glow--teal" />
        <div className="blogs-hero__glow blogs-hero__glow--magenta" />
        <div className="blogs-shell blogs-hero__inner">
          <div className="blogs-kicker">{pageCopy.kicker}</div>
          <h1>{pageCopy.headline}</h1>
          <p className="blogs-hero__lead">{pageCopy.lead}</p>
          <p className="blogs-hero__body">{pageCopy.body}</p>
        </div>
      </section>

      {featured && (
        <section className="blogs-shell blogs-section" id="featured-blog">
          <div className="blogs-section__heading">
            <span className="blogs-section__eyebrow">Featured Post</span>
            <h2>Editor's Pick</h2>
          </div>

          <article className="featured-blog" onClick={() => openBlog(featured)} role="link" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") openBlog(featured); }}>
            <div className="featured-blog__visual">
              <BlogImage blog={featured} className="bp-img featured-blog__img" height="100%" />
              <div className="featured-blog__badge">{featured.category}</div>
            </div>
            <div className="featured-blog__content">
              <div className="blogs-meta-row">
                <span>{formatDate(featured.publishedDate)}</span>
                {featured.readingTimeMinutes && <span>{featured.readingTimeMinutes} min read</span>}
              </div>
              <h3>{featured.title}</h3>
              {featured.excerpt && <p>{featured.excerpt}</p>}
              <div className="featured-blog__author">
                <div className="featured-blog__avatar">
                  {featured.authorPhotoUrl
                    ? <img src={featured.authorPhotoUrl} alt={featured.author} />
                    : <span>{(featured.author || "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>}
                </div>
                <div>
                  <div className="featured-blog__author-name">{featured.author}</div>
                  {featured.authorRole && <div className="featured-blog__author-role">{featured.authorRole}</div>}
                </div>
              </div>
              <button className="blogs-btn blogs-btn--primary" onClick={(e) => { e.stopPropagation(); openBlog(featured); }}>
                Read Article →
              </button>
            </div>
          </article>
        </section>
      )}

      <section className="blogs-shell blogs-section">
        <div className="blogs-toolbar">
          <label className="blogs-search">
            <span>Search</span>
            <input
              type="search"
              placeholder="Search posts by title, author, tag…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <div className="blogs-chips" role="tablist" aria-label="Category filter">
            {["All", "Insight", "Tutorial", "Announcement", "Case Study", "Interview", "Research", "Industry"].map((item) => (
              <button
                key={item}
                className={`blogs-chip ${category === item ? "is-active" : ""}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="blogs-grid">
          {loading ? (
            <div className="blogs-empty"><p>Loading posts…</p></div>
          ) : fetchError ? (
            <div className="blogs-empty">
              <p>Could not reach the blogs CMS ({fetchError}).</p>
              <p>Make sure the backend is running at <code>{API}</code>.</p>
            </div>
          ) : filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog) => (
              <article key={blog.id} className="blog-card" onClick={() => openBlog(blog)} role="link" tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") openBlog(blog); }}>
                <BlogImage blog={blog} className="bp-img blog-card__img" height={180} />
                <div className="blog-card__body">
                  <div className="blog-card__badge">{blog.category}</div>
                  <h3>{blog.title}</h3>
                  {blog.excerpt && <p>{blog.excerpt}</p>}
                  <div className="blog-card__meta">
                    <span>{blog.author}</span>
                    <span>·</span>
                    <span>{formatDate(blog.publishedDate)}</span>
                    {blog.readingTimeMinutes && (
                      <>
                        <span>·</span>
                        <span>{blog.readingTimeMinutes} min</span>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="blogs-empty">
              <p>No posts match your filters.</p>
              <button className="blogs-btn blogs-btn--ghost" onClick={() => { setQuery(""); setCategory("All"); }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=JetBrains+Mono:wght@400;600;700&family=Source+Serif+Pro:wght@400;600&display=swap');

  .blogs-page {
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
  .blogs-shell {
    width: min(1200px, calc(100% - 40px));
    margin: 0 auto;
  }

  /* Hero */
  .blogs-hero { position: relative; overflow: hidden; padding: 48px 0 24px; }
  .blogs-hero__inner { position: relative; z-index: 2; padding: 48px 0 32px; }
  .blogs-hero__glow {
    position: absolute; border-radius: 50%; filter: blur(18px); pointer-events: none;
  }
  .blogs-hero__glow--teal    { width: 360px; height: 360px; left: -120px; top: -60px;  background: rgba(0,191,165,0.18); }
  .blogs-hero__glow--magenta { width: 320px; height: 320px; right: -100px; top: 40px; background: rgba(233,30,140,0.16); }
  .blogs-kicker, .blogs-section__eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase; letter-spacing: 0.24em;
    color: rgba(255,255,255,0.54); font-size: 11px;
  }
  .blogs-kicker::before, .blogs-section__eyebrow::before {
    content: ''; width: 28px; height: 1px;
    background: linear-gradient(90deg, #00BFA5, #E91E8C);
  }
  .blogs-hero h1, .blogs-section__heading h2, .featured-blog h3 {
    margin: 0; letter-spacing: 0.02em;
  }
  .blogs-hero h1 {
    margin-top: 14px;
    font-size: clamp(3rem, 8vw, 5.5rem);
    line-height: 0.94;
    text-transform: uppercase;
    max-width: 10ch;
  }
  .blogs-hero__lead {
    margin: 22px 0 12px; max-width: 760px;
    font-size: clamp(1.05rem, 2vw, 1.35rem);
    color: rgba(255,255,255,0.92);
  }
  .blogs-hero__body {
    margin: 0; max-width: 720px;
    color: rgba(255,255,255,0.62);
    line-height: 1.8;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.92rem;
  }

  /* Buttons */
  .blogs-btn {
    display: inline-flex; align-items: center; justify-content: center;
    min-height: 46px; padding: 0 18px;
    border-radius: 12px;
    text-decoration: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.22em; text-transform: uppercase;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer; border: none;
  }
  .blogs-btn:hover { transform: translateY(-1px); }
  .blogs-btn--primary {
    color: #07110f;
    background: linear-gradient(135deg, #00BFA5 0%, #E91E8C 100%);
    box-shadow: 0 14px 30px rgba(0,191,165,0.16);
  }
  .blogs-btn--ghost {
    color: #fff;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.03);
  }

  /* Section heading */
  .blogs-section { margin-top: 46px; }
  .blogs-section__heading {
    display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px;
  }
  .blogs-section__heading h2 {
    font-size: clamp(1.7rem, 4vw, 2.8rem);
    text-transform: uppercase;
  }

  /* Glass cards */
  .featured-blog, .blog-card {
    background: linear-gradient(180deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.03) 100%);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 18px 60px rgba(0,0,0,0.35);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
  }

  /* Image placeholder system */
  .bp-img { position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
  .bp-img__photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .bp-img__pattern { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  .bp-img__icon { position: relative; z-index: 1; width: 48px; height: 48px; opacity: 0.6; filter: drop-shadow(0 0 12px currentColor); }

  /* Featured post */
  .featured-blog {
    display: grid;
    grid-template-columns: 1.1fr 1.2fr;
    border-radius: 28px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s, border-color 0.2s;
  }
  .featured-blog:hover { transform: translateY(-2px); border-color: rgba(0,191,165,0.3); }
  .featured-blog__visual { position: relative; min-height: 340px; }
  .featured-blog__img { position: absolute; inset: 0; height: 100% !important; }
  .featured-blog__img .bp-img__icon { width: 72px; height: 72px; }
  .featured-blog__badge {
    position: absolute; top: 24px; left: 24px; z-index: 2;
    display: inline-flex; padding: 8px 12px; border-radius: 999px;
    font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: #07110f;
    background: linear-gradient(135deg, #00BFA5 0%, #FFB300 100%);
  }
  .featured-blog__content { padding: 32px; display: flex; flex-direction: column; gap: 16px; }
  .blogs-meta-row {
    display: flex; flex-wrap: wrap; gap: 10px 18px;
    color: rgba(255,255,255,0.58);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
  }
  .featured-blog h3 {
    font-size: clamp(1.5rem, 3.5vw, 2.4rem);
    text-transform: uppercase;
    line-height: 1.15;
  }
  .featured-blog p {
    color: rgba(255,255,255,0.72);
    line-height: 1.8;
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.92rem;
  }
  .featured-blog__author {
    display: flex; align-items: center; gap: 12px;
    margin-top: auto;
  }
  .featured-blog__avatar {
    width: 44px; height: 44px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #00BFA5 0%, #E91E8C 100%);
    color: #07110f;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px; font-weight: 700; letter-spacing: 0.06em;
  }
  .featured-blog__avatar img { width: 100%; height: 100%; object-fit: cover; }
  .featured-blog__author-name { font-weight: 700; font-size: 13px; }
  .featured-blog__author-role {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.08em;
    color: rgba(255,255,255,0.5);
  }

  /* Toolbar */
  .blogs-toolbar {
    display: grid; gap: 18px; padding: 18px;
    border-radius: 24px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
  }
  .blogs-search {
    display: grid; gap: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.2em;
    text-transform: uppercase; color: rgba(255,255,255,0.55);
  }
  .blogs-search input {
    width: 100%; min-height: 46px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(6,8,16,0.72);
    color: #fff; padding: 0 14px; outline: none;
  }
  .blogs-search input::placeholder { color: rgba(255,255,255,0.36); }
  .blogs-chips { display: flex; flex-wrap: wrap; gap: 10px; }
  .blogs-chip {
    min-height: 40px; padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(255,255,255,0.03);
    color: rgba(255,255,255,0.74);
    cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.18em; text-transform: uppercase;
  }
  .blogs-chip.is-active {
    color: #07110f;
    background: linear-gradient(135deg, #00BFA5 0%, #E91E8C 100%);
    border-color: transparent;
  }

  /* Blog grid */
  .blogs-grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }
  .blog-card {
    border-radius: 22px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.2s;
    display: flex;
    flex-direction: column;
  }
  .blog-card:hover {
    border-color: rgba(0,191,165,0.25);
    transform: translateY(-2px);
  }
  .blog-card__img { border-radius: 21px 21px 0 0; }
  .blog-card__body { padding: 20px 22px 22px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
  .blog-card__badge {
    display: inline-flex; width: fit-content;
    border-radius: 999px; padding: 6px 10px;
    font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: #07110f;
    background: linear-gradient(135deg, #00BFA5 0%, #FFB300 100%);
  }
  .blog-card h3 {
    margin: 0;
    font-size: 1.15rem;
    line-height: 1.3;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  .blog-card p {
    color: rgba(255,255,255,0.66);
    line-height: 1.7;
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
  }
  .blog-card__meta {
    display: flex; flex-wrap: wrap; gap: 6px;
    margin-top: auto;
    padding-top: 8px;
    color: rgba(255,255,255,0.5);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
  }

  .blogs-empty {
    grid-column: 1 / -1;
    display: flex; flex-direction: column; align-items: center;
    gap: 16px; padding: 48px 24px; text-align: center;
  }
  .blogs-empty p {
    color: rgba(255,255,255,0.5);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.95rem; margin: 0;
  }
  .blogs-empty code {
    color: rgba(255,255,255,0.7);
    background: rgba(255,255,255,0.06);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85em;
  }

  @media (max-width: 980px) {
    .featured-blog { grid-template-columns: 1fr; }
    .blogs-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 720px) {
    .blogs-page { padding-top: 72px; }
    .blogs-shell { width: min(100% - 24px, 1200px); }
    .featured-blog__content, .blog-card__body { padding: 18px; }
    .blogs-grid { grid-template-columns: 1fr; }
  }
`;
