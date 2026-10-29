import { readTaxDataFromDisk } from "@/data-loaders/read-from-disk";
import type {
  CityPageParams,
  StatePageParams,
  YearPageParams,
} from "@/types/page";
import path from "path";
import { getTaxTablesStatesAndCities } from "./get-page-data";
import { snakeToDashCase } from "./string-utils";

export async function getYearPageParams(): Promise<YearPageParams[]> {
  const dataDirectory = path.join(process.cwd(), "src", "data");
  const { taxDataByYear } = await readTaxDataFromDisk(dataDirectory);

  return Object.keys(taxDataByYear).map((year) => {
    return { year };
  });
}

export async function getStatePageParams(): Promise<StatePageParams[]> {
  const dataDirectory = path.join(process.cwd(), "src", "data");
  const { taxDataByYear } = await readTaxDataFromDisk(dataDirectory);

  const yearsAndStates = [];
  for (const year of Object.keys(taxDataByYear)) {
    for (const state of Object.keys(taxDataByYear[year])) {
      if (state === "federal") {
        continue;
      }
      yearsAndStates.push({ year, state: snakeToDashCase(state) });
    }
  }

  return yearsAndStates;
}

export async function getCityPageParams(): Promise<CityPageParams[]> {
  const dataDirectory = path.join(process.cwd(), "src", "data");
  const { taxDataByYear } = await readTaxDataFromDisk(dataDirectory);

  const yearsStatesAndCities = [];
  for (const year of Object.keys(taxDataByYear)) {
    for (const state of Object.keys(taxDataByYear[year])) {
      if (state === "federal") {
        continue;
      }
      if (
        typeof taxDataByYear[year][state].cities === "undefined" ||
        Object.keys(taxDataByYear[year][state].cities as {})?.length === 0
      ) {
        continue;
      }
      for (const city of Object.keys(taxDataByYear[year][state].cities as {})) {
        yearsStatesAndCities.push({
          year,
          state: snakeToDashCase(state),
          city: snakeToDashCase(city),
        });
      }
    }
  }

  return yearsStatesAndCities;
}

/** City pages for the tax tables, which also list sales tax cities. */
export async function getTaxTablesCityPageParams(): Promise<CityPageParams[]> {
  const statesAndCitiesForYear = await getTaxTablesStatesAndCities();
  return Object.entries(statesAndCitiesForYear).flatMap(([year, states]) =>
    Object.entries(states).flatMap(([state, { cities }]) =>
      cities.map((city) => ({
        year,
        state: snakeToDashCase(state),
        city: snakeToDashCase(city),
      })),
    ),
  );
}
