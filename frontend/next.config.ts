import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  generateBuildId: () => "build-" + Date.now(),
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("@prisma/client-runtime-utils");
    }
    return config;
  },
};

export default nextConfig;
