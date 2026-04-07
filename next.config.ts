import type { NextConfig } from "next";

const isGHPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: isGHPages ? "/Personal-Finance" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
