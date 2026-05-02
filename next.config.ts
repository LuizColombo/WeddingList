import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  images: {
    remotePatterns: [],
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
