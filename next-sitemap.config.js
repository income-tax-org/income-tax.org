const fs = require("fs");
const path = require("path");

const SITE_URL = "https://income-tax.org";
const OUT_DIR = path.join(__dirname, "out");

// Newest data year, read from src/data rather than the calendar so priorities
// don't shift on January 1st before the new year's data exists.
const LATEST_YEAR = Math.max(
  ...fs
    .readdirSync(path.join(__dirname, "src/data"))
    .filter((name) => /^\d{4}$/.test(name))
    .map(Number),
);

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  output: "export",
  outDir: "out",
  // next.config.mjs sets trailingSlash: true, so URLs without one redirect.
  trailingSlash: true,
  priority: 0.5,
  changefreq: "yearly",
  // lastmod would be the build time on every URL, which tells crawlers that
  // all of them changed on every deploy, so they learn to ignore it.
  autoLastmod: false,
  // /og-image/* exists only so generate-og-images.ts has something to
  // screenshot; it renders null outside development. Left in, it was a third
  // of the submitted sitemap pointing at blank pages.
  exclude: ["/og-image", "/og-image/*"],
  transform: async (config, exportPath) => {
    // Static export paths come from out/**/index.html, so they arrive with a
    // trailing slash ("/2025/"). Strip it; trailingSlash adds it back to loc.
    const pagePath =
      exportPath.length > 1 ? exportPath.replace(/\/$/, "") : exportPath;
    if (!isIndexableCanonical(pagePath)) {
      return null;
    }

    return {
      loc: pagePath,
      changefreq: config.changefreq,
      priority: Math.round(getPriority(pagePath, config.priority) * 10) / 10,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_next/", "/og-image"],
      },
    ],
  },
};

/**
 * Whether the built page names itself as canonical and allows indexing.
 *
 * A sitemap should list only canonical URLs. Reading each page's own
 * <link rel="canonical"> keeps this in step with get-metadata.ts, and drops
 * the newest year's /{year} duplicates of the route roots, the reversed
 * orderings of compare pairs, and noindex pages such as /404.
 */
function isIndexableCanonical(pagePath) {
  const html = readBuiltPage(pagePath);
  if (!html) {
    return true;
  }
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) {
    return false;
  }
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  if (!canonical) {
    return true;
  }
  const expected = `${SITE_URL}${pagePath === "/" ? "" : pagePath}/`;
  return canonical === expected;
}

function readBuiltPage(pagePath) {
  const candidates =
    pagePath === "/"
      ? [path.join(OUT_DIR, "index.html")]
      : [
          path.join(OUT_DIR, pagePath, "index.html"),
          path.join(OUT_DIR, `${pagePath}.html`),
        ];
  for (const file of candidates) {
    if (fs.existsSync(file)) {
      // The <head> is near the top; there's no need to read whole pages.
      const fd = fs.openSync(file, "r");
      try {
        const buffer = Buffer.alloc(32 * 1024);
        const bytes = fs.readSync(fd, buffer, 0, buffer.length, 0);
        return buffer.toString("utf8", 0, bytes);
      } finally {
        fs.closeSync(fd);
      }
    }
  }
  return null;
}

function getPriority(pagePath, defaultPriority) {
  const splitPath = pagePath.split("/");

  if (pagePath === "/") {
    return 1;
  }
  if (pagePath === "/tax-tables") {
    return 0.9;
  }
  // Tax tables
  if (pagePath.startsWith("/tax-tables")) {
    const year = parseInt(splitPath[2], 10);
    if (!isNaN(year)) {
      splitPath.shift();
      return determinePriorityBasedOnYearPath(splitPath, year, 0.6);
    }
    return defaultPriority;
  }
  // Calculator
  const year = parseInt(splitPath[1], 10);
  if (!isNaN(year)) {
    return determinePriorityBasedOnYearPath(splitPath, year);
  }
  return defaultPriority;
}

function determinePriorityBasedOnYearPath(
  splitPath,
  year,
  defaultPriority = 0.8,
) {
  let priority = 0;

  // The newest data year gets extra priority
  if (year === LATEST_YEAR) {
    priority = defaultPriority;
    // Cities get extra priority for the newest year
    if (splitPath.length > 3) {
      priority += 0.1;
    }
    // Previous year get less priority, subsequent previous years get even less
  } else if (year === LATEST_YEAR - 1) {
    priority = defaultPriority - 0.2;
    // Cities get extra priority for only the previous year
    if (splitPath.length > 3) {
      priority += 0.1;
    }
  } else {
    const yearsAgo = LATEST_YEAR - year;
    priority = defaultPriority - 0.2 - yearsAgo * 0.1;
    if (priority < 0.1) priority = 0.1;
  }

  return priority;
}
