import type { NextConfig } from "next";

const isGHPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isGHPages && {
    output: "export",
    basePath: "/Personal-Finance",
  }),
  images: { unoptimized: true },
};

export default nextConfig;