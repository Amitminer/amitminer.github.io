import type { NextConfig } from "next";

const isGithubPages =
  process.env.GITHUB_PAGES === "true" || process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  ...(isGithubPages && { output: "export" }),
  images: {
    unoptimized: isGithubPages,
  },
  reactCompiler: true,
};

export default nextConfig;
