/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { readLocationSelection } from "@/utils/url-selection";
import {
  buildURLWithParams,
  preserveQueryParams,
  withBasePath,
} from "@/utils/url";

function visit(url: string) {
  window.history.replaceState(null, "", url);
}

describe("readLocationSelection", () => {
  it("reads year, state and city off the calculator route", () => {
    visit("/2026/west-virginia/charleston/");
    expect(readLocationSelection()).toEqual({
      year: "2026",
      state: "west_virginia",
      city: "charleston",
    });
  });

  it("strips the page's own route prefix", () => {
    visit("/tax-tables/2025/oregon/portland/");
    expect(readLocationSelection("/tax-tables")).toEqual({
      year: "2025",
      state: "oregon",
      city: "portland",
    });
  });

  it("returns empty strings at a route root", () => {
    visit("/tax-tables/");
    expect(readLocationSelection("/tax-tables")).toEqual({
      year: "",
      state: "",
      city: "",
    });
  });

  it("reports missing trailing segments as empty, not undefined", () => {
    visit("/2026/oregon/");
    expect(readLocationSelection()).toEqual({
      year: "2026",
      state: "oregon",
      city: "",
    });
  });

  it("ignores query params", () => {
    visit("/2026/oregon/portland/?income=120000");
    expect(readLocationSelection().city).toBe("portland");
  });

  it("does not mistake a prefix-sharing route for the base route", () => {
    visit("/city-taxes/2026/");
    expect(readLocationSelection("/city-taxes")).toEqual({
      year: "2026",
      state: "",
      city: "",
    });
  });
});

describe("preserveQueryParams", () => {
  it("carries income across a navigation", () => {
    visit("/2026/oregon/?income=95000");
    expect(preserveQueryParams()).toEqual({ income: "95000" });
  });

  it("carries tables across a navigation", () => {
    visit("/tax-tables/2026/oregon/?tables=state-income,art-tax");
    expect(preserveQueryParams()).toEqual({ tables: "state-income,art-tax" });
  });

  it("carries both at once", () => {
    visit("/2026/oregon/?income=95000&tables=state-income");
    expect(preserveQueryParams()).toEqual({
      income: "95000",
      tables: "state-income",
    });
  });

  it("returns undefined when there is nothing to preserve", () => {
    visit("/2026/oregon/");
    expect(preserveQueryParams()).toBeUndefined();
  });

  it("drops params outside the preserved set", () => {
    visit("/2026/oregon/?income=95000&utm_source=newsletter");
    expect(preserveQueryParams()).toEqual({ income: "95000" });
  });
});

describe("buildURLWithParams", () => {
  it("appends params", () => {
    expect(buildURLWithParams("/2026/oregon", { income: 95000 })).toBe(
      "/2026/oregon?income=95000",
    );
  });

  it("omits empty and undefined values", () => {
    expect(buildURLWithParams("/2026", { income: undefined, tables: "" })).toBe(
      "/2026",
    );
  });
});

describe("withBasePath", () => {
  it("normalizes a path that is missing its leading slash", () => {
    expect(withBasePath("2026/oregon")).toBe("/2026/oregon");
  });
});
