import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { staticTaxTablesPath } from "@/api/static-tax-tables";
import { runTaxTables } from "@/api/tax-tables";

describe("staticTaxTablesPath", () => {
  it("builds dash-case paths at each level", () => {
    expect(staticTaxTablesPath("2026")).toBe("/data/tax-tables/2026.json");
    expect(staticTaxTablesPath("2026", "new_york")).toBe(
      "/data/tax-tables/2026/new-york.json",
    );
    expect(staticTaxTablesPath("2026", "new_york", "new_york_city")).toBe(
      "/data/tax-tables/2026/new-york/new-york-city.json",
    );
  });

  it("ignores a city without a state", () => {
    expect(staticTaxTablesPath("2026", undefined, "portland")).toBe(
      "/data/tax-tables/2026.json",
    );
  });

  // Anything under /api/ is sent to Functions by _routes.json, so a static
  // file there would cost a request -- and an exclude rule for it once took
  // the /api/tax-tables query endpoint away from its Function.
  it("stays outside the Functions routes", () => {
    const routes = JSON.parse(
      readFileSync(path.join(process.cwd(), "public", "_routes.json"), "utf8"),
    ) as { include: string[]; exclude: string[] };
    const file = staticTaxTablesPath("2026", "oregon", "portland");
    for (const rule of routes.include) {
      const prefix = rule.replace(/\*$/, "");
      expect(file.startsWith(prefix)).toBe(false);
    }
    expect(routes.exclude).toEqual([]);
  });

  it("describes the same location the endpoint would", async () => {
    const tables = await runTaxTables(
      { year: "2026", state: "oregon", city: "portland" },
      "https://income-tax.org",
    );
    expect(tables.location).toEqual({
      year: "2026",
      state: "oregon",
      city: "portland",
      filing_status: "all",
    });
  });
});
