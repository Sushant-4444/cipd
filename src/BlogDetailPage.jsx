import { useEffect, useState } from "react";

const API = process.env.REACT_APP_CMS_URL || "http://localhost:3001";

const CATEGORY_THEME = {
  Insight:      { gradient: "linear-gradient(135deg, #07201c 0%, #091a26 100%)", accent: "#00BFA5" },
  Tutorial:     { gradient: "linear-gradient(135deg, #220d1e 0%, #14092a 100%)", accent: "#E91E8C" },
  Announcement: { gradient: "linear-gradient(135deg, #221a07 0%, #1a160a 100%)", accent: "#FFB300" },
  "Case Study": { gradient: "linear-gradient(135deg, #07201c 0%, #221a07 100%)", accent: "#FFB300" },
  Interview:    { gradient: "linear-gradient(135deg, #220d1e 0%, #14092a 100%)", accent: "#E91E8C" },
  Research:     { gradient: "linear-gradient(135deg, #07201c 0%, #091a26 100%)", accent: "#00BFA5" },
  Industry:     { gradient: "linear-gradient(135deg, #07201c 0%, #220d1e 50%, #221a07 100%)", accent: "#FFB300" },
};

function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  } catch { return iso; }
}

// ─────────────────────────────────────────────────────────────────────────
// Minimal Lexical (Payload rich-text) renderer.
// Handles paragraphs, headings, lists, links, quotes, bold/italic/underline,
// inline code, and uploaded images. Unknown node types fall back to rendering
// their children, so we never crash on a new node Payload might emit.
// ─────────────────────────────────────────────────────────────────────────
function renderNode(node, key) {
  if (!node) return null;
  // TEXT NODE — Lexical encodes formatting as a bitmask on .format
  if (node.type === "text") {
    let el = <>{node.text}</>;
    const fmt = node.format || 0;
    if (fmt & 1)  el = <strong key={`b${key}`}>{el}</strong>;
    if (fmt & 2)  el = <em     key={`i${key}`}>{el}</em>;
    if (fmt & 8)  el = <u      key={`u${key}`}>{el}</u>;
    if (fmt & 4)  el = <s      key={`s${key}`}>{el}</s>;
    if (fmt & 16) el = <code   key={`c${key}`}>{el}</code>;
    return <span key={key}>{el}</span>;
  }

  const children = Array.isArray(node.children)
    ? node.children.map((c, i) => renderNode(c, `${key}-${i}`))
    : null;

  switch (node.type) {
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "heading": {
      const Tag = (node.tag || "h2");
      return <Tag key={key}>{children}</Tag>;
    }
    case "quote":
      return <blockquote key={key}>{children}</blockquote>;
    case "list": {
      const Tag = node.listType === "number" ? "ol" : "ul";
      return <Tag key={key}>{children}</Tag>;
    }
    case "listitem":
      return <li key={key}>{children}</li>;
    case "link":
    case "autolink": {
      const url = node.fields?.url || node.url || "#";
      const newTab = node.fields?.newTab || node.newTab;
      return (
        <a key={key} href={url} target={newTab ? "_blank" : undefined} rel={newTab ? "noopener noreferrer" : undefined}>
          {children}
        </a>
      );
    }
    case "linebreak":
      return <br key={key} />;
    case "horizontalrule":
      return <hr key={key} />;
    case "upload": {
      const m = node.value;
      if (m && typeof m === "object" && (m.url || m.thumbnailURL)) {
        const u = m.url || m.thumbnailURL;
        const src = u.startsWith("http") ? u : `${API}${u}`;
        return (
          <figure key={key} className="bdp-figure">
            <img src={src} alt={m.alt || ""} />
            {m.caption && <figcaption>{m.caption}</figcaption>}
          </figure>
        );
      }
      return null;
    }
    case "root":
      return <div key={key}>{children}</div>;
    default:
      return children ? <div key={key}>{children}</div> : null;
  }
}

function renderBody(richText) {
  if (!richText || !richText.root) {
    return <p className="bdp-empty">This post has no body content yet.</p>;
  }
  return renderNode(richText.root, "n");
}

// ─────────────────────────────────────────────────────────────────────────
export default function BlogDetailPage({ blog, onBack, allBlogs, onOpenBlog }) {
  const [galleryIdx, setGalleryIdx] = useState(0);
  const theme = CATEGORY_THEME[blog.category] || CATEGORY_THEME.Insight;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [blog.id]);

  // Resolve related posts: the CMS returns relationship IDs at depth 0,
  // but we already fetched all blogs in allBlogs — look them up by id.
  const related = Array.isArray(blog.relatedPosts)
    ? blog.relatedPosts
        .map((r) => (typeof r === "object" ? r.id : r))
        .map((id) => allBlogs.find((b) => b.id === id))
        .filter(Boolean)
    : [];

  const gallery = blog.galleryUrls || [];

  return (
    <div className="bdp">
      <style>{DETAIL_CSS}</style>

      <div className="bdp-shell bdp-back-bar">
        <button className="bdp-back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to Blog
        </button>
      </div>

      {/* Banner */}
      <section className="bdp-hero">
        <div className="bdp-hero__banner" style={{ background: theme.gradient }}>
          {blog.coverUrl ? (
            <img src={blog.coverUrl} alt={blog.title} className="bdp-hero__banner-photo" />
          ) : (
            <svg className="bdp-hero__banner-pattern" viewBox="0 0 600 260" fill="none" aria-hidden="true">
              <line x1="0" y1="52" x2="600" y2="52" stroke="rgba(255,255,255,0.03)"/>
              <line x1="0" y1="104" x2="600" y2="104" stroke="rgba(255,255,255,0.03)"/>
              <line x1="0" y1="156" x2="600" y2="156" stroke="rgba(255,255,255,0.03)"/>
              <line x1="0" y1="208" x2="600" y2="208" stroke="rgba(255,255,255,0.03)"/>
              <line x1="100" y1="0" x2="100" y2="260" stroke="rgba(255,255,255,0.03)"/>
              <line x1="200" y1="0" x2="200" y2="260" stroke="rgba(255,255,255,0.03)"/>
              <line x1="300" y1="0" x2="300" y2="260" stroke="rgba(255,255,255,0.03)"/>
              <line x1="400" y1="0" x2="400" y2="260" stroke="rgba(255,255,255,0.03)"/>
              <line x1="500" y1="0" x2="500" y2="260" stroke="rgba(255,255,255,0.03)"/>
            </svg>
          )}
          <div className="bdp-hero__banner-fade" />
        </div>

        <div className="bdp-shell bdp-hero__inner">
          <div className="bdp-badge">{blog.category}</div>
          <h1>{blog.title}</h1>
          <div className="bdp-meta-row">
            {blog.publishedDate && <span>{formatDate(blog.publishedDate)}</span>}
            {blog.readingTimeMinutes && (
              <>
                <span>·</span>
                <span>{blog.readingTimeMinutes} min read</span>
              </>
            )}
          </div>

          {blog.author && (
            <div className="bdp-author">
              <div className="bdp-author__avatar">
                {blog.authorPhotoUrl
                  ? <img src={blog.authorPhotoUrl} alt={blog.author} />
                  : <span>{(blog.author || "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>}
              </div>
              <div>
                <div className="bdp-author__name">{blog.author}</div>
                {blog.authorRole && <div className="bdp-author__role">{blog.authorRole}</div>}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Body */}
      <section className="bdp-shell bdp-section">
        {blog.excerpt && <p className="bdp-excerpt">{blog.excerpt}</p>}
        <article className="bdp-body">
          {renderBody(blog.body)}
        </article>

        {blog.tags && blog.tags.length > 0 && (
          <div className="bdp-tags">
            {blog.tags.map((t) => (
              <span key={t} className="bdp-pill">#{t}</span>
            ))}
          </div>
        )}
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="bdp-shell bdp-section">
          <div className="bdp-section__heading">
            <span className="bdp-eyebrow">Gallery</span>
            <h2>More from this post</h2>
          </div>
          <div className="bdp-gallery__main">
            {gallery.map((g, i) => (
              <img
                key={g.url + i}
                src={g.url}
                alt={g.caption || ""}
                className={`bdp-gallery__img ${i === galleryIdx ? "is-active" : ""}`}
              />
            ))}
            {gallery[galleryIdx]?.caption && (
              <div className="bdp-gallery__caption">{gallery[galleryIdx].caption}</div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="bdp-gallery__thumbs">
              {gallery.map((g, i) => (
                <button
                  key={g.url + i}
                  className={`bdp-gallery__thumb ${i === galleryIdx ? "is-active" : ""}`}
                  onClick={() => setGalleryIdx(i)}
                  aria-label={`Photo ${i + 1}`}
                >
                  <img src={g.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Related posts */}
      {related.length > 0 && (
        <section className="bdp-shell bdp-section">
          <div className="bdp-section__heading">
            <span className="bdp-eyebrow">Keep reading</span>
            <h2>Related posts</h2>
          </div>
          <div className="bdp-related-grid">
            {related.map((r) => (
              <article key={r.id} className="bdp-related-card" onClick={() => onOpenBlog && onOpenBlog(r)} role="link" tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" && onOpenBlog) onOpenBlog(r); }}>
                <div className="bdp-related-card__badge">{r.category}</div>
                <h3>{r.title}</h3>
                {r.excerpt && <p>{r.excerpt}</p>}
                <span className="bdp-related-card__meta">{r.author} · {formatDate(r.publishedDate)}</span>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const DETAIL_CSS = `
  .bdp {
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
  .bdp-shell { width: min(820px, calc(100% - 40px)); margin: 0 auto; }

  /* Back bar */
  .bdp-back-bar { padding: 16px 0 0; }
  .bdp-back-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: none;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 999px;
    color: rgba(255,255,255,0.7);
    padding: 10px 18px;
    cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.16em; text-transform: uppercase;
    transition: border-color 0.2s, color 0.2s;
  }
  .bdp-back-btn:hover { border-color: #00BFA5; color: #00BFA5; }

  /* Hero */
  .bdp-hero { position: relative; overflow: hidden; }
  .bdp-hero__banner {
    position: relative; width: 100%; height: 320px;
    overflow: hidden;
    display: flex; align-items: center; justify-content: center;
  }
  .bdp-hero__banner-photo {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
  }
  .bdp-hero__banner-pattern { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  .bdp-hero__banner-fade {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 140px;
    background: linear-gradient(to top, #060810 0%, transparent 100%);
    pointer-events: none;
  }
  .bdp-hero__inner {
    position: relative; z-index: 2;
    padding: 0 0 40px;
    margin-top: -60px;
    width: min(820px, calc(100% - 40px));
  }
  .bdp-badge {
    display: inline-flex; padding: 8px 14px; border-radius: 999px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: #07110f;
    background: linear-gradient(135deg, #00BFA5 0%, #FFB300 100%);
  }
  .bdp-hero h1 {
    margin: 18px 0 0;
    font-size: clamp(2rem, 4.5vw, 3.2rem);
    line-height: 1.15;
    letter-spacing: 0.01em;
    max-width: 28ch;
    text-transform: uppercase;
  }
  .bdp-meta-row {
    display: flex; flex-wrap: wrap; gap: 6px;
    margin-top: 16px;
    color: rgba(255,255,255,0.5);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; letter-spacing: 0.1em;
  }
  .bdp-author {
    display: flex; align-items: center; gap: 14px;
    margin-top: 24px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    width: fit-content;
  }
  .bdp-author__avatar {
    width: 48px; height: 48px;
    border-radius: 50%; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #00BFA5 0%, #E91E8C 100%);
    color: #07110f;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px; font-weight: 700; letter-spacing: 0.08em;
  }
  .bdp-author__avatar img { width: 100%; height: 100%; object-fit: cover; }
  .bdp-author__name { font-weight: 700; font-size: 14px; }
  .bdp-author__role {
    color: rgba(255,255,255,0.5);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; letter-spacing: 0.06em;
    margin-top: 2px;
  }

  /* Section */
  .bdp-section { margin-top: 40px; }
  .bdp-section__heading {
    display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;
  }
  .bdp-eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase; letter-spacing: 0.24em;
    color: rgba(255,255,255,0.54); font-size: 11px;
  }
  .bdp-eyebrow::before {
    content: ''; width: 28px; height: 1px;
    background: linear-gradient(90deg, #00BFA5, #E91E8C);
  }
  .bdp-section__heading h2 {
    margin: 0;
    font-size: clamp(1.4rem, 3vw, 2rem);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  /* Excerpt */
  .bdp-excerpt {
    font-family: 'Source Serif Pro', Georgia, serif;
    font-size: 1.35rem;
    line-height: 1.6;
    color: rgba(255,255,255,0.85);
    border-left: 3px solid #00BFA5;
    padding-left: 20px;
    margin: 0 0 32px;
  }

  /* Body — long-form reading copy */
  .bdp-body {
    font-family: 'Source Serif Pro', Georgia, serif;
    font-size: 1.1rem;
    line-height: 1.85;
    color: rgba(255,255,255,0.82);
  }
  .bdp-body > div > p, .bdp-body p { margin: 0 0 1.2em; }
  .bdp-body h1, .bdp-body h2, .bdp-body h3, .bdp-body h4 {
    font-family: 'Montserrat', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    margin-top: 2em; margin-bottom: 0.6em;
    color: #fff;
  }
  .bdp-body h1 { font-size: 1.8rem; }
  .bdp-body h2 { font-size: 1.5rem; }
  .bdp-body h3 { font-size: 1.25rem; }
  .bdp-body h4 { font-size: 1.1rem; }
  .bdp-body a {
    color: #00BFA5;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .bdp-body a:hover { color: #E91E8C; }
  .bdp-body blockquote {
    margin: 1.5em 0;
    padding: 16px 20px;
    border-left: 3px solid #E91E8C;
    background: rgba(233,30,140,0.05);
    color: rgba(255,255,255,0.9);
    font-style: italic;
  }
  .bdp-body ul, .bdp-body ol { padding-left: 1.5em; margin: 0 0 1.2em; }
  .bdp-body li { margin-bottom: 0.4em; }
  .bdp-body code {
    background: rgba(255,255,255,0.08);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.92em;
    color: #FFB300;
  }
  .bdp-body hr {
    margin: 2.5em 0;
    border: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  }
  .bdp-figure {
    margin: 2em 0;
    text-align: center;
  }
  .bdp-figure img {
    width: 100%;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .bdp-figure figcaption {
    margin-top: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.06em;
  }
  .bdp-empty {
    color: rgba(255,255,255,0.4);
    font-style: italic;
  }

  /* Tags */
  .bdp-tags {
    margin-top: 36px;
    display: flex; flex-wrap: wrap; gap: 8px;
  }
  .bdp-pill {
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.7);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: lowercase;
  }

  /* Gallery */
  .bdp-gallery__main {
    position: relative;
    width: 100%;
    aspect-ratio: 16/9;
    border-radius: 18px;
    overflow: hidden;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .bdp-gallery__img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.4s;
  }
  .bdp-gallery__img.is-active { opacity: 1; }
  .bdp-gallery__caption {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 14px 20px;
    background: linear-gradient(to top, rgba(6,8,16,0.85), transparent);
    color: rgba(255,255,255,0.85);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.06em;
  }
  .bdp-gallery__thumbs {
    display: flex; gap: 10px;
    margin-top: 12px;
    overflow-x: auto;
    padding-bottom: 6px;
  }
  .bdp-gallery__thumb {
    flex-shrink: 0;
    width: 90px; height: 60px;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid transparent;
    background: rgba(255,255,255,0.04);
    cursor: pointer;
    padding: 0;
    opacity: 0.55;
    transition: opacity 0.2s, border-color 0.2s;
  }
  .bdp-gallery__thumb.is-active {
    opacity: 1;
    border-color: #00BFA5;
    box-shadow: 0 0 10px rgba(0,191,165,0.3);
  }
  .bdp-gallery__thumb:hover { opacity: 0.85; }
  .bdp-gallery__thumb img { width: 100%; height: 100%; object-fit: cover; }

  /* Related posts */
  .bdp-related-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
  .bdp-related-card {
    padding: 20px;
    border-radius: 18px;
    background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.025) 100%);
    border: 1px solid rgba(255,255,255,0.08);
    cursor: pointer;
    transition: border-color 0.2s, transform 0.2s;
    display: flex; flex-direction: column; gap: 10px;
  }
  .bdp-related-card:hover {
    border-color: rgba(0,191,165,0.3);
    transform: translateY(-2px);
  }
  .bdp-related-card__badge {
    display: inline-flex; width: fit-content;
    padding: 5px 10px; border-radius: 999px;
    background: linear-gradient(135deg, #00BFA5 0%, #FFB300 100%);
    color: #07110f;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; font-weight: 700;
    letter-spacing: 0.18em; text-transform: uppercase;
  }
  .bdp-related-card h3 {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.3;
    text-transform: uppercase;
  }
  .bdp-related-card p {
    margin: 0;
    color: rgba(255,255,255,0.6);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    line-height: 1.5;
  }
  .bdp-related-card__meta {
    margin-top: auto;
    color: rgba(255,255,255,0.4);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
  }

  @media (max-width: 720px) {
    .bdp { padding-top: 72px; }
    .bdp-hero h1 { font-size: clamp(1.6rem, 6vw, 2.4rem); }
    .bdp-body { font-size: 1rem; }
    .bdp-excerpt { font-size: 1.15rem; }
    .bdp-related-grid { grid-template-columns: 1fr; }
  }
`;
