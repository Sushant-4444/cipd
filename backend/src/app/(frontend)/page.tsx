import Link from "next/link";

export default function RootPage() {
  return (
    <main style={{
      minHeight:    "100vh",
      display:      "flex",
      flexDirection:"column",
      alignItems:   "center",
      justifyContent:"center",
      gap:           "1.5rem",
      background:    "linear-gradient(180deg, #060810 0%, #080a12 100%)",
      color:         "#fff",
      padding:       "2rem",
    }}>
      <h1 style={{ margin: 0, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "0.04em" }}>
        CiPD <span style={{ color: "#00BFA5" }}>CMS</span>
      </h1>
      <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", textAlign: "center", maxWidth: "40ch" }}>
        Content management backend for the CiPD website.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/admin"
          style={{
            display:        "inline-block",
            padding:        "0.75rem 1.5rem",
            borderRadius:   "0.5rem",
            background:     "linear-gradient(135deg, #00BFA5 0%, #E91E8C 100%)",
            color:          "#0a0c14",
            fontWeight:     700,
            textDecoration: "none",
            letterSpacing:  "0.04em",
          }}
        >
          Open Admin →
        </Link>
        <Link
          href="/api/events"
          style={{
            display:        "inline-block",
            padding:        "0.75rem 1.5rem",
            borderRadius:   "0.5rem",
            border:         "1px solid rgba(255,255,255,0.15)",
            color:          "rgba(255,255,255,0.8)",
            textDecoration: "none",
          }}
        >
          REST API
        </Link>
      </div>
    </main>
  );
}
