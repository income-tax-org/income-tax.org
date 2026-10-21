import { describe, it, expect } from "vitest";
import { DEVELOPERS, SITE_URL } from "@/constants/pages";
import { apiUrlForPage } from "@/utils/api-url-for-page";
import { getPageSpecificMetadata } from "@/utils/get-metadata";

describe("apiUrlForPage", () => {
  it("fills in the page's own location, in snake_case", () => {
    expect(
      apiUrlForPage("calculate", {
        year: "2026",
        state: "new-york",
        city: "new-york-city",
      }),
    ).toBe(
      `${SITE_URL}/api/calculate?year=2026&state=new_york&city=new_york_city&income={income}`,
    );
  });

  it("leaves a placeholder for the state on the landing page", () => {
    expect(apiUrlForPage("calculate", {})).toBe(
      `${SITE_URL}/api/calculate?state={state}&income={income}`,
    );
  });

  it("needs no placeholders for tax tables", () => {
    expect(apiUrlForPage("tax-tables", { year: "2025", state: "ohio" })).toBe(
      `${SITE_URL}/api/tax-tables?year=2025&state=ohio`,
    );
    expect(apiUrlForPage("tax-tables", {})).toBe(`${SITE_URL}/api/tax-tables`);
  });
});

describe("developers page metadata", () => {
  it("is canonical at its own route", () => {
    expect(
      String(getPageSpecificMetadata(DEVELOPERS.name).alternates?.canonical),
    ).toBe(`${SITE_URL}${DEVELOPERS.route}/`);
  });
});
