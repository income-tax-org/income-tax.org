// Server-only: reads the tax data from disk, through get-page-data. The text
// itself is built by the pure functions in page-intro.ts.

import { loadSalesTax } from "@/data-loaders/sales-tax";
import type { CityPageParams, StatePageParams } from "@/types/page";
import {
  getCityPageData,
  getComparePageData,
  getStatePageData,
} from "./get-page-data";
import {
  calculatorCityIntro,
  calculatorStateIntro,
  comparePairIntro,
  taxTablesCityIntro,
  taxTablesStateIntro,
} from "./page-intro";
import { dashToSnakeCase } from "./string-utils";

export async function getCalculatorStateIntro(params: StatePageParams) {
  const data = await getStatePageData(params);
  return calculatorStateIntro({
    year: data.defaultYear,
    state: data.defaultUSAState,
    federalTaxes: data.defaultFederalTaxes,
    stateTaxes: data.defaultStateTaxes,
  });
}

export async function getCalculatorCityIntro(params: CityPageParams) {
  const data = await getCityPageData(params);
  return calculatorCityIntro({
    year: data.defaultYear,
    state: data.defaultUSAState,
    city: data.defaultUSACity,
    federalTaxes: data.defaultFederalTaxes,
    stateTaxes: data.defaultStateTaxes,
  });
}

export async function getTaxTablesStateIntro(params: StatePageParams) {
  const data = await getStatePageData(params);
  return taxTablesStateIntro({
    year: data.defaultYear,
    state: data.defaultUSAState,
    stateTaxes: data.defaultStateTaxes,
    salesTax: await loadSalesTax(data.defaultYear, data.defaultUSAState),
  });
}

export async function getTaxTablesCityIntro(params: CityPageParams) {
  const data = await getCityPageData(params);
  return taxTablesCityIntro({
    year: data.defaultYear,
    state: data.defaultUSAState,
    city: data.defaultUSACity,
    stateTaxes: data.defaultStateTaxes,
    salesTax: await loadSalesTax(data.defaultYear, data.defaultUSAState),
  });
}

export async function getComparePairIntro(params: {
  year: string;
  stateA: string;
  stateB: string;
}) {
  const [{ defaultFederalTaxes }, a, b] = await Promise.all([
    getComparePageData(params.year),
    getStatePageData({ year: params.year, state: params.stateA }),
    getStatePageData({ year: params.year, state: params.stateB }),
  ]);
  return comparePairIntro({
    year: params.year,
    stateA: dashToSnakeCase(params.stateA),
    stateB: dashToSnakeCase(params.stateB),
    federalTaxes: defaultFederalTaxes,
    stateTaxesA: a.defaultStateTaxes,
    stateTaxesB: b.defaultStateTaxes,
  });
}
