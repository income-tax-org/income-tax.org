import { readTaxDataFromDisk } from "@/data-loaders/read-from-disk";
import type { CityPageParams, StatePageParams } from "@/types/page";
import path from "path";
import { dashToSnakeCase, snakeToTitleCase } from "./string-utils";

export async function getLandingPageData() {
  const dataDirectory = path.join(process.cwd(), "src", "data");
  const { years, currentYear, taxDataByYear, statesAndCitiesForYear } =
    await readTaxDataFromDisk(dataDirectory);

  const federalTaxes = taxDataByYear[currentYear]?.federal || {};
  const stateTaxes = {};

  return {
    availableYears: years,
    statesAndCitiesForYear,
    defaultFederalTaxes: federalTaxes,
    defaultStateTaxes: stateTaxes,
    defaultYear: currentYear,
  };
}

export async function getYearPageData(params: { year: string }) {
  const { year } = params;
  const dataDirectory = path.join(process.cwd(), "src", "data");
  const { years, taxDataByYear, statesAndCitiesForYear } =
    await readTaxDataFromDisk(dataDirectory);

  const federalTaxes = taxDataByYear[year]?.federal || {};
  const stateTaxes = {};

  return {
    availableYears: years,
    statesAndCitiesForYear,
    defaultFederalTaxes: federalTaxes,
    defaultStateTaxes: stateTaxes,
    defaultYear: year,
  };
}

export async function getStatePageData(params: StatePageParams) {
  const { year } = params;
  const state = dashToSnakeCase(params.state);
  const dataDirectory = path.join(process.cwd(), "src", "data");
  const { years, taxDataByYear, statesAndCitiesForYear } =
    await readTaxDataFromDisk(dataDirectory);

  const federalTaxes = taxDataByYear[year]?.federal || {};
  const stateTaxes = taxDataByYear[year]?.[state] || {};

  return {
    availableYears: years,
    statesAndCitiesForYear,
    defaultFederalTaxes: federalTaxes,
    defaultStateTaxes: stateTaxes,
    defaultYear: year,
    defaultUSAState: state,
  };
}

export async function getCityPageData(params: CityPageParams) {
  const { year } = params;
  const state = dashToSnakeCase(params.state);
  const city = dashToSnakeCase(params.city);

  const dataDirectory = path.join(process.cwd(), "src", "data");
  const { years, taxDataByYear, statesAndCitiesForYear } =
    await readTaxDataFromDisk(dataDirectory);

  const federalTaxes = taxDataByYear[year]?.federal || {};
  const stateTaxes = taxDataByYear[year]?.[state] || {};

  return {
    availableYears: years,
    statesAndCitiesForYear,
    defaultFederalTaxes: federalTaxes,
    defaultStateTaxes: stateTaxes,
    defaultYear: year,
    defaultUSAState: state,
    defaultUSACity: city,
  };
}

export async function getCityTaxListData(year?: string) {
  const dataDirectory = path.join(process.cwd(), "src", "data");
  const { years, currentYear, taxDataByYear } =
    await readTaxDataFromDisk(dataDirectory);

  const selectedYear = year && years.includes(year) ? year : currentYear;

  // Build city tax list from the already-loaded tax data
  const cityTaxList: {
    [stateKey: string]: {
      stateName: string;
      cities: Array<{
        cityKey: string;
        cityName: string;
        taxTypes: string[];
      }>;
    };
  } = {};

  const yearData = taxDataByYear[selectedYear];
  if (yearData) {
    for (const [stateKey, stateTaxData] of Object.entries(yearData)) {
      // Skip federal and states without city taxes
      if (stateKey === "federal" || !stateTaxData.cities) {
        continue;
      }

      const cities = Object.keys(stateTaxData.cities);
      if (cities.length > 0) {
        cityTaxList[stateKey] = {
          stateName: snakeToTitleCase(stateKey),
          cities: cities.map((cityKey) => {
            // Get all tax types for this city
            const cityTaxData = stateTaxData.cities?.[cityKey] || {};
            const taxTypes = Object.keys(cityTaxData);

            return {
              cityKey,
              cityName: snakeToTitleCase(cityKey),
              taxTypes,
            };
          }),
        };
      }
    }
  }

  return {
    availableYears: years,
    defaultYear: selectedYear,
    cityTaxList,
  };
}

export async function getComparePageData(year?: string) {
  const dataDirectory = path.join(process.cwd(), "src", "data");
  const { years, currentYear, taxDataByYear, statesAndCitiesForYear } =
    await readTaxDataFromDisk(dataDirectory);

  const selectedYear = year && years.includes(year) ? year : currentYear;

  return {
    availableYears: years,
    defaultYear: selectedYear,
    statesAndCitiesForYear,
    defaultFederalTaxes: taxDataByYear[selectedYear]?.federal || {},
  };
}

/**
 * The tax tables' city lists: cities with local income or payroll taxes, and
 * cities with a sales tax rate of their own, like Seattle. The calculator
 * keeps to the first, since it never charges sales tax.
 */
export async function getTaxTablesStatesAndCities() {
  const dataDirectory = path.join(process.cwd(), "src", "data");
  const { statesAndCitiesForYear, salesTaxCitiesForYear } =
    await readTaxDataFromDisk(dataDirectory);

  const merged: typeof statesAndCitiesForYear = {};
  for (const [year, states] of Object.entries(statesAndCitiesForYear)) {
    merged[year] = {};
    for (const [state, { cities }] of Object.entries(states)) {
      const salesTaxCities = salesTaxCitiesForYear[year]?.[state]?.cities ?? [];
      merged[year][state] = {
        cities: Array.from(new Set([...cities, ...salesTaxCities])).sort(),
      };
    }
  }
  return merged;
}
