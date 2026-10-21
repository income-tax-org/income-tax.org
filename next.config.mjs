/** @type {import('next').NextConfig} */
import NextPWA from "next-pwa";

const withPWA = NextPWA({
  dest: "out",
  disable: process.env.NODE_ENV === "development", // Disable PWA only in development
});

const nextConfig = withPWA({
  output: "export",
  // Keep `next build`'s lint pass in step with the `lint` script; the
  // default set omits scripts/ and tests/.
  eslint: {
    dirs: ["src", "scripts", "tests", "functions"],
  },
  images: {
    unoptimized: true,
  },
  // Ensure trailing slashes are handled correctly
  trailingSlash: true,
  // Optimize CSS loading
  experimental: {
    optimizeCss: true,
  },
  // Compress output for faster loading
  compress: true,
});

export default nextConfig;
