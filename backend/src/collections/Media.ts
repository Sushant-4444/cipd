import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: "Image / File",
    plural:   "Media",
  },
  admin: {
    description:
      "All event photos, speaker photos, and any other uploads. Files are stored on disk in backend/media/. Make sure to back up this folder.",
    useAsTitle: "filename",
  },
  access: {
    read:   () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*"],
    imageSizes: [
      // Small thumbnail used in event card image carousels
      { name: "thumbnail",  width: 480,  height: 270,  position: "centre" },
      // Card-size image
      { name: "card",       width: 800,  height: 480,  position: "centre" },
      // Detail page hero banner
      { name: "banner",     width: 1600, height: 700,  position: "centre" },
      // Speaker avatars
      { name: "avatar",     width: 200,  height: 200,  position: "centre" },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: false,
      admin: { description: "Alt text for accessibility. Describe what's in the photo." },
    },
    {
      name: "caption",
      type: "text",
      admin: { description: "Optional caption shown under the photo in galleries." },
    },
  ],
};
