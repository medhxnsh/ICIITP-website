import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/**
 * Common security headers applied to every response. Adjust CSP carefully —
 * Firebase Storage + Google Forms + Tally embeds may require additional sources.
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// Strip /api/v1 suffix if present so we get just the host:port
const BACKEND = (process.env.API_URL ?? "http://localhost:8080/api/v1")
  .replace(/\/api\/v1\/?$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  webpack(config) {
    config.parallelism = 2;
    // Prevent webpack from watching .next/ — changes there triggered by webpack
    // itself would otherwise cause a feedback loop with the TS incremental compiler.
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        "**/node_modules/**",
        "**/.next/**",
        "**/content/**",
      ],
    };
    return config;
  },
  async rewrites() {
    return [
      // Proxy /uploads/** to Spring Boot so uploaded images and PDFs load in dev.
      // In production, NGINX or a reverse proxy handles this directly.
      { source: "/uploads/:path*", destination: `${BACKEND}/uploads/:path*` },
    ];
  },
  images: {
    qualities: [75, 80, 85, 88, 90],
    remotePatterns: [
      // CMS admins can paste images from any HTTPS source.
      { protocol: "https", hostname: "**" },
      // Spring Boot serves uploads on port 8080 in local dev.
      { protocol: "http", hostname: "localhost", port: "8080" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
    ];
  },
};

export default withNextIntl(nextConfig);
