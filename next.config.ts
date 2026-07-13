import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // прототип лежит рядом как статика-референс, в сборку не тянем
  outputFileTracingExcludes: { "*": ["./prototype/**"] },
};

export default nextConfig;
