import { describe, it, expect } from "vitest";
import {
  COMPARE,
  INCOME_TAX_CALCULATOR,
  SITE_URL,
  TAX_TABLES,
} from "@/constants/pages";
import { LATEST_YEAR, YEARS } from "@/data-loaders/registry";
import { getPageSpecificMetadata } from "@/utils/get-metadata";
import {
  calculatorBreadcrumbs,
  canonicalUrl,
  compareBreadcrumbs,
  pageInfoFromMetadata,
  taxTablesBreadcrumbs,
  webApplicationJsonLd,
  webPageJsonLd,
  webSiteJsonLd,
} from "@/utils/structured-data";

const olderYear = YEARS[1];

type Item = { position: number; name: string; item: string };
const items = (list: ReturnType<typeof calculatorBreadcrumbs>) =>
  (list?.itemListElement ?? []) as Item[];

describe("canonicalUrl", () => {
  it("agrees with the canonical in the page metadata", () => {
    const cases: [string, string, string?, string?, string?][] = [
      [INCOME_TAX_CALCULATOR.name, INCOME_TAX_CALCULATOR.route],
      [INCOME_TAX_CALCULATOR.name, INCOME_TAX_CALCULATOR.route, LATEST_YEAR],
      [INCOME_TAX_CALCULATOR.name, INCOME_TAX_CALCULATOR.route, olderYear],
      [
        INCOME_TAX_CALCULATOR.name,
        INCOME_TAX_CALCULATOR.route,
        LATEST_YEAR,
        "ohio",
        "columbus",
      ],
      [TAX_TABLES.name, TAX_TABLES.route, LATEST_YEAR],
      [TAX_TABLES.name, TAX_TABLES.route, olderYear, "new-york"],
      [COMPARE.name, COMPARE.route],
      [COMPARE.name, COMPARE.route, LATEST_YEAR],
      [COMPARE.name, COMPARE.route, olderYear],
    ];
    for (const [name, route, year, state, city] of cases) {
      const rest = [state, city].filter((s): s is string => !!s);
      expect(canonicalUrl(route, year, ...rest)).toBe(
        String(
          getPageSpecificMetadata(name, year, state, city).alternates
            ?.canonical,
        ),
      );
    }
  });
});

describe("page types", () => {
  const page = { name: "Name", description: "Description", url: "U" };

  it("describes the site and its publisher", () => {
    expect(webSiteJsonLd()).toMatchObject({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: INCOME_TAX_CALCULATOR.name,
      url: `${SITE_URL}/`,
      publisher: { "@type": "Person", name: "Evan Bonsignori" },
    });
  });

  it("marks the calculator as a free finance web application", () => {
    expect(webApplicationJsonLd(page)).toMatchObject({
      "@type": "WebApplication",
      ...page,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    });
  });

  it("marks tax tables as a web page within the site", () => {
    expect(webPageJsonLd(page)).toMatchObject({
      "@type": "WebPage",
      ...page,
      isPartOf: { "@type": "WebSite", url: `${SITE_URL}/` },
    });
  });

  it("reads name, description and canonical out of page metadata", () => {
    const metadata = {
      title: "2025 Ohio Income Tax Calculator",
      ...getPageSpecificMetadata(INCOME_TAX_CALCULATOR.name, "2025", "ohio"),
    };
    expect(pageInfoFromMetadata(metadata)).toEqual({
      name: "2025 Ohio Income Tax Calculator",
      description: metadata.description,
      url: `${SITE_URL}/2025/ohio/`,
    });
  });
});

describe("calculatorBreadcrumbs", () => {
  it("has no trail on the home page or the newest year", () => {
    expect(calculatorBreadcrumbs()).toBeNull();
    expect(calculatorBreadcrumbs(LATEST_YEAR)).toBeNull();
  });

  it("links an older year, state and city to their own URLs", () => {
    expect(items(calculatorBreadcrumbs(olderYear, "ohio", "columbus"))).toEqual(
      [
        {
          "@type": "ListItem",
          position: 1,
          name: INCOME_TAX_CALCULATOR.name,
          item: `${SITE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: olderYear,
          item: `${SITE_URL}/${olderYear}/`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Ohio",
          item: `${SITE_URL}/${olderYear}/ohio/`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Columbus",
          item: `${SITE_URL}/${olderYear}/ohio/columbus/`,
        },
      ],
    );
  });

  it("folds the newest year into home, whose URL it shares", () => {
    const crumbs = items(calculatorBreadcrumbs(LATEST_YEAR, "new-york"));
    expect(crumbs.map(({ name, item }) => [name, item])).toEqual([
      [INCOME_TAX_CALCULATOR.name, `${SITE_URL}/`],
      ["New York", `${SITE_URL}/${LATEST_YEAR}/new-york/`],
    ]);
  });
});

describe("taxTablesBreadcrumbs", () => {
  it("starts at home, then the tax tables root", () => {
    expect(
      items(taxTablesBreadcrumbs()).map(({ position, item }) => [
        position,
        item,
      ]),
    ).toEqual([
      [1, `${SITE_URL}/`],
      [2, `${SITE_URL}/tax-tables/`],
    ]);
  });

  it("gives the newest year no crumb of its own", () => {
    expect(items(taxTablesBreadcrumbs(LATEST_YEAR))).toHaveLength(2);
    expect(
      items(taxTablesBreadcrumbs(LATEST_YEAR, "ohio", "columbus")).map(
        ({ item }) => item,
      ),
    ).toEqual([
      `${SITE_URL}/`,
      `${SITE_URL}/tax-tables/`,
      `${SITE_URL}/tax-tables/${LATEST_YEAR}/ohio/`,
      `${SITE_URL}/tax-tables/${LATEST_YEAR}/ohio/columbus/`,
    ]);
  });

  it("links an older year to its own page", () => {
    expect(items(taxTablesBreadcrumbs(olderYear))[2]).toMatchObject({
      position: 3,
      name: olderYear,
      item: `${SITE_URL}/tax-tables/${olderYear}/`,
    });
  });
});

describe("compareBreadcrumbs", () => {
  it("links a pair by its alphabetical, canonical order", () => {
    const expected = [
      [INCOME_TAX_CALCULATOR.name, `${SITE_URL}/`],
      ["Compare", `${SITE_URL}/compare/`],
      [
        "Alabama vs Arizona",
        `${SITE_URL}/compare/${LATEST_YEAR}/alabama/vs/arizona/`,
      ],
    ];
    for (const [a, b] of [
      ["alabama", "arizona"],
      ["arizona", "alabama"],
    ]) {
      expect(
        items(compareBreadcrumbs(LATEST_YEAR, a, b)).map(({ name, item }) => [
          name,
          item,
        ]),
      ).toEqual(expected);
    }
  });

  it("links an older year to its own page", () => {
    expect(
      items(compareBreadcrumbs(olderYear)).map(({ item }) => item),
    ).toEqual([
      `${SITE_URL}/`,
      `${SITE_URL}/compare/`,
      `${SITE_URL}/compare/${olderYear}/`,
    ]);
  });

  it("does not repeat the root for the newest year", () => {
    expect(items(compareBreadcrumbs(LATEST_YEAR))).toHaveLength(2);
  });
});
