import type { TaxData } from "@/types";
import { useEffect } from "react";
import { updateURL } from "@/utils/url";

type GetTaxData = {
  year: string;
  USAState: string;
  setFederalTaxes: (value: TaxData) => void;
  setStateTaxes: (value: TaxData) => void;
  setUSAState?: (value: string) => void;
  setUSACity?: (value: string) => void;
  baseRoute?: string;
};

export function useTaxData({
  year,
  USAState,
  setFederalTaxes,
  setStateTaxes,
  setUSAState,
  setUSACity,
  baseRoute = "",
}: GetTaxData) {
  useEffect(() => {
    async function fetchFederalBrackets() {
      const federalBrackets = await import(`@/data/${year}/federal.ts`);
      setFederalTaxes(federalBrackets.default);
    }
    fetchFederalBrackets();
  }, [year, setFederalTaxes, setStateTaxes]);

  useEffect(() => {
    async function fetchStateBrackets() {
      if (!USAState) {
        setStateTaxes({} as TaxData);
        return;
      }
      try {
        const stateBrackets = await import(
          `@/data/${year}/state/${USAState}.ts`
        );
        setStateTaxes(stateBrackets.default);
      } catch (error) {
        // If the state tax data doesn't exist for this year,
        // clear the state and city selections and update the URL
        console.warn(
          `Tax data not found for state "${USAState}" in year ${year}. Clearing state selection.`,
        );
        setStateTaxes({} as TaxData);
        if (setUSAState) {
          setUSAState("");
        }
        if (setUSACity) {
          setUSACity("");
        }
        // Update URL to just show the year without state/city
        updateURL(`${baseRoute}/${year}`);
      }
    }
    fetchStateBrackets();
  }, [
    USAState,
    year,
    setFederalTaxes,
    setStateTaxes,
    setUSAState,
    setUSACity,
    baseRoute,
  ]);
}
