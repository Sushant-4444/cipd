import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip ESLint/TS errors during build in dev — Payload generates types at runtime
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    reactCompiler: false,
  },
};

export default withPayload(nextConfig);
