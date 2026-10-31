/** @type {import('next').NextConfig} */
import NextPWA from "next-pwa";

const withPWA = NextPWA({
  // Written to public/, which the export copies into out/. Written straight to
  // out/, sw.js was deleted when the export cleared that directory, so
  // production never had one.
  dest: "public",
  // next-pwa injects its registration into the Pages Router entry, which App
  // Router pages never load; src/hooks/use-service-worker.ts registers it.
  register: false,
  disable: process.env.NODE_ENV === "development", // Disable PWA only in development
  // Not published by the export. One missing URL fails the whole install.
  buildExcludes: [/app-build-manifest\.json$/],
  // Keep the ~33MB of Open Graph images and the Cloudflare config files out of
  // the precache; a visitor needs none of them offline.
  publicExcludes: [
    "!noprecache/**/*",
    "!og-images/**/*",
    "!og-image.png",
    "!mstile-*.png",
    "!browserconfig.xml",
    "!_headers",
    "!_routes.json",
  ],
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
