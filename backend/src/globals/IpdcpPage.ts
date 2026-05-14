import type { GlobalConfig } from "payload";

/**
 * The iPD-CP scroll-story has 8 slides, each with very different content.
 * Each slide is modeled as a nested group so the admin sidebar shows one
 * accordion per slide (Slide 01 — Identity, Slide 02 — Hands-on, etc.).
 */
export const IpdcpPage: GlobalConfig = {
  slug: "ipdcp-page",
  label: "iPD-CP Page",
  admin: {
    description:
      "Content for all 8 slides of the iPD-CP scroll story on the homepage. Visual styling and animations stay in code — only text, numbers, and lists are edited here.",
    group: "Pages",
  },
  access: {
    read:   () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    // ════════════════════════════════════════════════════════════════════
    // Slide 01 — Identity
    // ════════════════════════════════════════════════════════════════════
    {
      name: "slide01",
      label: "Slide 01 — Identity",
      type: "group",
      admin: { description: "Opening intro card with stats." },
      fields: [
        { name: "headline",  type: "text",     defaultValue: "iPD-CP: THE ACCELERATOR" },
        { name: "body",      type: "textarea", defaultValue: "A certificate program at IIIT Delhi — bridging the gap between academic theory and production-ready hardware innovation." },
        { name: "goalLabel", type: "text",     defaultValue: "The Goal" },
        { name: "goalText",  type: "textarea", defaultValue: "Turning India into a Product Nation by upskilling the next generation of hardware innovators." },
        {
          name: "stats",
          type: "array",
          minRows: 1,
          maxRows: 4,
          admin: { description: "The 3 number+label stats shown under the goal card." },
          fields: [
            {
              type: "row",
              fields: [
                { name: "number", type: "text", required: true, admin: { width: "50%", placeholder: "24" } },
                { name: "label",  type: "text", required: true, admin: { width: "50%", placeholder: "Weeks" } },
              ],
            },
          ],
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════
    // Slide 02 — Hands-on
    // ════════════════════════════════════════════════════════════════════
    {
      name: "slide02",
      label: "Slide 02 — Beyond The Simulation",
      type: "group",
      fields: [
        { name: "headline", type: "text",     defaultValue: "BEYOND THE SIMULATION" },
        { name: "body",     type: "textarea", defaultValue: "Modeled on industry training for fresh hires — master the entire Product Development Life Cycle." },
        {
          name: "features",
          type: "array",
          minRows: 1,
          maxRows: 6,
          admin: { description: "Feature list shown to the right of the PCB animation." },
          fields: [
            { name: "icon",        type: "text",     required: true, admin: { description: "A single symbol or emoji (◈ ⬡ ◎)." } },
            { name: "title",       type: "text",     required: true },
            { name: "description", type: "textarea", required: true },
          ],
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════
    // Slide 03 — Modules
    // ════════════════════════════════════════════════════════════════════
    {
      name: "slide03",
      label: "Slide 03 — Mastery Track / Modules",
      type: "group",
      fields: [
        { name: "headline", type: "text",     defaultValue: "THE MASTERY TRACK" },
        { name: "body",     type: "textarea", defaultValue: "Three core mastery tracks — from users to hardware to code." },
        {
          name: "modules",
          type: "array",
          minRows: 1,
          maxRows: 6,
          fields: [
            { name: "icon",        type: "text",     required: true, admin: { description: "Symbol/emoji (◐ ◑ ◒)." } },
            { name: "title",       type: "text",     required: true },
            { name: "description", type: "textarea", required: true },
          ],
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════
    // Slide 04 — Audience
    // ════════════════════════════════════════════════════════════════════
    {
      name: "slide04",
      label: "Slide 04 — Right Fit / Audience",
      type: "group",
      fields: [
        { name: "headline", type: "text",     defaultValue: "ARE YOU THE RIGHT FIT?" },
        { name: "body",     type: "textarea", defaultValue: "Built for builders at every stage." },
        {
          name: "audiences",
          type: "array",
          minRows: 1,
          maxRows: 8,
          fields: [
            { name: "icon",        type: "text",     required: true, admin: { description: "Emoji (🎓 ⚡ 🚀 ⚙️)." } },
            { name: "title",       type: "text",     required: true },
            { name: "description", type: "textarea", required: true },
          ],
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════
    // Slide 05 — Testimonials
    // ════════════════════════════════════════════════════════════════════
    {
      name: "slide05",
      label: "Slide 05 — Testimonials",
      type: "group",
      fields: [
        { name: "headline", type: "text",     defaultValue: "HEAR FROM OUR BUILDERS" },
        { name: "body",     type: "textarea", defaultValue: "Real builders. Real outcomes. Straight from the cohort." },
        {
          name: "testimonials",
          type: "array",
          minRows: 0,
          maxRows: 12,
          admin: { description: "Video testimonials. Upload .mp4 files and poster image." },
          fields: [
            {
              type: "row",
              fields: [
                { name: "name",  type: "text", required: true, admin: { width: "50%" } },
                { name: "batch", type: "text", required: true, admin: { width: "50%", placeholder: "Cohort 01 · 2025" } },
              ],
            },
            {
              name: "video",
              type: "upload",
              relationTo: "media",
              admin: { description: "Video file (.mp4 preferred). Upload to Media library first or here." },
            },
            {
              name: "poster",
              type: "upload",
              relationTo: "media",
              admin: { description: "Thumbnail image shown before the video plays." },
            },
          ],
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════
    // Slide 06 — Scholarships & Fellowships
    // ════════════════════════════════════════════════════════════════════
    {
      name: "slide06",
      label: "Slide 06 — Scholarships & Fellowships",
      type: "group",
      fields: [
        { name: "headline", type: "text",     defaultValue: "SCHOLARSHIPS & FELLOWSHIPS" },
        { name: "body",     type: "textarea", defaultValue: "Financial support to make the program accessible from day one." },

        // ── Tier 1 — Onboarding Scholarship ──
        {
          name: "onboarding",
          label: "Tier 1 — Onboarding Scholarship",
          type: "group",
          fields: [
            { name: "title",    type: "text",     defaultValue: "Onboarding Scholarship" },
            { name: "subtitle", type: "textarea", defaultValue: "GPA-based scholarship reducing your effective Program Fee · Base Fee: ₹1,25,000 + GST" },
            {
              name: "tiers",
              type: "array",
              minRows: 1,
              maxRows: 6,
              admin: { description: "Each GPA tier card." },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "criterion",        type: "text", required: true, admin: { width: "33%", placeholder: "GPA ≥ 8.0" } },
                    { name: "feeAfter",         type: "text", required: true, admin: { width: "33%", placeholder: "₹75,000" } },
                    { name: "scholarshipAmount",type: "text", required: true, admin: { width: "33%", placeholder: "₹50,000 Scholarship" } },
                  ],
                },
                {
                  name: "color",
                  type: "select",
                  defaultValue: "teal",
                  options: [
                    { label: "Teal",    value: "teal"    },
                    { label: "Magenta", value: "magenta" },
                    { label: "Gold",    value: "gold"    },
                  ],
                  admin: { description: "Accent color for this card." },
                },
              ],
            },
          ],
        },

        // ── Tier 2 — Product Development Fellowship ──
        {
          name: "fellowship",
          label: "Tier 2 — Product Development Fellowship",
          type: "group",
          fields: [
            { name: "title",    type: "text",     defaultValue: "CiPD Product Development Fellowship" },
            { name: "subtitle", type: "textarea", defaultValue: "Performance-based monthly stipend for regular & actively engaged participants · up to ₹1.5 Lakhs total" },
            {
              name: "stats",
              type: "array",
              minRows: 1,
              maxRows: 4,
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "label", type: "text", required: true, admin: { width: "33%", placeholder: "Monthly Stipend" } },
                    { name: "value", type: "text", required: true, admin: { width: "33%", placeholder: "₹15,000" } },
                    { name: "note",  type: "text", required: true, admin: { width: "33%", placeholder: "From month 3 onwards" } },
                  ],
                },
              ],
            },
            {
              name: "eligibilityNote",
              type: "textarea",
              defaultValue: "All regular and actively engaged participants. Stipend begins from the 3rd month and can extend up to 6 months post-program.",
            },
          ],
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════
    // Slide 07 — Grants & Incubation
    // ════════════════════════════════════════════════════════════════════
    {
      name: "slide07",
      label: "Slide 07 — Grants & Incubation",
      type: "group",
      fields: [
        { name: "headline",     type: "text",     defaultValue: "GRANTS & INCUBATION" },
        { name: "body",         type: "textarea", defaultValue: "For participants turning their product into a startup." },
        { name: "sectionTitle", type: "text",     defaultValue: "Startup Grants & Incubation" },
        { name: "sectionSubtitle", type: "text",  defaultValue: "Funding and incubation support for cohort startups" },
        {
          name: "grants",
          type: "array",
          minRows: 1,
          maxRows: 8,
          fields: [
            {
              type: "row",
              fields: [
                { name: "name",   type: "text", required: true, admin: { width: "60%", placeholder: "CiPD Seed Grant" } },
                { name: "amount", type: "text", required: true, admin: { width: "40%", placeholder: "Up to ₹2 L" } },
              ],
            },
            { name: "description", type: "textarea", required: true },
            {
              name: "color",
              type: "select",
              defaultValue: "gold",
              options: [
                { label: "Gold",    value: "gold"    },
                { label: "Teal",    value: "teal"    },
                { label: "Magenta", value: "magenta" },
              ],
            },
          ],
        },
      ],
    },

    // ════════════════════════════════════════════════════════════════════
    // Slide 08 — CTA / Reserve Your Seat
    // ════════════════════════════════════════════════════════════════════
    {
      name: "slide08",
      label: "Slide 08 — Reserve Your Seat (CTA)",
      type: "group",
      fields: [
        { name: "headline",         type: "text",     defaultValue: "RESERVE YOUR SEAT" },
        {
          type: "row",
          fields: [
            { name: "cohortLabel",  type: "text", defaultValue: "Next Cohort",       admin: { width: "50%" } },
            { name: "cohortDate",   type: "text", defaultValue: "TBA — 2026",        admin: { width: "50%" } },
          ],
        },
        { name: "limitedSeatsLabel", type: "text",    defaultValue: "Limited Seats" },
        {
          name: "deadlineNote",
          type: "textarea",
          defaultValue: "Each cohort is capped to ensure hands-on mentorship. Final Application Submission Deadline: 27 May 2026.",
          admin: { description: "Use **bold** for the deadline sentence on the public site." },
        },
        {
          name: "applyUrl",
          type: "text",
          required: true,
          defaultValue: "https://docs.google.com/forms/d/e/1FAIpQLScnTQdnzGalnaqckHoUXKlMnYAXiHdn2qpATLaJCVtRCjMCOQ/viewform",
          admin: { description: "URL the 'Apply Now' button opens." },
        },
      ],
    },
  ],
};
