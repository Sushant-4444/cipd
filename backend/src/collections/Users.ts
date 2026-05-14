import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "Admin User",
    plural:   "Admin Users",
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email", "createdAt"],
    description:
      "People who can log in to the CMS. Create the first user when you visit /admin for the first time.",
  },
  auth: {
    tokenExpiration: 60 * 60 * 8, // 8-hour sessions
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // 10-minute lockout after 5 failed logins
  },
  access: {
    // Logged-in users can manage other users (v1 — single shared admin scope)
    read:   ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: { description: "Display name shown in the admin UI." },
    },
  ],
};
