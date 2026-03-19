import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90, 95,85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "*.example.com",
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "example.com",
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "cdn.example.com",
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;