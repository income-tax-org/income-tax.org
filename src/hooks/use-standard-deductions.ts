import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EMPTY_STANDARD_DEDUCTION_MAP } from "@/constants/filing-status";
import type { FilingStatus } from "@/constants/filing-status";
import type { StandardDeductionByFilingStatus } from "@/types";
import {
  isBandedDeduction,
  resolveStandardDeduction,
} from "@/utils/standard-deduction";

type StandardDeductionsArgs = {
  year: string;
  filingStatus: FilingStatus;
  totalIncome: number;
  totalIRA: number;
};

/**
 * The calculator's federal and state deduction fields: prefilled with the
 * standard deduction, kept current as filing status, location and income
 * change, and left alone once the user has typed their own figure.
 *
 * The standard deduction maps are filled in by useTaxOptions, through the
 * setters returned here.
 */
export function useStandardDeductions({
  year,
  filingStatus,
  totalIncome,
  totalIRA,
}: StandardDeductionsArgs) {
  const [totalFederalDeductions, setTotalFederalDeductions] = useState<
    number | undefined
  >(undefined); // undefined until user input
  const [totalStateDeductions, setTotalStateDeductions] = useState<
    number | undefined
  >(undefined); // undefined until user input

  const [federalStandardDeductionMap, setFederalStandardDeductionMap] =
    useState<StandardDeductionByFilingStatus>(EMPTY_STANDARD_DEDUCTION_MAP);
  const [stateStandardDeductionMap, setStateStandardDeductionMap] =
    useState<StandardDeductionByFilingStatus>(EMPTY_STANDARD_DEDUCTION_MAP);

  // What a phased-out standard deduction is measured against: income after
  // retirement contributions, the same figure that feeds taxable income and
  // the closest thing here to the AGI these schedules actually key on.
  const deductionIncome = Math.max(0, totalIncome - totalIRA);

  const federalStandardDeduction = useMemo(
    () =>
      resolveStandardDeduction(
        federalStandardDeductionMap[filingStatus],
        deductionIncome,
      ) ?? 0,
    [federalStandardDeductionMap, filingStatus, deductionIncome],
  );
  const stateStandardDeduction = useMemo(
    () =>
      resolveStandardDeduction(
        stateStandardDeductionMap[filingStatus],
        deductionIncome,
      ) ?? 0,
    [stateStandardDeductionMap, filingStatus, deductionIncome],
  );

  // Whether each jurisdiction's schedule varies with income at all. Only a
  // banded one needs refreshing as income moves, and only a banded one can
  // legitimately resolve to zero.
  const federalIsBanded = isBandedDeduction(
    federalStandardDeductionMap[filingStatus],
  );
  const stateIsBanded = isBandedDeduction(
    stateStandardDeductionMap[filingStatus],
  );

  // Read through refs so the two reset callbacks keep a stable identity as
  // income moves. They are effect dependencies, and refreshing them on every
  // keystroke in the income field would re-run the prefill effects and
  // overwrite a deduction the user had typed.
  const latestStandard = useRef({ federal: 0, state: 0 });
  latestStandard.current = {
    federal: federalStandardDeduction,
    state: stateStandardDeduction,
  };

  // The last figure each field was prefilled with. A field still holding it
  // has not been touched, which is what makes it safe to refresh.
  const autoFilled = useRef<{ federal?: number; state?: number }>({});

  const resetTotalStateDeductions = useCallback(() => {
    autoFilled.current.state = latestStandard.current.state;
    setTotalStateDeductions(latestStandard.current.state);
  }, []);

  const resetTotalFederalDeductions = useCallback(() => {
    autoFilled.current.federal = latestStandard.current.federal;
    setTotalFederalDeductions(latestStandard.current.federal);
  }, []);

  // Unconditional, not guarded on the figure being non-zero. Fifteen states
  // have no standard deduction, and treating their zero as "no data, keep
  // what is there" left the previous state's figure in the field after an
  // in-session switch -- and the calculation used it.
  useEffect(() => {
    resetTotalFederalDeductions();
    resetTotalStateDeductions();
  }, [
    filingStatus,
    federalStandardDeductionMap,
    stateStandardDeductionMap,
    resetTotalFederalDeductions,
    resetTotalStateDeductions,
  ]);

  // Wisconsin and four other states shrink the standard deduction as income
  // rises, so the prefilled figure is only right for the income it was
  // resolved at. Refresh it as income crosses a band -- but only while the
  // field still holds what we put there. Once the user has typed their own
  // number it is theirs, and the reset control is how they come back.
  //
  // Keyed on whether the schedule is banded rather than on the resolved
  // figure being non-zero: Wisconsin allows a single filer nothing at all
  // above $132,549, and a truthiness check there would leave the field
  // holding the last non-zero figure -- which is the deduction the
  // calculation would then use.
  useEffect(() => {
    if (
      federalIsBanded &&
      totalFederalDeductions === autoFilled.current.federal
    ) {
      resetTotalFederalDeductions();
    }
    if (stateIsBanded && totalStateDeductions === autoFilled.current.state) {
      resetTotalStateDeductions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    federalStandardDeduction,
    stateStandardDeduction,
    federalIsBanded,
    stateIsBanded,
  ]);

  useEffect(() => {
    if (
      typeof totalFederalDeductions === "undefined" &&
      federalStandardDeductionMap[filingStatus]
    ) {
      resetTotalFederalDeductions();
    }
    if (
      typeof totalStateDeductions === "undefined" &&
      stateStandardDeductionMap[filingStatus]
    ) {
      resetTotalStateDeductions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateStandardDeductionMap, federalStandardDeductionMap]);

  // A banded deduction is only the standard one *at this income*, and saying
  // so is the difference between a figure the reader can trust and one that
  // looks wrong when it moves.
  const standardDeductionLabel = useCallback(
    (banded: boolean) =>
      banded
        ? `Standard deduction for ${year} at this income`
        : `Standard deduction for ${year}`,
    [year],
  );

  // A zero deduction is only worth labelling when a schedule genuinely
  // allows nothing at this income. For a flat state it just means no data has
  // loaded yet.
  const standardStateDeductionDisplay = useMemo(() => {
    if (stateStandardDeduction !== totalStateDeductions) return null;
    if (stateStandardDeduction === 0 && !stateIsBanded) return null;
    return standardDeductionLabel(stateIsBanded);
  }, [
    stateStandardDeduction,
    stateIsBanded,
    totalStateDeductions,
    standardDeductionLabel,
  ]);

  const standardFederalDeductionDisplay = useMemo(() => {
    if (federalStandardDeduction !== totalFederalDeductions) return null;
    if (federalStandardDeduction === 0 && !federalIsBanded) return null;
    return standardDeductionLabel(federalIsBanded);
  }, [
    federalStandardDeduction,
    federalIsBanded,
    totalFederalDeductions,
    standardDeductionLabel,
  ]);

  return {
    totalFederalDeductions,
    setTotalFederalDeductions,
    totalStateDeductions,
    setTotalStateDeductions,
    setFederalStandardDeductionMap,
    setStateStandardDeductionMap,
    federalStandardDeduction,
    stateStandardDeduction,
    resetTotalFederalDeductions,
    resetTotalStateDeductions,
    standardFederalDeductionDisplay,
    standardStateDeductionDisplay,
  };
}
