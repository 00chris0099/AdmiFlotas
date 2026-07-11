import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("@prisma/client-runtime-utils");
    }
    return config;
  },
};

export default nextConfig;
