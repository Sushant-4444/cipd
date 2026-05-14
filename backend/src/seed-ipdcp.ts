/**
 * Seeds the IpdcpPage global with the values that were hard-coded as fallbacks
 * in the React slide components, so the CMS becomes the source of truth.
 *
 * After running this, every text/array on each slide is populated in the
 * `ipdcp-page` global — editors can now modify, add, or delete items via the
 * admin UI and the public site picks up the changes.
 *
 * Run:
 *   npm run seed:ipdcp
 *
 * Re-running is safe — it OVERWRITES the whole global each time. So if you've
 * edited content in the admin and you re-run this, your edits will be lost.
 * Don't run it after the cohort starts manually maintaining the content.
 *
 * Testimonial videos and poster images are NOT seeded — the original paths
 * point to `/testimonials/segment_*.mp4` in the React /public folder, which
 * aren't Media-collection uploads. To wire them up, upload each video via
 * the admin's Media library, then attach to the testimonials rows.
 */

import { getPayload } from "payload";
import config from "./payload.config.js";

const ipdcpData = {
  // ── Slide 01 — Identity ────────────────────────────────────────────
  slide01: {
    headline: "iPD-CP: THE ACCELERATOR",
    body: "A certificate program at IIIT Delhi — bridging the gap between academic theory and production-ready hardware innovation.",
    goalLabel: "The Goal",
    goalText: "Turning India into a Product Nation by upskilling the next generation of hardware innovators.",
    stats: [
      { number: "24",     label: "Weeks" },
      { number: "IIIT-D", label: "Campus" },
      { number: "1",      label: "Finished Product" },
    ],
  },

  // ── Slide 02 — Beyond The Simulation ───────────────────────────────
  slide02: {
    headline: "BEYOND THE SIMULATION",
    body: "Modeled on industry training for fresh hires — master the entire Product Development Life Cycle.",
    features: [
      { icon: "◈", title: "Concept to Reality",  description: "From initial ideation to a production-ready prototype." },
      { icon: "⬡", title: "The Technical Stack", description: "Embedded Systems, IoT, PCB Design, and Enclosure Design." },
      { icon: "◎", title: "Industry Validation", description: "Comprehensive testing, validation, and production readiness." },
    ],
  },

  // ── Slide 03 — Mastery Track / Modules ─────────────────────────────
  slide03: {
    headline: "THE MASTERY TRACK",
    body: "Three core mastery tracks — from users to hardware to code.",
    modules: [
      { icon: "◐", title: "Design Thinking",      description: "Surveys, requirement analysis, and building products that solve real user problems." },
      { icon: "◑", title: "Embedded Hardware",    description: "Circuit design, PCB schematics, fabrication, soldering, and thermal management." },
      { icon: "◒", title: "Software & Firmware",  description: "Production-grade code on STM32 microcontrollers with seamless hardware integration." },
    ],
  },

  // ── Slide 04 — Right Fit / Audience ────────────────────────────────
  slide04: {
    headline: "ARE YOU THE RIGHT FIT?",
    body: "Built for builders at every stage.",
    audiences: [
      { icon: "🎓",  title: "Final-Year Students",      description: "Keen on building world-class hardware products." },
      { icon: "⚡",  title: "Recent Graduates",          description: "Looking to boost employability through specialised upskilling." },
      { icon: "🚀",  title: "Startups & Entrepreneurs", description: "Seeking 'first-time-right' commercialisation strategies." },
      { icon: "⚙️", title: "Working Professionals",    description: "Specialised training in Embedded Systems & Product Design." },
    ],
  },

  // ── Slide 05 — Testimonials ────────────────────────────────────────
  // Video + poster left unset — upload via admin's Media library to attach.
  slide05: {
    headline: "HEAR FROM OUR BUILDERS",
    body: "Real builders. Real outcomes. Straight from the cohort.",
    testimonials: [
      { name: "Vivek Dagar",     batch: "Cohort 01 · 2025" },
      { name: "Yash Agarwal",    batch: "Cohort 01 · 2025" },
      { name: "Theajus Prakash", batch: "Cohort 01 · 2025" },
    ],
  },

  // ── Slide 06 — Scholarships & Fellowships ──────────────────────────
  slide06: {
    headline: "SCHOLARSHIPS & FELLOWSHIPS",
    body: "Financial support to make the program accessible from day one.",
    onboarding: {
      title: "Onboarding Scholarship",
      subtitle: "GPA-based scholarship reducing your effective Program Fee · Base Fee: ₹1,25,000 + GST",
      tiers: [
        { criterion: "GPA ≥ 8.0",          feeAfter: "₹75,000", scholarshipAmount: "₹50,000 Scholarship", color: "teal"    },
        { criterion: "GPA ≥ 7.5",          feeAfter: "₹85,000", scholarshipAmount: "₹40,000 Scholarship", color: "teal"    },
        { criterion: "Women · GPA ≥ 7.5",  feeAfter: "₹75,000", scholarshipAmount: "₹50,000 Scholarship", color: "magenta" },
      ],
    },
    fellowship: {
      title: "CiPD Product Development Fellowship",
      subtitle: "Performance-based monthly stipend for regular & actively engaged participants · up to ₹1.5 Lakhs total",
      stats: [
        { label: "Monthly Stipend",  value: "₹15,000",   note: "From month 3 onwards" },
        { label: "Duration",         value: "10 months", note: "6 months post-program" },
        { label: "Total Support",    value: "₹1.5 L",    note: "Maximum total value" },
      ],
      eligibilityNote: "All regular and actively engaged participants. Stipend begins from the 3rd month and can extend up to 6 months post-program.",
    },
  },

  // ── Slide 07 — Grants & Incubation ─────────────────────────────────
  slide07: {
    headline: "GRANTS & INCUBATION",
    body: "For participants turning their product into a startup.",
    sectionTitle: "Startup Grants & Incubation",
    sectionSubtitle: "Funding and incubation support for cohort startups",
    grants: [
      { name: "CiPD Seed Grant",            amount: "Up to ₹2 L",  description: "For high-potential early-stage startups from the cohort.",                color: "gold"    },
      { name: "READY (via IHFC)",           amount: "Up to ₹5 L",  description: "₹25K/mo (graduates) or ₹12K/mo (B.Tech) + ₹5L consumables grant.",      color: "teal"    },
      { name: "Entrepreneur in Residence",  amount: "₹4 L total",  description: "₹30,000/month scholarship with up to ₹4 Lakhs in total funding support.", color: "magenta" },
      { name: "NIDHI PRAYAS Scheme",        amount: "Up to ₹10 L", description: "Significant startup funding for up to one year via the national scheme.", color: "gold"    },
    ],
  },

  // ── Slide 08 — CTA / Reserve Your Seat ─────────────────────────────
  slide08: {
    headline: "RESERVE YOUR SEAT",
    cohortLabel: "Next Cohort",
    cohortDate: "TBA — 2026",
    limitedSeatsLabel: "Limited Seats",
    deadlineNote: "Each cohort is capped to ensure hands-on mentorship. Final Application Submission Deadline: 27 May 2026.",
    applyUrl: "https://docs.google.com/forms/d/e/1FAIpQLScnTQdnzGalnaqckHoUXKlMnYAXiHdn2qpATLaJCVtRCjMCOQ/viewform",
  },
};

async function main() {
  console.log("🔌 Initializing Payload…");
  const payload = await getPayload({ config });

  console.log("📝 Writing ipdcp-page global…");
  await payload.updateGlobal({
    slug: "ipdcp-page",
    data: ipdcpData as any,
  });

  // Print summary
  console.log("\n✅ Seeded iPD-CP page content:");
  for (const [slideKey, slide] of Object.entries(ipdcpData)) {
    const arrays: string[] = [];
    for (const [k, v] of Object.entries(slide)) {
      if (Array.isArray(v)) arrays.push(`${k}=${v.length}`);
      else if (v && typeof v === "object") {
        for (const [kk, vv] of Object.entries(v)) {
          if (Array.isArray(vv)) arrays.push(`${k}.${kk}=${vv.length}`);
        }
      }
    }
    console.log(`  ${slideKey}: ${(slide as any).headline || "(no headline)"}${arrays.length ? "  · arrays: " + arrays.join(", ") : ""}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
