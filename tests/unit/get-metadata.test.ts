import { describe, it, expect } from "vitest";
import { getPageSpecificMetadata } from "@/utils/get-metadata";
import {
  CITY_TAXES,
  COMPARE,
  DEVELOPERS,
  DISCLAIMER,
  INCOME_TAX_CALCULATOR,
  SITE_URL,
  SUPPORT,
  TAX_TABLES,
} from "@/constants/pages";
import { LATEST_YEAR } from "@/data-loaders/registry";

const canonicalOf = (metadata: ReturnType<typeof getPageSpecificMetadata>) =>
  String(metadata.alternates?.canonical);

const latestYear = LATEST_YEAR;

describe("canonical URLs", () => {
  it("points the newest data year at the route root, not a duplicate /{year}", () => {
    expect(
      canonicalOf(
        getPageSpecificMetadata(INCOME_TAX_CALCULATOR.name, latestYear),
      ),
    ).toMatch(/\/$/);
    expect(
      canonicalOf(
        getPageSpecificMetadata(INCOME_TAX_CALCULATOR.name, latestYear),
      ),
    ).not.toContain(latestYear);
  });

  it("canonicalizes an older year to itself", () => {
    expect(
      canonicalOf(getPageSpecificMetadata(INCOME_TAX_CALCULATOR.name, "2023")),
    ).toContain("/2023/");
  });

  it("keeps the API & MCP page on its own route, not the homepage", () => {
    expect(canonicalOf(getPageSpecificMetadata(DEVELOPERS.name))).toBe(
      `${SITE_URL}${DEVELOPERS.route}/`,
    );
  });

  it("keeps a state page on its own URL even in the newest year", () => {
    const canonical = canonicalOf(
      getPageSpecificMetadata(INCOME_TAX_CALCULATOR.name, latestYear, "oregon"),
    );
    expect(canonical).toContain(`/${latestYear}/oregon/`);
  });

  it("includes the city for a city page", () => {
    expect(
      canonicalOf(
        getPageSpecificMetadata(
          INCOME_TAX_CALCULATOR.name,
          "2025",
          "oregon",
          "portland",
        ),
      ),
    ).toContain("/2025/oregon/portland/");
  });

  it("builds each page's canonical from its own route, not the site root", () => {
    expect(canonicalOf(getPageSpecificMetadata(TAX_TABLES.name))).toContain(
      TAX_TABLES.route,
    );
    expect(canonicalOf(getPageSpecificMetadata(CITY_TAXES.name))).toContain(
      CITY_TAXES.route,
    );
    expect(canonicalOf(getPageSpecificMetadata(SUPPORT.name))).toContain(
      SUPPORT.route,
    );
    expect(canonicalOf(getPageSpecificMetadata(DISCLAIMER.name))).toContain(
      DISCLAIMER.route,
    );
  });

  it("always ends in a slash, matching trailingSlash: true", () => {
    for (const metadata of [
      getPageSpecificMetadata(INCOME_TAX_CALCULATOR.name),
      getPageSpecificMetadata(TAX_TABLES.name, "2025", "oregon"),
      getPageSpecificMetadata(CITY_TAXES.name),
    ]) {
      expect(canonicalOf(metadata).endsWith("/")).toBe(true);
    }
  });

  it("keeps the tax-tables route root distinct from the calculator's", () => {
    const calculator = canonicalOf(
      getPageSpecificMetadata(INCOME_TAX_CALCULATOR.name, latestYear),
    );
    const taxTables = canonicalOf(
      getPageSpecificMetadata(TAX_TABLES.name, latestYear),
    );
    expect(calculator).not.toBe(taxTables);
  });

  it("gives an older compare year its own canonical, and the newest the root", () => {
    expect(canonicalOf(getPageSpecificMetadata(COMPARE.name, "2025"))).toBe(
      `${SITE_URL}${COMPARE.route}/2025/`,
    );
    expect(canonicalOf(getPageSpecificMetadata(COMPARE.name, latestYear))).toBe(
      `${SITE_URL}${COMPARE.route}/`,
    );
  });
});

describe("open graph", () => {
  it("does not leak one page's fields into the next", () => {
    // defaultOpenGraph is module-level; a shared reference let the last call
    // overwrite every earlier page's metadata.
    const city = getPageSpecificMetadata(
      INCOME_TAX_CALCULATOR.name,
      "2025",
      "oregon",
      "portland",
    );
    const landing = getPageSpecificMetadata(INCOME_TAX_CALCULATOR.name);

    expect(city.openGraph?.title).toContain("Portland");
    expect(landing.openGraph?.title).not.toContain("Portland");
    expect(landing.description).not.toContain("Portland");
  });

  it("points at the matching og image per page shape", () => {
    expect(
      (getPageSpecificMetadata(INCOME_TAX_CALCULATOR.name) as any).openGraph
        .images,
    ).toBe("/og-images/landing.png");
    expect(
      (getPageSpecificMetadata(TAX_TABLES.name, "2025", "oregon") as any)
        .openGraph.images,
    ).toBe("/og-images/tax-tables/oregon.png");
  });

  it("sets the og url to the canonical", () => {
    const metadata = getPageSpecificMetadata(TAX_TABLES.name, "2025", "oregon");
    expect((metadata as any).openGraph.url).toBe(canonicalOf(metadata));
  });
});
