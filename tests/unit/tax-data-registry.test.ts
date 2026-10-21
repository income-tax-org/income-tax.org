import { describe, it, expect } from "vitest";
import { readdirSync } from "fs";
import path from "path";
import { LATEST_YEAR, TAX_DATA_REGISTRY, YEARS } from "@/mcp/tax-data-registry";

const dataDirectory = path.join(process.cwd(), "src", "data");

const yearsOnDisk = readdirSync(dataDirectory)
  .filter((entry) => /^\d{4}$/.test(entry))
  .sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

describe("tax data registry", () => {
  // The API and MCP server cannot read src/data at runtime, so a year or state
  // missing here is one they silently cannot serve.
  it("lists every year on disk, newest first", () => {
    expect(YEARS).toEqual(yearsOnDisk);
    expect(LATEST_YEAR).toBe(yearsOnDisk[0]);
  });

  it.each(yearsOnDisk)("lists every %s state file", (year) => {
    const statesOnDisk = readdirSync(path.join(dataDirectory, year, "state"))
      .filter((file) => file.endsWith(".ts"))
      .map((file) => file.replace(/\.ts$/, ""))
      .sort();
    expect(Object.keys(TAX_DATA_REGISTRY[year].states).sort()).toEqual(
      statesOnDisk,
    );
  });

  it("loads the data it points at", async () => {
    const registry = TAX_DATA_REGISTRY[LATEST_YEAR];
    const { default: federal } = await registry.federal();
    const { default: oregon } = await registry.states.oregon();
    expect(federal.federal_income).toBeDefined();
    expect(oregon.state_income).toBeDefined();
  });
});
