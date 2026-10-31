import { canonicalPairOrder } from "@/constants/compare-pairs";
import {
  COMPARE,
  COMPARE_SHORT_TITLE,
  INCOME_TAX_CALCULATOR,
  SITE_URL,
  TAX_TABLES,
  TAX_TABLES_SHORT_TITLE,
} from "@/constants/pages";
import { LATEST_YEAR } from "@/data-loaders/registry";
import type { Metadata } from "next";
import { defaultMetadata } from "./get-metadata";
import { snakeToTitleCase } from "./string-utils";

/**
 * schema.org JSON-LD builders. Only types Google documents as structured data
 * (WebSite, WebApplication, BreadcrumbList) plus a plain WebPage; no FAQPage,
 * which Google restricted, and no ratings, which we do not have.
 */

const CONTEXT = "https://schema.org";

export type StructuredData = Record<string, unknown>;

/** The name, description and canonical URL a page already declares. */
export type PageInfo = { name: string; description: string; url: string };

type Crumb = { name: string; url: string };

/**
 * Absolute canonical URL, by the same rule as get-metadata.ts: the newest year
 * with no state or city is served at the route root, everything else at itself,
 * always with a trailing slash.
 */
export function canonicalUrl(
  route: string,
  year?: string,
  ...rest: string[]
): string {
  const root = route === INCOME_TAX_CALCULATOR.route ? "" : route;
  const segments =
    year && (year !== LATEST_YEAR || rest.length) ? [year, ...rest] : [];
  return `${SITE_URL}${[root, ...segments].join("/")}/`;
}

/** The site owner, taken from the page metadata so the two never disagree. */
function publisher(): StructuredData {
  const { authors } = defaultMetadata;
  const author = Array.isArray(authors) ? authors[0] : authors;
  return {
    "@type": "Person",
    name: author?.name,
    url: author?.url && String(author.url),
  };
}

/** Read the name, description and canonical URL out of a page's metadata. */
export function pageInfoFromMetadata({
  title,
  description,
  alternates,
}: Metadata): PageInfo {
  return {
    name: String(title ?? ""),
    description: description ?? "",
    url: String(alternates?.canonical ?? ""),
  };
}

export function webSiteJsonLd(): StructuredData {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    name: INCOME_TAX_CALCULATOR.name,
    url: canonicalUrl(INCOME_TAX_CALCULATOR.route),
    publisher: publisher(),
  };
}

export function webApplicationJsonLd(page: PageInfo): StructuredData {
  return {
    "@context": CONTEXT,
    "@type": "WebApplication",
    ...page,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: publisher(),
  };
}

export function webPageJsonLd(page: PageInfo): StructuredData {
  return {
    "@context": CONTEXT,
    "@type": "WebPage",
    ...page,
    isPartOf: {
      "@type": "WebSite",
      name: INCOME_TAX_CALCULATOR.name,
      url: canonicalUrl(INCOME_TAX_CALCULATOR.route),
    },
    publisher: publisher(),
  };
}

/**
 * A BreadcrumbList, or null when there is no trail to show (a single crumb).
 */
export function breadcrumbJsonLd(crumbs: Crumb[]): StructuredData | null {
  if (crumbs.length < 2) {
    return null;
  }
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map(({ name, url }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: url,
    })),
  };
}

const home: Crumb = {
  name: INCOME_TAX_CALCULATOR.name,
  url: canonicalUrl(INCOME_TAX_CALCULATOR.route),
};

/**
 * Year › state › city under a section root. The newest year's own URL is the
 * section root, so it gets no crumb of its own: it would repeat the root.
 */
function yearStateCityCrumbs(
  route: string,
  year?: string,
  state?: string,
  city?: string,
): Crumb[] {
  const crumbs: Crumb[] = [];
  if (!year) {
    return crumbs;
  }
  if (year !== LATEST_YEAR) {
    crumbs.push({ name: year, url: canonicalUrl(route, year) });
  }
  if (state) {
    crumbs.push({
      name: snakeToTitleCase(state),
      url: canonicalUrl(route, year, state),
    });
    if (city) {
      crumbs.push({
        name: snakeToTitleCase(city),
        url: canonicalUrl(route, year, state, city),
      });
    }
  }
  return crumbs;
}

/** Params are dash-case, as in the URL. */
export function calculatorBreadcrumbs(
  year?: string,
  state?: string,
  city?: string,
): StructuredData | null {
  return breadcrumbJsonLd([
    home,
    ...yearStateCityCrumbs(INCOME_TAX_CALCULATOR.route, year, state, city),
  ]);
}

export function taxTablesBreadcrumbs(
  year?: string,
  state?: string,
  city?: string,
): StructuredData | null {
  return breadcrumbJsonLd([
    home,
    { name: TAX_TABLES_SHORT_TITLE, url: canonicalUrl(TAX_TABLES.route) },
    ...yearStateCityCrumbs(TAX_TABLES.route, year, state, city),
  ]);
}

/**
 * Both orderings of a pair are built, and the reversed one canonicalizes to
 * the alphabetical one, so the pair crumb always uses that order.
 */
export function compareBreadcrumbs(
  year?: string,
  stateA?: string,
  stateB?: string,
): StructuredData | null {
  const crumbs: Crumb[] = [
    home,
    { name: COMPARE_SHORT_TITLE, url: canonicalUrl(COMPARE.route) },
  ];
  if (year && year !== LATEST_YEAR) {
    crumbs.push({ name: year, url: canonicalUrl(COMPARE.route, year) });
  }
  if (year && stateA && stateB) {
    const [first, second] = canonicalPairOrder(stateA, stateB);
    crumbs.push({
      name: `${snakeToTitleCase(first)} vs ${snakeToTitleCase(second)}`,
      url: canonicalUrl(COMPARE.route, year, first, "vs", second),
    });
  }
  return breadcrumbJsonLd(crumbs);
}
