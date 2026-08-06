// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      // add your real production image host(s) here too, e.g.:
      // { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

module.exports = nextConfig;