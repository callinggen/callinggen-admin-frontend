import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["192.168.1.36", "localhost:3000", "localhost:3001", "stagingg.callinggen.in", "admin.callinggen.in"],
};

export default nextConfig;
