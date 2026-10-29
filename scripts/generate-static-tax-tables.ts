// Write every tax table into out/ as a static JSON file.
//
// Runs after `next build` (postbuild). See src/api/static-tax-tables.ts for
// why: the tables depend on year and location only, so they need no Function
// and cost nothing to serve. Each file holds every filing status -- the same
// response as /api/tax-tables with year, state and city, and nothing else.

import { promises as fs } from "fs";
import path from "path";

import { CITIES } from "@/constants";
import { SITE_URL } from "@/constants/pages";
import { staticTaxTablesPath } from "@/api/static-tax-tables";
import { salesTaxCitiesFor } from "@/utils/sales-tax";
import { TAX_DATA_REGISTRY, YEARS } from "@/data-loaders/registry";
import { runTaxTables } from "@/api/tax-tables";

const outDirectory = path.join(process.cwd(), "out");

async function write(year: string, state?: string, city?: string) {
  const tables = await runTaxTables({ year, state, city }, SITE_URL);
  const file = path.join(outDirectory, staticTaxTablesPath(year, state, city));
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(tables));
}

async function main() {
  let count = 0;
  for (const year of YEARS) {
    await write(year);
    count++;
    const registry = TAX_DATA_REGISTRY[year];
    for (const [state, load] of Object.entries(registry.states)) {
      await write(year, state);
      count++;
      const { default: stateData } = await load();
      // Cities with only a sales tax rate of their own, like Seattle, get a
      // file too: the tax-tables page links to them.
      const salesTax = await registry.salesTax[state]?.();
      const cities = new Set([
        ...Object.keys(stateData[CITIES] ?? {}),
        ...salesTaxCitiesFor(salesTax?.default ?? null),
      ]);
      for (const city of Array.from(cities)) {
        await write(year, state, city);
        count++;
      }
    }
  }
  console.log(`Wrote ${count} static tax tables to out/data/tax-tables/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
