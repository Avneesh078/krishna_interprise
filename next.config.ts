import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    serverActions: {
      // Admin product photos are uploaded through a Server Action (up to 8 photos of 8 MB).
      bodySizeLimit: "70mb",
    },
  },
  images: {
    // Only built-in catalogue photos and admin uploads can be optimized.
    localPatterns: [
      { pathname: "/catalog/**", search: "" },
      { pathname: "/media/**", search: "" },
    ],
  },
  // Lets phones on the home Wi-Fi (e.g. 192.168.1.22) use the dev server at the PC's network
  // address. Without it the page loads but no button works. Development only.
  allowedDevOrigins: ["192.168.1.*"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
