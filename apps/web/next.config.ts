import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@sleepywear/shared"],
  experimental: {
    staticGenerationRetryCount: 2,
    staticGenerationMaxConcurrency: 2,
    staticGenerationMinPagesPerWorker: 5,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sleepyweareg.com",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;