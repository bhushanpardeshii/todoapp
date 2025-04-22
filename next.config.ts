import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CRUD_API_URL: process.env.NEXT_PUBLIC_CRUD_API_URL,
    NEXT_PUBLIC_CRUD_API_KEY: process.env.NEXT_PUBLIC_CRUD_API_KEY,
  },
};

export default nextConfig;
