import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://res.cloudinary.com https://img.youtube.com https://vumbnail.com https://i.ytimg.com https://*.vimeocdn.com; connect-src 'self' https://api.cloudinary.com https://res.cloudinary.com; frame-src 'self' https://www.youtube.com https://player.vimeo.com https://www.dailymotion.com https://player.dailymotion.com https://www.tiktok.com https://www.facebook.com https://www.instagram.com https://player.bilibili.com https://embed.nicovideo.jp; media-src 'self' blob: https://res.cloudinary.com; worker-src 'self' blob:;",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
