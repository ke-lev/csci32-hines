import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'i.scdn.co',
        pathname: '/image/**',
        protocol: 'https',
      },
    ],
  },
};

export default nextConfig;
