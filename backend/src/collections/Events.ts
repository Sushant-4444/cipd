import type { CollectionConfig } from "payload";

const EVENT_TYPES = [
  { label: "Webinar",          value: "Webinar"          },
  { label: "Workshop",         value: "Workshop"         },
  { label: "Conference",       value: "Conference"       },
  { label: "Community Meetup", value: "Community Meetup" },
  { label: "Summit",           value: "Summit"           },
  { label: "Competition",      value: "Competition"      },
  { label: "Industry Visit",   value: "Industry Visit"   },
  { label: "Event",            value: "Event"            },
];

const STATUS_TAGS = [
  { label: "Upcoming", value: "Upcoming" },
  { label: "Featured", value: "Featured" },
  { label: "Past",     value: "Past"     },
];

export const Events: CollectionConfig = {
  slug: "events",
  labels: {
    singular: "Event",
    plural:   "Events",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "type", "date", "tag", "featured"],
    description:
      "One row per event. Set Featured = true on exactly one event — it appears at the top of the Events page. Upcoming/Past status drives which list it shows up in.",
    listSearchableFields: ["title", "type", "location", "summary"],
  },
  access: {
    // Public can read events; only logged-in admins can write
    read:   () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    // ── Basics ──────────────────────────────────────────────────────────
    {
      type: "row",
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          admin: { width: "70%", description: "Shown on cards and the detail page hero." },
        },
        {
          name: "type",
          type: "select",
          required: true,
          options: EVENT_TYPES,
          admin: { width: "30%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "tag",
          type: "select",
          required: true,
          defaultValue: "Upcoming",
          options: STATUS_TAGS,
          admin: { width: "33%", description: "Upcoming / Featured / Past — drives which list this appears in." },
        },
        {
          name: "featured",
          type: "checkbox",
          defaultValue: false,
          admin: { width: "33%", description: "Set this for exactly ONE event — it becomes the hero." },
        },
        {
          name: "displayOrder",
          type: "number",
          admin: { width: "33%", description: "Optional. Lower numbers show first. Leave blank to sort by date." },
        },
      ],
    },

    // ── When & where ────────────────────────────────────────────────────
    {
      type: "row",
      fields: [
        {
          name: "date",
          type: "text",
          required: true,
          admin: { width: "33%", placeholder: "15 April 2026", description: "Human-readable date string." },
        },
        {
          name: "time",
          type: "text",
          required: true,
          admin: { width: "33%", placeholder: "6:30 PM – 7:30 PM IST" },
        },
        {
          name: "location",
          type: "text",
          required: true,
          admin: { width: "33%", placeholder: "Online · Mumbai · Hybrid · IIIT Delhi + Online" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "format",
          type: "text",
          admin: { width: "60%", placeholder: "Live Webinar (Zoom) · In-Person Workshop · Hybrid (IIIT Delhi + Online)", description: "Longer label for the detail page." },
        },
        {
          name: "isoDate",
          type: "date",
          admin: {
            width: "40%",
            description: "Optional machine-readable date — used for sorting and calendar features.",
            date: { pickerAppearance: "dayOnly" },
          },
        },
      ],
    },

    // ── Copy ────────────────────────────────────────────────────────────
    {
      name: "summary",
      type: "textarea",
      required: true,
      admin: { description: "1–2 lines shown on event cards." },
    },
    {
      name: "fullDescription",
      type: "textarea",
      admin: { description: "Longer paragraph shown on the detail page 'About This Event' section." },
    },
    {
      name: "topics",
      type: "array",
      labels: { singular: "Topic", plural: "Topics" },
      admin: { description: "Tags shown as pills on the detail page." },
      fields: [{ name: "value", type: "text", required: true }],
    },
    {
      name: "prerequisites",
      type: "textarea",
      admin: { description: "Eligibility / requirements callout. Leave blank if none." },
    },

    // ── Capacity (upcoming only) ────────────────────────────────────────
    {
      type: "row",
      fields: [
        {
          name: "capacity",
          type: "number",
          admin: { width: "50%", description: "Total seats. Upcoming events only." },
        },
        {
          name: "registered",
          type: "number",
          admin: { width: "50%", description: "Registered count. Drives the capacity bar." },
        },
      ],
    },

    // ── Agenda ──────────────────────────────────────────────────────────
    {
      name: "agenda",
      type: "array",
      labels: { singular: "Agenda Item", plural: "Agenda Items" },
      admin: {
        description: "Schedule for the event. One row per session/break.",
        initCollapsed: true,
      },
      fields: [
        {
          type: "row",
          fields: [
            { name: "time",    type: "text", required: true, admin: { width: "25%", placeholder: "6:30 PM" } },
            { name: "title",   type: "text", required: true, admin: { width: "50%", placeholder: "Welcome & Opening" } },
            { name: "speaker", type: "text",                 admin: { width: "25%", placeholder: "CiPD Team" } },
          ],
        },
      ],
    },

    // ── Speakers ────────────────────────────────────────────────────────
    {
      name: "speakers",
      type: "array",
      labels: { singular: "Speaker", plural: "Speakers" },
      admin: {
        description: "Featured speakers shown in the 'Who You'll Hear From' section.",
        initCollapsed: true,
      },
      fields: [
        {
          type: "row",
          fields: [
            { name: "name", type: "text", required: true, admin: { width: "40%" } },
            { name: "role", type: "text", required: true, admin: { width: "60%", placeholder: "Head of People Analytics, Zeta Corp" } },
          ],
        },
        {
          name: "photo",
          type: "upload",
          relationTo: "media",
          required: false,
          admin: { description: "Optional. If blank, the speaker's initials are shown in a gradient circle." },
        },
      ],
    },

    // ── Past-event-only fields ──────────────────────────────────────────
    {
      name: "pastAction",
      type: "select",
      admin: {
        description: "PAST events only. Label of the action link on past-event cards.",
        condition: (data) => data?.tag === "Past",
      },
      options: [
        { label: "View Highlights",  value: "View Highlights"  },
        { label: "Watch Recording",  value: "Watch Recording"  },
        { label: "Read Recap",       value: "Read Recap"       },
      ],
    },
    {
      name: "highlights",
      type: "array",
      labels: { singular: "Highlight", plural: "Highlights" },
      admin: {
        description: "PAST events only. Key takeaways shown with checkmarks.",
        condition: (data) => data?.tag === "Past",
        initCollapsed: true,
      },
      fields: [{ name: "value", type: "textarea", required: true }],
    },
    {
      type: "row",
      admin: { condition: (data) => data?.tag === "Past" },
      fields: [
        {
          name: "recordingUrl",
          type: "text",
          admin: { width: "50%", placeholder: "https://… (YouTube, Vimeo, etc.)" },
        },
        {
          name: "recapUrl",
          type: "text",
          admin: { width: "50%", placeholder: "https://… (blog post, PDF, etc.)" },
        },
      ],
    },

    // ── Photo gallery ───────────────────────────────────────────────────
    {
      name: "images",
      type: "array",
      labels: { singular: "Photo", plural: "Photos" },
      admin: {
        description: "Event photos. First photo is used as the hero banner on the detail page. Drag to reorder.",
        initCollapsed: false,
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },

    // ── Internal notes ──────────────────────────────────────────────────
    {
      name: "internalNotes",
      type: "textarea",
      admin: {
        description: "Internal notes (sponsors, livestream URLs, etc.). NOT shown on the public site.",
        position: "sidebar",
      },
    },
  ],
  // No beforeChange hook — the editor's values for `featured` and `tag` are
  // saved as-is. If you set Featured = true on a past event, that's intentional
  // (e.g., highlighting a recent successful event as the hero card).
};
