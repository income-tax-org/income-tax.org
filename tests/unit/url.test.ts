/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  updateURL,
  getQueryParams,
  parseAmountParam,
  parseIncomeParam,
} from "@/utils/url";

function at() {
  return window.location.pathname + window.location.search;
}

beforeEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("updateURL", () => {
  it("navigates to the path", () => {
    updateURL("/2026/oregon/portland/");
    expect(at()).toBe("/2026/oregon/portland/");
  });

  it("appends query params", () => {
    updateURL("/2026/oregon/", { income: 95000 });
    expect(at()).toBe("/2026/oregon/?income=95000");
  });

  it("drops empty and undefined params rather than writing bare keys", () => {
    updateURL("/2026/oregon/", {
      income: 95000,
      tables: "",
      city: undefined,
    });
    expect(at()).toBe("/2026/oregon/?income=95000");
  });

  it("adds a history entry by default", () => {
    const before = window.history.length;
    updateURL("/2026/oregon/");
    expect(window.history.length).toBe(before + 1);
  });

  it("replaces the entry when asked, leaving history unchanged", () => {
    updateURL("/2026/oregon/");
    const before = window.history.length;
    updateURL("/2026/hawaii/", undefined, false, true);
    expect(at()).toBe("/2026/hawaii/");
    expect(window.history.length).toBe(before);
  });

  // Otherwise re-selecting the value already showing stacks duplicate entries,
  // and the back button appears not to work.
  it("does not stack an entry when the URL is unchanged", () => {
    updateURL("/2026/oregon/");
    const before = window.history.length;
    updateURL("/2026/oregon/");
    expect(window.history.length).toBe(before);
  });

  it("treats a trailing slash as the same URL", () => {
    updateURL("/2026/oregon/");
    const before = window.history.length;
    updateURL("/2026/oregon");
    expect(window.history.length).toBe(before);
  });

  describe("preserveExistingParams", () => {
    it("carries existing params onto the new path", () => {
      updateURL("/2026/oregon/", { income: 95000 });
      updateURL("/2026/hawaii/", undefined, true);
      expect(at()).toBe("/2026/hawaii/?income=95000");
    });

    it("lets explicit params win over the existing ones", () => {
      updateURL("/2026/oregon/", { income: 95000 });
      updateURL("/2026/hawaii/", { income: 120000 }, true);
      expect(getQueryParams().get("income")).toBe("120000");
    });

    it("drops existing params when not asked to preserve them", () => {
      updateURL("/2026/oregon/", { income: 95000 });
      updateURL("/2026/hawaii/");
      expect(at()).toBe("/2026/hawaii/");
    });
  });
});

describe("parseIncomeParam", () => {
  it("reads a plain number", () => {
    expect(parseIncomeParam("95000")).toBe(95000);
  });

  // `parseInt` stopped at the first character it could not read, so these two
  // came through as $1 and $50,000 rather than as what the URL said.
  it("reads exponent notation instead of truncating it to a digit", () => {
    expect(parseIncomeParam("1e6")).toBe(1_000_000);
  });

  it("keeps the fractional part instead of dropping it", () => {
    expect(parseIncomeParam("50000.5")).toBe(50000.5);
  });

  it("rejects input it cannot read at all", () => {
    for (const value of ["", "abc", "50,000", "$95000", "  "]) {
      expect(parseIncomeParam(value)).toBeNull();
    }
  });

  it("rejects a missing param", () => {
    expect(parseIncomeParam(null)).toBeNull();
  });

  it("rejects values that are not a finite positive amount", () => {
    for (const value of ["0", "-1", "-1e6", "Infinity", "-Infinity", "NaN"]) {
      expect(parseIncomeParam(value)).toBeNull();
    }
  });
});

describe("parseAmountParam", () => {
  it("accepts zero, a deliberate choice for deductions or spending", () => {
    expect(parseAmountParam("0")).toBe(0);
  });

  it("reads exponent notation instead of truncating it to a digit", () => {
    expect(parseAmountParam("1e4")).toBe(10_000);
  });

  it("rejects zero when told to", () => {
    expect(parseAmountParam("0", { allowZero: false })).toBeNull();
  });

  // Number("  ") is 0, so a blank param must not come through as $0.
  it("rejects blank and unreadable input", () => {
    for (const value of [null, "", "  ", "abc", "5,000", "-1", "Infinity"]) {
      expect(parseAmountParam(value)).toBeNull();
    }
  });
});
