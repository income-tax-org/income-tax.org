import { cityTaxKey, snakeToTitleCase } from "./string-utils";
import {
  NON_TAX_DATA_KEYS,
  NON_WAGE_TAX_TYPES,
  STATE_INCOME,
} from "@/constants/tax-types";
import { CITIES, CITY_SCOPE, FEDERAL_SCOPE, STATE_SCOPE } from "@/constants";
import type { TaxData } from "@/types";

export type TaxOption = {
  title: string;
  /**
   * The tax-type key, unqualified. `scope` says which jurisdiction it belongs
   * to: federal and state keys share a namespace, city keys do not, and a
   * generic key like `occupational_tax` or `city_income` could otherwise be
   * exempted in one jurisdiction and silently take effect in another.
   */
  value: string;
  scope: TaxScope;
  disabled: boolean;
};

export type TaxScope =
  | typeof FEDERAL_SCOPE
  | typeof STATE_SCOPE
  | typeof CITY_SCOPE;

type GetTaxOptions = {
  federalTaxes: TaxData;
  stateTaxes: TaxData;
  USACity: string;
  USAState: string;
  /**
   * Drop taxes that are not levied on wages. The calculator offers these as
   * exemptions, and there is nothing to exempt from a tax it does not charge;
   * the tax tables list them as reference and keep them.
   */
  excludeNonWageTaxes?: boolean;
};

/** The selectable tax types for a federal + state (+ city) selection. */
export function getTaxOptions({
  federalTaxes,
  stateTaxes,
  USACity,
  USAState,
  excludeNonWageTaxes = false,
}: GetTaxOptions): TaxOption[] {
  const cities: TaxOption[] = [];
  const federal = Object.entries(federalTaxes || {}).map(([key]) => {
    if (NON_TAX_DATA_KEYS.includes(key)) {
      return null;
    }
    return {
      title: snakeToTitleCase(key),
      value: key,
      scope: FEDERAL_SCOPE,
      disabled: false,
    };
  });
  const state = Object.entries(stateTaxes || {}).map(([key, value]) => {
    if (NON_TAX_DATA_KEYS.includes(key)) {
      return null;
    }
    if (key === CITIES) {
      const cityTaxes = (value as TaxData[typeof CITIES])?.[USACity];
      if (USACity && cityTaxes) {
        for (const cityTaxType of Object.keys(cityTaxes)) {
          cities.push({
            title: snakeToTitleCase(cityTaxKey(USACity, cityTaxType)),
            value: cityTaxType,
            scope: CITY_SCOPE,
            disabled: false,
          });
        }
      }
      return null;
    }
    return {
      title: snakeToTitleCase(
        key === STATE_INCOME ? `${USAState}_${key}` : key,
      ),
      value: key,
      scope: STATE_SCOPE,
      disabled: false,
    };
  });
  return [...federal, ...state, ...cities].filter(
    (option): option is TaxOption =>
      option !== null &&
      !(excludeNonWageTaxes && NON_WAGE_TAX_TYPES.includes(option.value)),
  );
}
