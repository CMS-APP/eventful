import type { NextConfig } from "next";

const EVENTFUL_WEBSITE = "https://www.eventfulapp.com";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/app", destination: "/", permanent: true },
      { source: "/app/:path*", destination: "/:path*", permanent: true },
      { source: "/features", destination: EVENTFUL_WEBSITE, permanent: true },
      { source: "/contact", destination: EVENTFUL_WEBSITE, permanent: true },
      { source: "/blog", destination: EVENTFUL_WEBSITE, permanent: true },
      { source: "/blog/:path*", destination: EVENTFUL_WEBSITE, permanent: true },
      { source: "/about", destination: EVENTFUL_WEBSITE, permanent: true },
      { source: "/about/faq", destination: EVENTFUL_WEBSITE, permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
