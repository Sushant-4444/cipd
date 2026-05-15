import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

const CATEGORIES = [
  { label: "Insight",      value: "Insight"      },
  { label: "Tutorial",     value: "Tutorial"     },
  { label: "Announcement", value: "Announcement" },
  { label: "Case Study",   value: "Case Study"   },
  { label: "Interview",    value: "Interview"    },
  { label: "Research",     value: "Research"     },
  { label: "Industry",     value: "Industry"     },
];

const STATUS_TAGS = [
  { label: "Draft",     value: "draft"     },
  { label: "Published", value: "published" },
  { label: "Archived",  value: "archived"  },
];

// Slug helper — used in beforeChange to auto-populate slug from title when blank.
function slugify(s: string): string {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Reading-time estimate — average 220 words/minute over the rich-text body.
function countWordsInLexical(node: any): number {
  if (!node) return 0;
  if (typeof node.text === "string") {
    return node.text.trim().split(/\s+/).filter(Boolean).length;
  }
  if (Array.isArray(node.children)) {
    return node.children.reduce((sum: number, c: any) => sum + countWordsInLexical(c), 0);
  }
  if (Array.isArray(node.root?.children)) {
    return countWordsInLexical(node.root);
  }
  return 0;
}

export const Blogs: CollectionConfig = {
  slug: "blogs",
  labels: {
    singular: "Blog Post",
    plural:   "Blog Posts",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "author", "category", "status", "publishedDate"],
    description:
      "Long-form blog content. Set Status = Published to make a post visible on the public site. Draft posts stay hidden.",
    listSearchableFields: ["title", "author", "excerpt", "tags"],
  },
  access: {
    // Only published posts are visible to anonymous readers; admins see all.
    read: ({ req }) => {
      if (req.user) return true;
      return { status: { equals: "published" } };
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    // ── Basics ──────────────────────────────────────────────────────────
    {
      type: "row",
      fields: [
        { name: "title", type: "text", required: true, admin: { width: "70%" } },
        {
          name: "category",
          type: "select",
          required: true,
          defaultValue: "Insight",
          options: CATEGORIES,
          admin: { width: "30%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "slug",
          type: "text",
          admin: {
            width: "60%",
            description: "URL-friendly identifier. Leave blank to auto-derive from the title.",
          },
        },
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "draft",
          options: STATUS_TAGS,
          admin: { width: "20%" },
        },
        {
          name: "featured",
          type: "checkbox",
          defaultValue: false,
          admin: { width: "20%", description: "Set on ONE post — it becomes the hero on the blog index." },
        },
      ],
    },

    // ── Author ──────────────────────────────────────────────────────────
    {
      label: "Author",
      type: "collapsible",
      admin: { initCollapsed: false },
      fields: [
        {
          type: "row",
          fields: [
            { name: "author",     type: "text", required: true, admin: { width: "50%", placeholder: "Dr. Ananya Rao" } },
            { name: "authorRole", type: "text",                 admin: { width: "50%", placeholder: "Head of People Analytics, CiPD" } },
          ],
        },
        {
          name: "authorPhoto",
          type: "upload",
          relationTo: "media",
          admin: { description: "Optional. If blank, the author's initials are shown in a circle." },
        },
      ],
    },

    // ── Dates ───────────────────────────────────────────────────────────
    {
      type: "row",
      fields: [
        {
          name: "publishedDate",
          type: "date",
          required: true,
          admin: {
            width: "50%",
            date: { pickerAppearance: "dayOnly" },
            description: "Used for sorting. Date shown on the public site.",
          },
        },
        {
          name: "readingTimeMinutes",
          type: "number",
          admin: { width: "50%", description: "Auto-estimated from body length on save. Override if you want." },
        },
      ],
    },

    // ── Card content (used on the blog index grid) ──────────────────────
    {
      name: "excerpt",
      type: "textarea",
      required: true,
      maxLength: 280,
      admin: { description: "1–2 lines shown on blog cards and used as a meta description." },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      admin: { description: "Featured image used as the card thumbnail and detail-page banner." },
    },

    // ── Body (long-form rich text) ──────────────────────────────────────
    {
      name: "body",
      label: "Body",
      type: "richText",
      editor: lexicalEditor(),
      admin: { description: "The article itself. Headings, paragraphs, lists, images inline, quotes, links." },
    },

    // ── Tags ────────────────────────────────────────────────────────────
    {
      name: "tags",
      type: "array",
      labels: { singular: "Tag", plural: "Tags" },
      admin: { description: "Free-text tags shown as pills on the detail page." },
      fields: [{ name: "value", type: "text", required: true }],
    },

    // ── Gallery (optional secondary images) ─────────────────────────────
    {
      name: "gallery",
      type: "array",
      labels: { singular: "Photo", plural: "Photos" },
      admin: { description: "Optional photo gallery on the detail page, after the body.", initCollapsed: true },
      fields: [
        {
          type: "row",
          fields: [
            { name: "image",   type: "upload", relationTo: "media", required: true, admin: { width: "50%" } },
            { name: "caption", type: "text",                                         admin: { width: "50%" } },
          ],
        },
      ],
    },

    // ── Related ─────────────────────────────────────────────────────────
    {
      name: "relatedPosts",
      type: "relationship",
      relationTo: "blogs",
      hasMany: true,
      maxRows: 4,
      admin: {
        description: "Optional. Other posts shown at the bottom of this post's detail page.",
        position: "sidebar",
      },
    },

    // ── Internal ────────────────────────────────────────────────────────
    {
      name: "internalNotes",
      type: "textarea",
      admin: {
        description: "Editor-only notes. Not shown publicly.",
        position: "sidebar",
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data || typeof data !== "object") return data;

        // Auto-fill slug from title if blank
        if (!data.slug && data.title) {
          data.slug = slugify(data.title);
        } else if (data.slug) {
          data.slug = slugify(data.slug);
        }

        // Auto-estimate reading time from body word count if not set
        if (!data.readingTimeMinutes && data.body) {
          const words = countWordsInLexical(data.body);
          data.readingTimeMinutes = Math.max(1, Math.round(words / 220));
        }

        return data;
      },
    ],
  },
};
