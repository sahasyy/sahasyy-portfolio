import type { NextConfig } from "next";

const MONTH_SECONDS = 60 * 60 * 24 * 30;
const YEAR_SECONDS = 60 * 60 * 24 * 365;

const nextConfig: NextConfig = {
  compress: true,
  async headers() {
    return [
      {
        source: "/:path*{.jpg,.jpeg,.png,.webp,.avif,.gif,.svg,.ico}",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${MONTH_SECONDS}, stale-while-revalidate=${YEAR_SECONDS}`,
          },
        ],
      },
      {
        source: "/:path*{.woff,.woff2,.ttf,.otf,.eot}",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${MONTH_SECONDS}, stale-while-revalidate=${YEAR_SECONDS}`,
          },
        ],
      },
      {
        source: "/:path*{.pdf}",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${MONTH_SECONDS}, stale-while-revalidate=${YEAR_SECONDS}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
