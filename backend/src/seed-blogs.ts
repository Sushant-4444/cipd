/**
 * Seeds 3 sample blog posts so the public /blogs page is not empty on first run.
 *
 *   npm run seed:blogs
 *
 * Wipes the existing blogs collection first. Safe to re-run.
 */

import { getPayload } from "payload";
import config from "./payload.config.js";

// Tiny helper to build a Lexical paragraph node from plain text
function p(text: string) {
  return {
    type: "paragraph",
    version: 1,
    children: [{ type: "text", version: 1, text, format: 0 }],
  };
}
function h2(text: string) {
  return {
    type: "heading",
    tag: "h2",
    version: 1,
    children: [{ type: "text", version: 1, text, format: 0 }],
  };
}
function quote(text: string) {
  return {
    type: "quote",
    version: 1,
    children: [{ type: "text", version: 1, text, format: 0 }],
  };
}
function lexicalBody(...nodes: any[]) {
  return {
    root: {
      type: "root",
      version: 1,
      format: "",
      indent: 0,
      direction: "ltr",
      children: nodes,
    },
  };
}

const POSTS = [
  {
    title: "Why India Needs to Become a Product Nation",
    slug: "india-product-nation",
    category: "Insight",
    status: "published",
    featured: true,
    author: "Prof. Rajesh Kumar",
    authorRole: "Director, CiPD · IIIT Delhi",
    publishedDate: "2026-04-08T09:00:00.000Z",
    excerpt: "We have the talent. We have the institutions. What we lack is a culture of shipping production-ready hardware. Here's how CiPD is changing that.",
    tags: [{ value: "product-development" }, { value: "india" }, { value: "hardware" }, { value: "manifesto" }],
    body: lexicalBody(
      p("For decades, India has been celebrated as a software powerhouse — a back-end to the world. But the next decade demands something more: hardware. Real products. Things you can hold, ship, and sell."),
      h2("The Service-Sector Trap"),
      p("Our engineering schools graduate hundreds of thousands of capable students each year. Most of them end up in software services, optimizing someone else's product. The talent is there; the opportunity to build is not."),
      quote("A product nation is one where building, not just servicing, is the default career path."),
      h2("What iPD-CP Does Differently"),
      p("The Intelligent Product Development Certificate Program at IIIT Delhi is our answer. Twenty-four weeks. One finished product. From schematic to enclosure to firmware to validation."),
      p("Cohort 01 graduated last year. Cohort 02 starts this June. If you're a final-year student, recent graduate, or working professional ready to ship — we built this for you."),
    ),
    readingTimeMinutes: 4,
  },
  {
    title: "From Idea to PCB: A 24-Week Walkthrough",
    slug: "idea-to-pcb-walkthrough",
    category: "Tutorial",
    status: "published",
    featured: false,
    author: "Priya Malhotra",
    authorRole: "Product Lead, CiPD",
    publishedDate: "2026-03-20T11:00:00.000Z",
    excerpt: "What does the iPD-CP journey actually look like, week by week? Here's an honest breakdown — including the parts that take longer than you'd expect.",
    tags: [{ value: "curriculum" }, { value: "pcb-design" }, { value: "process" }],
    body: lexicalBody(
      p("People often ask: \"What do you actually do for 24 weeks?\" The short answer: you build one production-ready hardware product, end to end. The long answer follows."),
      h2("Weeks 1–4: Concept & Requirements"),
      p("This is where most projects fail. We spend a full month on user research, requirement analysis, and constraint discovery before anyone touches a schematic. By week 4 you have a tight problem statement and a feature set."),
      h2("Weeks 5–12: Schematic & Firmware"),
      p("Circuit design in KiCad, parallel firmware development on STM32 microcontrollers. Hardware and software diverge briefly, then converge in the first integration sprint at week 10."),
      h2("Weeks 13–18: PCB Fabrication & Bring-Up"),
      p("PCBs go out to fab around week 13. Two weeks later they come back, and you spend the next stretch debugging the real board — not the simulation. This is where every learner's understanding of \"production-ready\" deepens."),
      h2("Weeks 19–24: Enclosure, Validation & Demo"),
      p("Mechanical design, thermal management, regulatory checks, validation testing. Final demo at week 24 — to industry partners, faculty, and your future hiring managers."),
    ),
    readingTimeMinutes: 5,
  },
  {
    title: "Cohort 01 Showcase: 14 Products in 24 Weeks",
    slug: "cohort-01-showcase",
    category: "Case Study",
    status: "published",
    featured: false,
    author: "CiPD Team",
    publishedDate: "2026-02-14T15:00:00.000Z",
    excerpt: "From wearable biosensors to industrial IoT gateways, our first cohort shipped 14 distinct products. Here's what they built and what we learned.",
    tags: [{ value: "cohort" }, { value: "showcase" }, { value: "alumni" }],
    body: lexicalBody(
      p("Cohort 01 wrapped in December 2025 with a public showcase at IIIT Delhi. Fourteen teams, fourteen working products. Industry partners walked away with three signed letters of intent on the spot."),
      h2("The Range"),
      p("The products ranged from a low-cost ECG patch (later licensed to a Delhi medical startup) to an off-grid solar water-quality monitor designed for rural deployment. Every project had real users in mind from week one."),
      h2("What Worked"),
      p("Three things, consistently: weekly external reviews, fixed scope (one product, no pivots after week 4), and mentor pairs who themselves had shipped hardware. The pressure of a real demo at week 24 kept teams ruthless about cuts."),
      h2("What We're Changing for Cohort 02"),
      p("More time on validation testing — we underestimated how long DVT takes. We're also adding a structured \"manufacturing handoff\" module: bill of materials, sourcing, panelisation, the boring-but-critical parts of moving from prototype to production."),
    ),
    readingTimeMinutes: 4,
  },
];

async function main() {
  console.log("🔌 Initializing Payload…");
  const payload = await getPayload({ config });

  const existing = await payload.find({ collection: "blogs", limit: 1000, depth: 0 });
  console.log(`🧹 Wiping ${existing.docs.length} existing blogs…`);
  for (const doc of existing.docs) {
    await payload.delete({ collection: "blogs", id: doc.id });
  }

  console.log("✍️  Creating posts…");
  for (const post of POSTS) {
    const created = await payload.create({
      collection: "blogs",
      data: post as any,
    });
    console.log(`  ✓ [${created.id}] ${post.status.padEnd(9)} | ${post.category.padEnd(11)} | ${post.title}`);
  }

  console.log(`\n✅ Imported ${POSTS.length} blog posts.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
