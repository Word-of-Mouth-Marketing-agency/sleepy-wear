import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@sleepywear/shared"],
  experimental: {
    staticGenerationRetryCount: 2,
    staticGenerationMaxConcurrency: 2,
    staticGenerationMinPagesPerWorker: 5,
  },
};

export default nextConfig;
