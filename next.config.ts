import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin workspace root to this project for accurate output file tracing in production builds
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
