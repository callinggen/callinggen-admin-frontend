import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/admin",
  allowedDevOrigins: ["192.168.1.36", "localhost:3000", "localhost:3001"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
