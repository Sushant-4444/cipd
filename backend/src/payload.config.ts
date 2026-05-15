import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";

import { Blogs } from "./collections/Blogs";
import { Events } from "./collections/Events";
import { Media } from "./collections/Media";
import { Users } from "./collections/Users";
import { IpdcpPage } from "./globals/IpdcpPage";
import { Settings } from "./globals/Settings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const frontendOrigins = (process.env.PAYLOAD_PUBLIC_FRONTEND_URLS || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// The admin UI lives on the backend's own origin and must be in CORS/CSRF
// or its write requests get rejected even when the user is logged in.
const adminOrigin = process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3001";
const allowedOrigins = Array.from(new Set([adminOrigin, ...frontendOrigins]));

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " — CiPD CMS",
    },
  },
  collections: [Events, Blogs, Media, Users],
  globals: [IpdcpPage, Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "dev-secret-change-me",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || "file:./cms.db",
    },
  }),
  sharp,
  cors: allowedOrigins,
  csrf: allowedOrigins,
  upload: {
    limits: {
      fileSize: 15 * 1024 * 1024, // 15 MB
    },
  },
});
