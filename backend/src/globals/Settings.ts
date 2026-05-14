import type { GlobalConfig } from "payload";

/**
 * Site-wide settings: things that appear on multiple pages or in the
 * navbar / floating CTA. Editing these in one place updates the whole site.
 */
export const Settings: GlobalConfig = {
  slug: "settings",
  label: "Global Settings",
  admin: {
    description:
      "Site-wide values: Apply Now URL, application deadline, navbar links, hero copy. Edits here apply everywhere on the public site.",
    group: "Site",
  },
  access: {
    read:   () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    // ── Application ──────────────────────────────────────────────────────
    {
      label: "Application",
      type: "collapsible",
      admin: { initCollapsed: false },
      fields: [
        {
          name: "applyUrl",
          type: "text",
          required: true,
          defaultValue: "https://docs.google.com/forms/d/e/1FAIpQLScnTQdnzGalnaqckHoUXKlMnYAXiHdn2qpATLaJCVtRCjMCOQ/viewform",
          admin: { description: "Where the 'Apply Now' button takes users (navbar + floating CTA + iPD-CP CTA)." },
        },
        {
          name: "applicationDeadline",
          type: "date",
          required: true,
          defaultValue: "2026-05-27T23:59:00.000Z",
          admin: {
            description: "Drives the countdown in the floating CTA bar.",
            date: { pickerAppearance: "dayAndTime" },
          },
        },
        {
          name: "deadlineLabel",
          type: "text",
          defaultValue: "Final Application Submission Deadline",
          admin: { description: "Eyebrow text above the date in the CTA." },
        },
      ],
    },

    // ── Hero (homepage video intro) ──────────────────────────────────────
    {
      label: "Hero / Landing",
      type: "collapsible",
      admin: { initCollapsed: true },
      fields: [
        { name: "heroTagline",  type: "text",     admin: { description: "Optional tagline that appears over the hero video." } },
        { name: "heroSubcopy",  type: "textarea", admin: { description: "Optional secondary line under the tagline." } },
      ],
    },

    // ── Navbar ───────────────────────────────────────────────────────────
    {
      label: "Navbar",
      type: "collapsible",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "navLinks",
          type: "array",
          minRows: 1,
          maxRows: 8,
          defaultValue: [
            { label: "Home",   phase: "hero"   },
            { label: "About",  phase: "story"  },
            { label: "iPD-CP", phase: "ipdcp"  },
            { label: "Events", phase: "events" },
          ],
          admin: { description: "Links shown in the top navigation. 'phase' must match an internal section name." },
          fields: [
            {
              type: "row",
              fields: [
                { name: "label", type: "text", required: true, admin: { width: "50%" } },
                {
                  name: "phase",
                  type: "select",
                  required: true,
                  admin: { width: "50%" },
                  options: [
                    { label: "Home (hero)",   value: "hero"   },
                    { label: "About (story)", value: "story"  },
                    { label: "iPD-CP",        value: "ipdcp"  },
                    { label: "Events",        value: "events" },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "ctaLabel",
          type: "text",
          defaultValue: "Apply Now",
          admin: { description: "Label of the navbar CTA button." },
        },
      ],
    },

    // ── Floating CTA bar ─────────────────────────────────────────────────
    {
      label: "Floating CTA Bar",
      type: "collapsible",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "fctaBrand",
          type: "text",
          defaultValue: "iPD-CP",
          admin: { description: "Brand text shown on the left of the floating bar." },
        },
        {
          name: "fctaSubtext",
          type: "text",
          defaultValue: "IIIT Delhi · 24-Week Full-Time Program",
          admin: { description: "Tagline shown under the brand." },
        },
        {
          name: "fctaButtonLabel",
          type: "text",
          defaultValue: "Apply Now",
        },
      ],
    },

    // ── Footer / contact ─────────────────────────────────────────────────
    {
      label: "Footer / Contact",
      type: "collapsible",
      admin: { initCollapsed: true },
      fields: [
        { name: "contactEmail", type: "email",    admin: { description: "Public contact email (e.g., for event inquiries)." } },
        { name: "contactPhone", type: "text",     admin: { description: "Optional contact phone." } },
        {
          name: "address",
          type: "textarea",
          defaultValue: "IIIT Delhi · Okhla Industrial Estate · Phase III · New Delhi 110020",
        },
        {
          name: "socialLinks",
          type: "array",
          maxRows: 8,
          admin: { description: "Optional social media links." },
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "platform",
                  type: "select",
                  required: true,
                  admin: { width: "40%" },
                  options: [
                    { label: "LinkedIn",  value: "linkedin"  },
                    { label: "Twitter/X", value: "twitter"   },
                    { label: "Instagram", value: "instagram" },
                    { label: "YouTube",   value: "youtube"   },
                    { label: "GitHub",    value: "github"    },
                  ],
                },
                { name: "url", type: "text", required: true, admin: { width: "60%" } },
              ],
            },
          ],
        },
      ],
    },

    // ── Events page copy ─────────────────────────────────────────────────
    {
      label: "Events Page Copy",
      type: "collapsible",
      admin: { initCollapsed: true },
      fields: [
        { name: "eventsKicker",   type: "text",     defaultValue: "CiPD · IIIT Delhi" },
        { name: "eventsHeadline", type: "text",     defaultValue: "Events" },
        { name: "eventsLead",     type: "textarea", defaultValue: "Where ideas, industry, and innovation converge." },
        { name: "eventsBody",     type: "textarea", defaultValue: "Explore webinars, workshops, conferences, and showcases hosted by CiPD and partners. Join conversations that turn research, practice, and collaboration into real outcomes." },
        { name: "subscribeBody",  type: "textarea", defaultValue: "Get monthly updates on upcoming events, early-bird registrations, and speaker announcements." },
        {
          name: "eventTestimonials",
          label: "Event Page Testimonials",
          type: "array",
          minRows: 0,
          maxRows: 8,
          defaultValue: [
            { quote: "The sessions were practical and immediately useful for our HR strategy.", by: "Senior HRBP, Tech Firm" },
            { quote: "Great speakers and strong networking opportunities.", by: "Learning & Development Lead" },
          ],
          admin: { description: "Quote cards shown in the 'What attendees say' section on the Events page." },
          fields: [
            { name: "quote", type: "textarea", required: true },
            { name: "by",    type: "text",     required: true, admin: { description: "Attribution line — e.g., 'Senior HRBP, Tech Firm'." } },
          ],
        },
      ],
    },
  ],
};
