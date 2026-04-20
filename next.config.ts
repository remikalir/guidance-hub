import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_PROTOTYPE_MODE:
      process.env.NODE_ENV === "development" || process.env.PROTOTYPE_MODE === "true"
        ? "true"
        : "false",
  },
};

export default nextConfig;
