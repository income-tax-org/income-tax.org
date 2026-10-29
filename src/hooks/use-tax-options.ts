import { useMemo } from "react";
import {
  MAX_401K_CONTRIBUTION,
  STANDARD_DEDUCTION,
} from "@/constants/tax-types";
import type { StandardDeductionByFilingStatus, TaxData } from "@/types";
import { EMPTY_STANDARD_DEDUCTION_MAP } from "@/constants/filing-status";
import { getTaxOptions } from "@/utils/get-tax-options";
import type { TaxOption } from "@/utils/get-tax-options";

type UseTaxOptions = {
  federalTaxes: TaxData;
  stateTaxes: TaxData;
  USACity: string;
  USAState: string;
  /**
   * Lifted as declared, not resolved. A phased-out deduction is a schedule
   * rather than a number, and only the caller knows the income to resolve it
   * against.
   */
  setFederalStandardDeductionMap: (
    value: StandardDeductionByFilingStatus,
  ) => void;
  setStateStandardDeductionMap: (
    value: StandardDeductionByFilingStatus,
  ) => void;
  setMax401KContribution: (value: number) => void;
  /** See `getTaxOptions`. */
  excludeNonWageTaxes?: boolean;
};

export function useTaxOptions({
  federalTaxes,
  stateTaxes,
  USACity,
  USAState,
  setFederalStandardDeductionMap,
  setStateStandardDeductionMap,
  setMax401KContribution,
  excludeNonWageTaxes = false,
}: UseTaxOptions): TaxOption[] {
  return useMemo(() => {
    // Lifted unconditionally, not only when the key is present.
    //
    // Fifteen states declare no standard deduction, and reporting one only
    // when a file happens to have the key meant the previous state's figure
    // survived an in-session switch -- and was then applied. Moving from New
    // York to Pennsylvania charged $2,824.40 instead of $3,070.00 at
    // $100,000, with the field still captioned "Standard deduction for 2025",
    // so the page asserted Pennsylvania had New York's $8,000. A fresh load
    // was fine, which is what kept it hidden.
    //
    // EMPTY_STANDARD_DEDUCTION_MAP is a module constant, so a state that
    // declares none reports the same object every time and React bails out of
    // the update rather than looping.
    setFederalStandardDeductionMap(
      (federalTaxes?.[STANDARD_DEDUCTION] as
        | StandardDeductionByFilingStatus
        | undefined) ?? EMPTY_STANDARD_DEDUCTION_MAP,
    );
    setStateStandardDeductionMap(
      (stateTaxes?.[STANDARD_DEDUCTION] as
        | StandardDeductionByFilingStatus
        | undefined) ?? EMPTY_STANDARD_DEDUCTION_MAP,
    );
    if (federalTaxes && MAX_401K_CONTRIBUTION in federalTaxes) {
      setMax401KContribution(federalTaxes[MAX_401K_CONTRIBUTION] as number);
    }

    return getTaxOptions({
      federalTaxes,
      stateTaxes,
      USACity,
      USAState,
      excludeNonWageTaxes,
    });
  }, [
    federalTaxes,
    stateTaxes,
    USACity,
    USAState,
    setFederalStandardDeductionMap,
    setStateStandardDeductionMap,
    setMax401KContribution,
    excludeNonWageTaxes,
  ]);
}
