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
  async headers() {
    return [
      {
        source: "/brand/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/favicon.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
