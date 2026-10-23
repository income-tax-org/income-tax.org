import type { Money } from "./money";
import {
  ZERO,
  add,
  asCurrency,
  divideMoney,
  greaterThanOrEqual,
  lessThanOrEqual,
  minimum,
  multiplyMoney,
  percentage,
  subtract,
  toCents,
  toUnit,
} from "./money";
import type { FilingStatus } from "@/constants/filing-status";
import { ALL } from "@/constants/filing-status";
import {
  federalTaxSubtractionFor,
  personalExemptionCreditFor,
  standardDeductionFor,
} from "./standard-deduction";
import type {
  BracketSchedule,
  FlatFeeBracket,
  RateBracket,
  TaxBasis,
  TaxData,
  TaxResults,
  TaxResultsWithCities,
} from "@/types";
import {
  CALIFORNIA_SDI,
  COLORADO_FAMLI,
  CT_PAID_FAMILY_AND_MEDICAL_LEAVE,
  DC_PAID_FAMILY_LEAVE,
  EMPLOYEE_PAYROLL_TAX,
  FEDERAL_INCOME,
  HI_TEMPORARY_DISABILITY_INSURANCE,
  MEDICARE,
  NJ_DISABILITY_INSURANCE,
  NJ_FAMILY_LEAVE_INSURANCE,
  NJ_UNEMPLOYMENT_INSURANCE,
  NJ_WORKFORCE_DEVELOPMENT,
  NONE,
  NON_TAX_DATA_KEYS,
  NON_WAGE_TAX_TYPES,
  NY_DISABILITY_INSURANCE,
  NY_PAID_FAMILY_LEAVE,
  OCCUPATIONAL_TAX,
  OREGON_PAID_FAMILY_AND_MEDICAL_LEAVE,
  OREGON_TRANSIT_TAX,
  RI_TEMPORARY_DISABILITY_INSURANCE,
  SOCIAL_SECURITY,
  STATE_INCOME,
  WASHINGTON_CARES_FUND,
} from "@/constants/tax_types";
import {
  CITIES,
  CITY_SCOPE,
  EXEMPT,
  GROSS_INCOME_BASIS,
  INFINITY,
  STATE_INCOME_TAX_BASIS,
  TAXABLE_INCOME_BASIS,
  TAX_FREQUENCY_PERIODS_PER_YEAR,
} from "@/constants";
import type { TaxOption } from "./get-tax-options";
import type { PaycheckFrequency } from "@/constants/paycheck-frequency";
import { FREQUENCY_TO_PAYCHECKS_PER_YEAR } from "@/constants/paycheck-frequency";
import type { TaxFrequency } from "@/types";

// Taxes levied on wages rather than on income after deductions.
//
// Two groups, same treatment. FICA and the state paid-leave/disability programs
// are statutorily computed on gross wages: neither standard nor itemized
// deductions reduce them, and neither does a pre-tax retirement contribution.
// A 401(k) elective deferral reduces W-2 box 1 only — boxes 3 and 5, the Social
// Security and Medicare wage figures, are unchanged by it, because elective
// deferrals remain "subject to Social Security (FICA), Medicare, and federal
// unemployment taxes" (IRS Topic No. 424). Local occupational and payroll taxes
// land here for the same practical reason: they are withheld from gross wages,
// so a state standard deduction must not shrink their base either.
//
// Everything not listed here is computed on income after the retirement
// contribution and after deductions. That is correct for genuine income taxes,
// including the city and county income taxes that start from state taxable
// income (Maryland, Indiana, NYC).
const grossIncomeTaxes = [
  SOCIAL_SECURITY,
  MEDICARE,
  CALIFORNIA_SDI,
  WASHINGTON_CARES_FUND,
  OREGON_PAID_FAMILY_AND_MEDICAL_LEAVE,
  // Listed for its base, though NON_WAGE_TAX_TYPES stops it being charged at
  // all: D.C. levies it on the employer. Kept here so that if the District
  // ever shifts it onto employees, the base is already right.
  DC_PAID_FAMILY_LEAVE,
  NJ_DISABILITY_INSURANCE,
  NJ_FAMILY_LEAVE_INSURANCE,
  NJ_UNEMPLOYMENT_INSURANCE,
  NJ_WORKFORCE_DEVELOPMENT,
  NY_PAID_FAMILY_LEAVE,
  NY_DISABILITY_INSURANCE,
  RI_TEMPORARY_DISABILITY_INSURANCE,
  HI_TEMPORARY_DISABILITY_INSURANCE,
  COLORADO_FAMLI,
  CT_PAID_FAMILY_AND_MEDICAL_LEAVE,
  // Alabama and Kentucky municipal occupational taxes: withheld from gross
  // salaries and wages.
  OCCUPATIONAL_TAX,
  // Oregon statewide transit tax: computed on gross wages before any
  // exemptions or deductions.
  OREGON_TRANSIT_TAX,
  // Eugene's community safety payroll tax: applied to wages, not to income
  // after the Oregon standard deduction.
  EMPLOYEE_PAYROLL_TAX,
];

export function calculate(
  federalTaxData: TaxData,
  stateTaxData: TaxData,
  income: number,
  filingStatus: FilingStatus,
  totalIRA: number,
  totalFederalDeductions: number | undefined,
  totalStateDeductions: number | undefined,
  exemptTaxes: TaxOption[],
  selectedState: string,
  selectedCity: string,
) {
  const totalIncome = asCurrency(income);
  // Matched against bare tax-type keys, so a city option's key must not be
  // mixed in with the federal and state ones: the two namespaces overlap.
  const exemptions = exemptTaxes
    .filter((tax) => tax.scope !== CITY_SCOPE)
    .map((tax) => tax.value);
  const cityExemptions = exemptTaxes
    .filter((tax) => tax.scope === CITY_SCOPE)
    .map((tax) => tax.value);

  const {
    taxesPerBracket: federalResults,
    taxableIncome: federalTaxableIncome,
  } = calculateTaxesPerBracket(
    federalTaxData,
    totalIncome,
    filingStatus,
    totalIRA,
    totalFederalDeductions,
    exemptions,
  );

  const {
    taxesPerBracket: stateResults,
    taxableIncome: stateTaxableIncome,
    federalTaxSubtraction: stateFederalTaxSubtraction,
    personalExemptionCredit: statePersonalExemptionCredit,
  } = calculateTaxesPerBracket(
    stateTaxData,
    totalIncome,
    filingStatus,
    totalIRA,
    totalStateDeductions,
    exemptions,
    selectedState,
    selectedCity,
    cityExemptions,
    ZERO,
    computedTaxOrZero(federalResults[FEDERAL_INCOME]),
  );

  const totals = sumTotals(totalIncome, federalResults, stateResults, totalIRA);

  return {
    ...totals,
    federalTaxableIncome,
    stateTaxableIncome,
    stateFederalTaxSubtraction,
    statePersonalExemptionCredit,
  };
}

/**
 * A computed result read back as an amount of money.
 *
 * `taxesPerBracket` holds either a Money or the EXEMPT sentinel, which is a
 * string. `?? ZERO` does not catch the sentinel -- it is neither null nor
 * undefined -- and handing it to a Dinero operation throws
 * "dineroObject.toJSON is not a function". `calculate` runs inside a
 * render-time useMemo, so that took the results section down with it.
 *
 * Zero is also the right answer rather than merely a safe one: a filer exempt
 * from New York's income tax owes nothing on a surcharge levied on that tax.
 */
function computedTaxOrZero(result: TaxResultsWithCities[string]): Money {
  return result === undefined || result === EXEMPT ? ZERO : (result as Money);
}

export function calculateTaxesPerBracket(
  taxData: TaxData,
  totalIncome: Money,
  filingStatus: FilingStatus,
  totalIRA: number,
  totalDeductions: number | undefined,
  exemptions: string[],
  selectedState?: string,
  selectedCity?: string,
  /**
   * Exemptions for the selected city, kept out of `exemptions` because the
   * two namespaces overlap: matching is by bare tax-type key, and a city and
   * its state can both use `occupational_tax` or `city_income`.
   */
  cityExemptions: string[] = [],
  /**
   * The state's own income tax, for a city surcharge charged on it rather
   * than on income. Only the city pass receives this; see the CITIES branch.
   */
  stateIncomeTax: Money = ZERO,
  /**
   * The federal income tax already computed, for a state that lets filers
   * subtract it (FEDERAL_TAX_SUBTRACTION). Only the state pass receives this.
   */
  federalIncomeTax: Money = ZERO,
): {
  taxesPerBracket: TaxResultsWithCities;
  taxableIncome: Money;
  /** Dollars of federal tax subtracted; 0 where none is allowed. */
  federalTaxSubtraction: number;
  /** Dollars of credit taken off this pass's state income tax. */
  personalExemptionCredit: number;
} {
  if (!taxData) {
    const taxableIncome = subtract(totalIncome, asCurrency(totalIRA));
    return {
      taxesPerBracket: {},
      taxableIncome,
      federalTaxSubtraction: 0,
      personalExemptionCredit: 0,
    };
  }

  // Wages as reported in W-2 boxes 3 and 5, the base for every tax in
  // `grossIncomeTaxes`. A pre-tax 401(k) deferral reduces box 1 only, so it
  // must not reduce the base for FICA or for the state wage programs; a
  // deductible traditional IRA contribution is the same, a deduction taken on
  // the 1040 out of wages that were already taxed for FICA.
  const ficaWages = totalIncome;

  // W-2 box 1: wages after the retirement contribution, before deductions.
  // Also the proxy for AGI that an income-phased standard deduction is
  // measured against -- see resolveStandardDeduction.
  const incomeAfterRetirement = subtract(totalIncome, asCurrency(totalIRA));

  // If no custom deductions provided, use standard deduction from tax data.
  // Resolved here rather than earlier because a phased-out deduction depends
  // on income: five states shrink theirs as income rises.
  let deductions = totalDeductions;
  if (deductions === undefined) {
    deductions = standardDeductionFor(
      taxData,
      filingStatus,
      toUnit(incomeAfterRetirement),
    );
  }

  // Oregon lets filers subtract federal income tax, up to a cap that phases
  // out with AGI. It is a subtraction from income rather than a deduction, so
  // it applies on top of an itemized figure the user enters, not instead of it.
  const federalTaxSubtraction = federalTaxSubtractionFor(
    taxData,
    filingStatus,
    toUnit(incomeAfterRetirement),
    toUnit(federalIncomeTax),
  );

  // Taxable income after deductions (used for income taxes)
  const taxableIncome = subtract(
    incomeAfterRetirement,
    asCurrency((deductions || 0) + federalTaxSubtraction),
  );

  const taxesPerBracket = {} as TaxResultsWithCities;
  let deferredCities: TaxData[typeof CITIES] | undefined;
  Object.entries(taxData).forEach(([taxType, taxTypeData]) => {
    // Taxes the tax tables document but the modelled employee does not pay --
    // levied on investment income, or borne by the employer. Note this reaches
    // a *city's* taxes only because the CITIES branch below recurses into this
    // same function, so the second pass runs this check again. Flattening that
    // recursion would silently stop excluding them at the city level.
    if (NON_WAGE_TAX_TYPES.includes(taxType)) {
      return;
    }
    if (NON_TAX_DATA_KEYS.includes(taxType)) {
      return;
    }
    if (exemptions.includes(taxType)) {
      taxesPerBracket[taxType] = EXEMPT;
      return;
    }
    if (taxTypeData === NONE) {
      taxesPerBracket[taxType] = asCurrency(0);
      return;
    }
    if (taxType === CITIES) {
      // Handled after this loop, not inside it. Yonkers' surcharge is charged
      // on the state's own income tax, so that has to be finished first --
      // and every state file happens to list CITIES last today, which is
      // exactly the kind of silent ordering dependency worth not having.
      deferredCities = taxTypeData as TaxData[typeof CITIES];
      return;
    }

    const brackets = scheduleForFilingStatus(taxTypeData, filingStatus);
    if (!brackets?.length) {
      return;
    }

    if (isFlatFeeSchedule(brackets)) {
      taxesPerBracket[taxType] = calculateFlatFee(
        brackets,
        ficaWages,
        taxableIncome,
      );
      return;
    }

    // FICA and payroll taxes use gross wages, income taxes use taxable income,
    // and a city surcharge may be charged on the state's tax rather than on
    // income at all. A schedule may override the tax type's default where the
    // type alone does not settle it -- `city_income` covers Yonkers, the
    // Missouri earnings taxes and Ohio's municipal taxes, which use all three.
    const declaredBasis = incomeBasisFor(taxType, brackets);
    const incomeBase =
      declaredBasis === GROSS_INCOME_BASIS
        ? ficaWages
        : declaredBasis === STATE_INCOME_TAX_BASIS
          ? stateIncomeTax
          : taxableIncome;

    if (isRateLookupSchedule(brackets)) {
      taxesPerBracket[taxType] = calculateRateLookup(incomeBase, brackets);
      return;
    }
    if (isBaseAmountSchedule(brackets)) {
      taxesPerBracket[taxType] = calculateBaseAmountSchedule(
        incomeBase,
        brackets,
      );
      return;
    }
    taxesPerBracket[taxType] = calculateTaxBracket(incomeBase, brackets);
  });

  // Oregon's exemption credit comes off the state's own income tax: never
  // below zero, since it is nonrefundable, and never off payroll or local
  // taxes. Applied before the city pass so that a surcharge levied on the
  // state's tax would see the tax after credits.
  let personalExemptionCredit = 0;
  const stateIncomeTaxBeforeCredits = taxesPerBracket[STATE_INCOME];
  if (
    stateIncomeTaxBeforeCredits !== undefined &&
    stateIncomeTaxBeforeCredits !== EXEMPT
  ) {
    const credit = personalExemptionCreditFor(
      taxData,
      filingStatus,
      toUnit(incomeAfterRetirement),
    );
    if (credit > 0) {
      const applied = minimum([
        stateIncomeTaxBeforeCredits as Money,
        asCurrency(credit),
      ]);
      taxesPerBracket[STATE_INCOME] = subtract(
        stateIncomeTaxBeforeCredits as Money,
        applied,
      );
      personalExemptionCredit = toUnit(applied);
    }
  }

  if (deferredCities) {
    const cityTaxes =
      selectedState && selectedCity ? deferredCities[selectedCity] : undefined;
    if (cityTaxes) {
      // A city that declares its own standard deduction is measured against
      // it; passing `undefined` lets the recursive call run its own lookup.
      // Every city in the data today declares none and so starts from the
      // state's already-resolved figure, which is right for the city and
      // county income taxes that begin at state taxable income. That figure
      // includes the federal tax subtraction: Portland's and Multnomah
      // County's taxes start from Oregon taxable income, which is after it.
      const cityDeductions =
        standardDeductionFor(
          cityTaxes,
          filingStatus,
          toUnit(incomeAfterRetirement),
        ) === undefined
          ? (deductions || 0) + federalTaxSubtraction
          : undefined;

      // Recursing rather than looping is what gives a city's taxes the same
      // treatment as a state's: the non-wage exclusion, the standard
      // deduction lookup, the flat-fee and basis handling all run again on
      // the second pass. See the NON_WAGE_TAX_TYPES check above.
      taxesPerBracket.cities = calculateTaxesPerBracket(
        cityTaxes,
        totalIncome,
        filingStatus,
        totalIRA,
        cityDeductions,
        // City exemptions travel separately so that exempting a city tax
        // cannot also exempt a federal or state tax that happens to share
        // its key -- `occupational_tax` and `city_income` are generic enough
        // to collide as coverage grows.
        cityExemptions,
        selectedState,
        selectedCity,
        [],
        // Whatever the state's own income tax came to, for a surcharge levied
        // on it rather than on income.
        computedTaxOrZero(taxesPerBracket[STATE_INCOME]),
      ).taxesPerBracket as TaxResults;
    }
  }

  return {
    taxesPerBracket,
    taxableIncome,
    federalTaxSubtraction,
    personalExemptionCredit,
  };
}

/**
 * Which income figure a tax is measured against.
 *
 * FICA and payroll taxes are levied on gross wages -- before deductions and
 * before any pre-tax retirement contribution -- while income taxes are levied
 * on income after both, and Yonkers' resident surcharge is levied on the
 * state's computed tax rather than on income at all. A schedule may override
 * the tax type's default where the type alone does not settle it, which
 * `city_income` needs: it covers Yonkers' surcharge, the Missouri earnings
 * taxes levied on wages, and Ohio's municipal taxes on qualifying wages.
 *
 * Exported so anything displaying a schedule measures it against the same
 * base the calculation used. Drawing a payroll tax against taxable income
 * would put the taxpayer in the wrong band.
 */
export function incomeBasisFor(
  taxType: string,
  brackets: BracketSchedule,
): TaxBasis {
  const declaredBasis = (brackets[0] as { basis?: TaxBasis } | undefined)
    ?.basis;
  if (declaredBasis) return declaredBasis;
  return grossIncomeTaxes.includes(taxType)
    ? GROSS_INCOME_BASIS
    : TAXABLE_INCOME_BASIS;
}

/**
 * The bracket list a tax applies to this taxpayer.
 *
 * Brackets are keyed either by ALL (the tax applies the same way to every
 * filing status) or by the individual filing status. Values that are not
 * bracket maps at all -- a bare number, the NONE sentinel -- yield undefined.
 */
export function scheduleForFilingStatus(
  taxTypeData: TaxData[string],
  filingStatus: FilingStatus,
): BracketSchedule | undefined {
  if (!taxTypeData || typeof taxTypeData !== "object") {
    return undefined;
  }
  // BracketsByFilingStatus is a union of two mapped types and so carries no
  // index signature to read through. The keys are checked by
  // scripts/validate-tax-data.ts.
  const byStatus = taxTypeData as Record<string, BracketSchedule | undefined>;
  const schedule = byStatus[ALL] ?? byStatus[filingStatus];
  return Array.isArray(schedule) ? schedule : undefined;
}

export function isFlatFeeSchedule(
  brackets: BracketSchedule,
): brackets is FlatFeeBracket[] {
  return (
    typeof (brackets[0] as FlatFeeBracket | undefined)?.amount !== "undefined"
  );
}

/**
 * Fixed-dollar taxes: a flat fee owed once the taxpayer clears an income
 * threshold. Portland's Arts Tax and the Colorado / West Virginia occupational
 * privilege taxes work this way.
 *
 * Thresholds are inclusive ("$1,000 or more of annual income", "$500 per month
 * or more"), and are written against gross wages rather than income after
 * deductions — so `basis` defaults to gross, the same true-wage figure the
 * rate schedules in `grossIncomeTaxes` use. Portland's 2026 Arts Tax is the
 * exception: it tests Oregon taxable income, and declares `basis: "taxable"`.
 *
 * Where a schedule has several tiers the highest one the taxpayer qualifies for
 * applies; the fees are not cumulative. The tier is picked by its `min`, not by
 * its position, so a schedule written in descending order charges the same fee
 * as the same schedule written ascending.
 */
function calculateFlatFee(
  brackets: FlatFeeBracket[],
  grossWages: Money,
  taxableIncome: Money,
): Money {
  let owed = asCurrency(0);
  let highestQualifyingMin = -Infinity;

  for (const bracket of brackets) {
    const incomeBase =
      bracket.basis === TAXABLE_INCOME_BASIS ? taxableIncome : grossWages;
    // No income, no fee. Sheridan's and six West Virginia city fees are
    // written without a `min` because those cities publish no threshold, not
    // because they charge someone earning nothing -- and with `min` absent the
    // threshold test passes at zero. Compare renders income 0 on first load,
    // where this showed up as a take-home of -$260.00 for Huntington.
    if (toUnit(incomeBase) <= 0) {
      continue;
    }
    const min = bracket.min || 0;
    if (toUnit(incomeBase) < min || min < highestQualifyingMin) {
      continue;
    }
    let amount = asCurrency(bracket.amount);
    if (bracket.frequency) {
      amount = multiplyMoney(
        amount,
        TAX_FREQUENCY_PERIODS_PER_YEAR[bracket.frequency as TaxFrequency],
      );
    }
    owed = amount;
    highestQualifyingMin = min;
  }

  return owed;
}

/**
 * A rate-lookup schedule charges one rate on the whole income base; `min` and
 * `max` say which rate applies rather than which slice of income is taxed.
 *
 * Eugene's community safety payroll tax is the only one so far. Its published
 * chart is explicit: "The purpose of the tax rate chart is to obtain the rate to
 * be applied to *all* subject wages paid in a pay period." Charging it
 * marginally understated the tax at every income above the exempt threshold.
 */
export function isRateLookupSchedule(
  brackets: BracketSchedule,
): brackets is RateBracket[] {
  return (brackets[0] as RateBracket | undefined)?.rate_on_total === true;
}

function calculateRateLookup(income: Money, brackets: RateBracket[]): Money {
  const amount = toUnit(income);
  // Bands are half-open, matching the contiguous `max === next min` convention
  // the rest of the data uses and the charts' own "at least X but less than Y".
  const bracket = brackets.find(
    (candidate) =>
      amount >= candidate.min &&
      (candidate.max === INFINITY || amount < (candidate.max as number)),
  );
  if (!bracket) {
    return asCurrency(0);
  }
  return percentage(income, bracket.rate);
}

/**
 * A schedule whose bands carry the tax already owed at their floor, rather
 * than being pure marginal slices.
 *
 * Ohio is the only one so far. Its statute reads "$342.00 plus 2.750% of the
 * amount in excess of $26,050", and that $342 is *not* the cumulative tax from
 * the bands below -- those are taxed at 0%. The tax function therefore steps:
 * nothing at $26,050, $342.03 at $26,051. Modelling it marginally undercharged
 * every Ohio filer above the threshold by the whole base, worst proportionally
 * at the bottom, where a filer owing $450 was charged $109.
 */
export function isBaseAmountSchedule(
  brackets: BracketSchedule,
): brackets is RateBracket[] {
  return (brackets[0] as RateBracket | undefined)?.base_amount !== undefined;
}

function calculateBaseAmountSchedule(
  income: Money,
  brackets: RateBracket[],
): Money {
  const amount = toUnit(income);

  // The row that applies is the one with the highest floor *strictly* below
  // the income. The schedule reads "over $26,050 but not over $100,000", so
  // income sitting exactly on a threshold still belongs to the row beneath it
  // -- which is what makes the base a step rather than a rate. Ohio charges
  // nothing at $26,050 and $342.03 at $26,051.
  let applicable: RateBracket | undefined;
  for (const bracket of brackets) {
    if (amount > bracket.min) {
      applicable = bracket;
    }
  }
  if (!applicable) {
    return asCurrency(0);
  }

  return add(
    asCurrency(applicable.base_amount ?? 0),
    percentage(subtract(income, asCurrency(applicable.min)), applicable.rate),
  );
}

function calculateTaxBracket(income: Money, brackets: RateBracket[]): Money {
  let totalTax = asCurrency(0);
  let incomeTaxed = asCurrency(0);

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    let minBracket = asCurrency(bracket.min);

    const maxBracket = asCurrency(
      bracket.max === INFINITY ? toUnit(income) : (bracket.max as number),
    );

    const max = minimum([income, maxBracket]);
    let bracketRange = subtract(max, minBracket);
    if (lessThanOrEqual(bracketRange, asCurrency(0))) {
      break;
    }

    let totalBracketAmount = percentage(bracketRange, bracket.rate);
    if (bracket.percent_of_total) {
      totalBracketAmount = percentage(
        totalBracketAmount,
        bracket.percent_of_total,
      );
    }
    totalTax = add(totalTax, totalBracketAmount);
    incomeTaxed = add(incomeTaxed, bracketRange);

    if (greaterThanOrEqual(incomeTaxed, income)) {
      break;
    }
  }

  return totalTax;
}

export function sumTotals(
  totalIncome: Money,
  federalResults: TaxResultsWithCities,
  stateResults: TaxResultsWithCities,
  totalIRA: number,
) {
  let totalFederal = sumBracketsByTaxType(
    federalResults,
    Object.keys(federalResults),
  );
  const totalFica = sumBracketsByTaxType(federalResults, [
    SOCIAL_SECURITY,
    MEDICARE,
  ]);
  let totalState = sumBracketsByTaxType(
    stateResults,
    Object.keys(stateResults),
  );
  let totalCity = asCurrency(0);
  if (stateResults[CITIES]) {
    totalCity = sumBracketsByTaxType(
      stateResults[CITIES] as TaxResults,
      Object.keys(stateResults[CITIES]),
    );
  }

  if (lessThanOrEqual(totalCity, asCurrency(0))) {
    totalCity = asCurrency(0);
  }
  if (lessThanOrEqual(totalState, asCurrency(0))) {
    totalState = asCurrency(0);
  }
  if (lessThanOrEqual(totalFederal, asCurrency(0))) {
    totalFederal = asCurrency(0);
  }

  totalState = add(totalState, totalCity);

  let totalTaxes = add(totalFederal, totalState);

  const taxableIncome = subtract(totalIncome, asCurrency(totalIRA));

  const takeHome = subtract(subtract(taxableIncome, totalFederal), totalState);

  // Percentages are of gross income, not of income after retirement
  // contributions. Against the smaller base these read as a higher effective
  // rate than the user actually pays, and they disagree with the breakdown
  // bar, which apportions gross. With no 401k contribution the two bases are
  // identical, so this only moves when a contribution is entered -- and there
  // the shortfall from 100% is exactly the contribution.
  return {
    takeHome: {
      percent: getPercent(takeHome, totalIncome),
      amount: takeHome,
    },
    totalTaxes,
    totalFederal: {
      percent: getPercent(totalFederal, totalIncome),
      amount: totalFederal,
    },
    totalState: {
      percent: getPercent(totalState, totalIncome),
      amount: totalState,
    },
    totalCity: {
      percent: getPercent(totalCity, totalIncome),
      amount: totalCity,
    },
    totalFica: {
      percent: getPercent(totalFica, totalIncome),
      amount: totalFica,
    },
    federalResults,
    stateResults,
  };
}

// Sum all values in results under specified keys
export function sumBracketsByTaxType(
  results: TaxResultsWithCities,
  taxTypes: string[],
): Money {
  let total = ZERO;
  for (const taxType of taxTypes) {
    if (results[taxType] === EXEMPT || taxType === CITIES) {
      continue;
    }
    if (results[taxType]) {
      total = add(total, results[taxType] as Money);
    }
  }
  return total;
}

// Determine the percentage of two money values
export function getPercent(amount: Money, total: Money): number {
  const totalAmount = toCents(total);
  // Guard the divide. Reachable from the UI: contributing the 401k maximum
  // against an income equal to it leaves a zero base, which otherwise renders
  // as "NaN%" in every row of the breakdown table.
  if (totalAmount === 0) {
    return 0;
  }
  return Math.round((toCents(amount) / totalAmount) * 10000) / 100;
}

export function getPaycheckByFrequency(
  totalIncome: Money,
  paycheckFrequency: PaycheckFrequency,
) {
  return divideMoney(
    totalIncome,
    FREQUENCY_TO_PAYCHECKS_PER_YEAR[paycheckFrequency],
  );
}
