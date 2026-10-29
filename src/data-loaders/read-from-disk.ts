// Read every year/state file under src/data and assemble it into one object.
//
// Server-only: uses `fs`, so this must never be imported into a client
// component. Client components lazy-import individual data files instead (see
// src/hooks/use-tax-data.ts).

import { promises as fs } from "fs";
import path from "path";

import { CITIES } from "@/constants";
import type { SalesTaxData, TaxData } from "@/types";

const yearPattern = /^\d{4}$/;

export type TaxDataByYear = {
  [year: string]: { federal: TaxData; [state: string]: TaxData };
};

export type StatesAndCitiesForYear = {
  [year: string]: { [state: string]: { cities: string[] } };
};

export type TaxDataSet = {
  taxDataByYear: TaxDataByYear;
  statesAndCitiesForYear: StatesAndCitiesForYear;
  /**
   * Cities with a sales tax rate of their own, by year and state. Kept apart
   * from `statesAndCitiesForYear` because only the tax tables list them: the
   * calculator has nothing to show for Seattle that Washington does not.
   */
  salesTaxCitiesForYear: StatesAndCitiesForYear;
  years: string[];
  currentYear: string;
};

// Keyed by directory. Assembling the set walks src/data and dynamic-imports
// every file in it; a static export calls this once per generated page, so the
// result is memoized. Keying by directory rather than using one shared object
// keeps two different directories from merging into each other's results.
const cache = new Map<string, Promise<TaxDataSet>>();

export function readTaxDataFromDisk(
  dataDirectory: string,
): Promise<TaxDataSet> {
  const cached = cache.get(dataDirectory);
  if (cached) {
    return cached;
  }
  // Cache the promise, not the resolved value, so concurrent callers share one
  // traversal instead of racing several.
  const pending = assembleTaxData(dataDirectory);
  cache.set(dataDirectory, pending);
  return pending;
}

async function assembleTaxData(dataDirectory: string): Promise<TaxDataSet> {
  const taxDataByYear: TaxDataByYear = {};
  const statesAndCitiesForYear: StatesAndCitiesForYear = {};
  const salesTaxCitiesForYear: StatesAndCitiesForYear = {};
  const years: string[] = [];

  const yearDirectories = (await fs.readdir(dataDirectory))
    .filter((entry: string) => yearPattern.test(entry))
    .sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

  for (const year of yearDirectories) {
    const files = await fs.readdir(path.join(dataDirectory, year));
    if (!files.includes("federal.ts")) {
      continue;
    }

    years.push(year);
    const federalTaxData = await import(`@/data/${year}/federal.ts`);
    taxDataByYear[year] = { federal: federalTaxData.default };
    statesAndCitiesForYear[year] = {};
    salesTaxCitiesForYear[year] = files.includes("sales-tax")
      ? await readSalesTaxCities(dataDirectory, year)
      : {};

    if (!files.includes("state")) {
      continue;
    }

    const stateFiles = await fs.readdir(
      path.join(dataDirectory, year, "state"),
    );
    for (const stateFile of stateFiles) {
      const stateName = stateFile.replace(".ts", "");
      const stateTaxData = await import(`@/data/${year}/state/${stateFile}`);
      taxDataByYear[year][stateName] = stateTaxData.default;
      statesAndCitiesForYear[year][stateName] = {
        cities: Object.keys(taxDataByYear[year][stateName].cities ?? {}).filter(
          Boolean,
        ),
      };
    }
  }

  return {
    taxDataByYear,
    statesAndCitiesForYear,
    salesTaxCitiesForYear,
    years,
    currentYear: years[0],
  };
}

async function readSalesTaxCities(
  dataDirectory: string,
  year: string,
): Promise<StatesAndCitiesForYear[string]> {
  const out: StatesAndCitiesForYear[string] = {};
  const stateFiles = await fs.readdir(
    path.join(dataDirectory, year, "sales-tax", "state"),
  );
  for (const stateFile of stateFiles) {
    const { default: salesTax } = (await import(
      `@/data/${year}/sales-tax/state/${stateFile}`
    )) as { default: SalesTaxData };
    out[stateFile.replace(".ts", "")] = {
      cities: Object.keys(salesTax[CITIES] ?? {}),
    };
  }
  return out;
}
