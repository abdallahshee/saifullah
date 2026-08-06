// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "loremflickr.com",
      },
      // add your real production image host(s) here too, e.g.:
      // { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

module.exports = nextConfig;