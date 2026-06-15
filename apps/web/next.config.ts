import path from "node:path";
import { config } from "dotenv";
import type { NextConfig } from "next";

config({ path: path.resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  transpilePackages: ["@tend/db", "@tend/domain"],
};

export default nextConfig;
