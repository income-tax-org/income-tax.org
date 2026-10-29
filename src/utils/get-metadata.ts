import {
  CITY_TAXES,
  COMPARE,
  DEVELOPERS,
  DISCLAIMER,
  INCOME_TAX_CALCULATOR,
  SUPPORT,
  TAX_TABLES,
} from "@/constants/pages";
import type { Metadata } from "next";
import { snakeToTitleCase } from "./string-utils";
import { LATEST_YEAR } from "@/data-loaders/registry";

const defaultUrl = "https://income-tax.org";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || defaultUrl),
  creator: "Evan Bonsignori",
  authors: [{ name: "Evan Bonsignori", url: "https://evan.bio" }],
  applicationName: "Income Tax Calculator",
  keywords: [
    "Income Tax",
    "City",
    "City Income Tax",
    "US Income Tax",
    "State Income Tax",
    "Take Home Pay",
  ],
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16" },
      { url: "/favicon-32x32.png", sizes: "32x32" },
      {
        url: "/safari-pinned-tab.svg",
        color: "#5bbad5",
        rel: "mask-icon",
      },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    title: "Income Tax Calculator",
    statusBarStyle: "default",
    startupImage: "/apple_touch_icon.png",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
};

const defaultOpenGraph = {
  title: "Income Tax Calculator",
  description:
    "Calculate your take home pay after federal, state, and city income taxes.",
  url: defaultUrl,
  siteName: "Income Tax Calculator",
  locale: "en_US",
  type: "website",
  images: "/og-image.png",
};

// The route each page's canonical URL is built from. Without this, pages that
// take no year param fall back to the site root and tell search engines the
// homepage supersedes them.
const PAGE_ROUTES: Record<string, string> = {
  [INCOME_TAX_CALCULATOR.name]: "",
  [TAX_TABLES.name]: TAX_TABLES.route,
  [SUPPORT.name]: SUPPORT.route,
  [CITY_TAXES.name]: CITY_TAXES.route,
  [COMPARE.name]: COMPARE.route,
  [DISCLAIMER.name]: DISCLAIMER.route,
  [DEVELOPERS.name]: DEVELOPERS.route,
};

/**
 * Canonical URL for a page, built from that page's own route.
 *
 * The newest data year with no state or city is served at the route root (`/`
 * and `/tax-tables`), so it canonicalizes there rather than to a duplicate
 * `/{year}` URL. Every other combination canonicalizes to itself.
 */
function buildCanonicalUrl(
  baseUrl: string,
  route: string,
  year?: string,
  state?: string,
  city?: string,
): string {
  let path = route;
  const isRouteRoot = year === LATEST_YEAR && !state && !city;
  if (year && !isRouteRoot) {
    path += `/${year}`;
    if (state) {
      path += `/${state}`;
      if (city) {
        path += `/${city}`;
      }
    }
  }
  // next.config.mjs sets trailingSlash: true, so a canonical without one points
  // at a URL that immediately redirects.
  return `${baseUrl}${path}/`;
}

export function getPageSpecificMetadata(
  pageName: string,
  year?: string,
  state?: string,
  city?: string,
  {
    salesTaxOnly = false,
  }: {
    /** A tax-tables city with a sales tax rate but no local income taxes. */
    salesTaxOnly?: boolean;
  } = {},
): Metadata {
  // Copy rather than alias. defaultOpenGraph is module-level and the fields
  // below are assigned, so sharing the reference lets one page's metadata
  // overwrite every other page's.
  const openGraph = { ...defaultOpenGraph };
  let description = "";

  let baseUrl = defaultMetadata.metadataBase?.href || defaultUrl;
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  // Params are already in dash-case, which matches our OG image filenames

  if (pageName === COMPARE.name) {
    description =
      "Compare take home pay across states and cities, including local taxes.";
    openGraph.title = COMPARE.name;
    openGraph.images = `/og-images/compare.png`;
  }

  if (pageName === INCOME_TAX_CALCULATOR.name) {
    if (!city) {
      if (!state) {
        if (year) {
          description = `Calculate your take home pay after federal and state income taxes for the year ${year}.`;
          openGraph.title = `${year} ${INCOME_TAX_CALCULATOR.name}`;
        } else {
          description = `Calculate your take home pay after federal, state, and city income taxes.`;
          openGraph.title = `${INCOME_TAX_CALCULATOR.name}`;
        }
        openGraph.images = `/og-images/landing.png`;
      } else {
        description = `Calculate your take home pay after federal and state income taxes for the year ${year} in ${snakeToTitleCase(state)}.`;
        openGraph.title = `${year} ${snakeToTitleCase(state)} ${INCOME_TAX_CALCULATOR.name}`;
        openGraph.images = `/og-images/${state}.png`;
      }
    } else {
      description = `Calculate your take home pay after federal, state, and city income taxes for the year ${year} in ${snakeToTitleCase(city)}, ${snakeToTitleCase(state as string)}.`;
      openGraph.title = `${year} ${snakeToTitleCase(city)}, ${snakeToTitleCase(state as string)} ${INCOME_TAX_CALCULATOR.name}`;
      openGraph.images = `/og-images/${state}/${city}.png`;
    }
  } else if (pageName === TAX_TABLES.name) {
    if (!city) {
      if (!state) {
        if (year) {
          description = `Tables of federal and state income tax rates for the year ${year}.`;
          openGraph.title = `${year} ${TAX_TABLES.name}`;
        } else {
          description = `Tables of federal, state, and city income tax rates.`;
          openGraph.title = `${TAX_TABLES.name}`;
        }
        openGraph.images = `/og-images/tax-tables/landing.png`;
      } else {
        description = `Tables of federal and state income tax rates for the year ${year} in ${snakeToTitleCase(state as string)}.`;
        openGraph.title = `${year} ${snakeToTitleCase(state)} ${TAX_TABLES.name}`;
        openGraph.images = `/og-images/tax-tables/${state}.png`;
      }
    } else if (salesTaxOnly) {
      description = `Tables of federal and state income tax rates and the sales tax rate for the year ${year} in ${snakeToTitleCase(city)}, ${snakeToTitleCase(state as string)}.`;
      openGraph.title = `${year} ${snakeToTitleCase(city)}, ${snakeToTitleCase(state as string)} ${TAX_TABLES.name}`;
      // generate-og-images.ts only captures cities with local income taxes.
      openGraph.images = `/og-images/tax-tables/${state}.png`;
    } else {
      description = `Tables of federal, state, and city income tax rates for the year ${year} in ${snakeToTitleCase(city)}, ${snakeToTitleCase(state as string)}.`;
      openGraph.title = `${year} ${snakeToTitleCase(city)}, ${snakeToTitleCase(state as string)} ${TAX_TABLES.name}`;
      openGraph.images = `/og-images/tax-tables/${state}/${city}.png`;
    }
  } else if (pageName === SUPPORT.name) {
    description = "Support page for the Income Tax Calculator.";
    openGraph.title = `${SUPPORT.name}`;
    openGraph.images = `/og-images/support.png`;
  } else if (pageName === CITY_TAXES.name) {
    description = "List all cities with local income taxes by state and year.";
    openGraph.title = `${CITY_TAXES.name}`;
    openGraph.images = `/og-images/landing.png`;
  } else if (pageName === DEVELOPERS.name) {
    description =
      "Free JSON API and MCP server for US income tax: calculate take-home pay, find the salary for a take-home goal, and look up federal, state and city tax brackets.";
    openGraph.title = `${DEVELOPERS.name}`;
    openGraph.images = `/og-images/landing.png`;
  } else if (pageName === DISCLAIMER.name) {
    description =
      "Important disclaimer about the use of this income tax calculator. This tool provides estimates for informational purposes only and should not be used for legal or tax filing purposes.";
    openGraph.title = `${DISCLAIMER.name}`;
    openGraph.images = `/og-images/landing.png`;
  }

  const canonical = buildCanonicalUrl(
    baseUrl,
    PAGE_ROUTES[pageName] ?? "",
    year,
    state,
    city,
  );

  openGraph.url = canonical;
  openGraph.description = description;

  return {
    description,
    alternates: {
      canonical,
    },
    openGraph,
  };
}
