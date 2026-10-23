// Run the calculator for the API and MCP server: load the data a request
// names, validate what can only be checked against that data, and shape the
// result as plain JSON.

import { CITIES, CITY_SCOPE, EXEMPT, FEDERAL_SCOPE } from "@/constants";
import type { FilingStatus } from "@/constants/filing-status";
import type { PaycheckFrequency } from "@/constants/paycheck-frequency";
import { FREQUENCY_TO_PAYCHECKS_PER_YEAR } from "@/constants/paycheck-frequency";
import {
  MAX_401K_CONTRIBUTION,
  NON_TAX_DATA_KEYS,
  NON_WAGE_TAX_TYPES,
} from "@/constants/tax_types";
import type { TaxData, TaxResults, TaxResultsWithCities } from "@/types";
import {
  calculate,
  getPaycheckByFrequency,
  getPercent,
} from "@/utils/calculator";
import type { TaxOption } from "@/utils/get-tax-options";
import { getMarginalRate } from "@/utils/marginal-rate";
import type { Money } from "@/utils/money";
import { asCurrency, toCents, toUnit } from "@/utils/money";
import { standardDeductionFor } from "@/utils/standard-deduction";
import { snakeToDashCase } from "@/utils/string-utils";
import { solveForIncome } from "@/utils/target-income";
import type { CalculateInput, TargetInput } from "./inputs";
import { ANNUAL, normalizeKey } from "./inputs";
import { LATEST_YEAR, TAX_DATA_REGISTRY, YEARS } from "./tax-data-registry";

/** A request that is well-formed but names something the data does not have. */
export class InputError extends Error {
  constructor(
    message: string,
    readonly validValues?: string[],
  ) {
    super(message);
    this.name = "InputError";
  }
}

type Common = Omit<CalculateInput, "income">;

/** Everything `calculate` needs besides income, resolved once per request. */
type Resolved = {
  federal: TaxData;
  stateData: TaxData;
  year: string;
  state: string;
  city: string;
  filingStatus: FilingStatus;
  payFrequency: PaycheckFrequency;
  requestedContribution: number;
  maxContribution: number | undefined;
  federalDeductions: number | undefined;
  stateDeductions: number | undefined;
  exemptions: TaxOption[];
};

/** Keys in a TaxData object that are settings rather than taxes. */
export const NON_TAX_KEYS = [...NON_TAX_DATA_KEYS, CITIES];

function exemptableKeys(taxes: Record<string, unknown> | undefined): string[] {
  return Object.keys(taxes ?? {}).filter(
    (key) => !NON_TAX_KEYS.includes(key) && !NON_WAGE_TAX_TYPES.includes(key),
  );
}

export type Location = {
  year: string;
  federal: TaxData;
  /** "" and undefined when no state was asked for. */
  state: string;
  stateData: TaxData | undefined;
  city: string;
  /** Cities in the state with local tax data. */
  cities: string[];
};

/**
 * Load the federal data for a year and, if one is named, a state's, checking
 * the city against what that state's data actually has.
 */
export async function loadLocation(params: {
  year?: string;
  state?: string;
  city?: string;
}): Promise<Location> {
  const year = params.year ?? LATEST_YEAR;
  const registry = TAX_DATA_REGISTRY[year];
  if (!registry) {
    throw new InputError(`No tax data for ${year}.`, YEARS);
  }
  const state = params.state ? normalizeKey(params.state) : "";
  const loadState = state ? registry.states[state] : undefined;
  if (state && !loadState) {
    throw new InputError(
      `No ${year} tax data for state "${params.state}".`,
      Object.keys(registry.states),
    );
  }
  if (params.city && !state) {
    throw new InputError("A city needs a state.");
  }
  const [{ default: federal }, stateModule] = await Promise.all([
    registry.federal(),
    loadState?.(),
  ]);
  const stateData = stateModule?.default;

  const cities = Object.keys(stateData?.[CITIES] ?? {});
  const city = params.city ? normalizeKey(params.city) : "";
  if (city && !cities.includes(city)) {
    throw new InputError(
      cities.length
        ? `"${params.city}" has no local tax data in ${state}.`
        : `${state} has no cities with local tax data; omit city.`,
      cities,
    );
  }

  return { year, federal, state, stateData, city, cities };
}

async function resolve(input: Common): Promise<Resolved> {
  const { year, federal, state, city, ...location } = await loadLocation(input);
  // A state is required by the input schema, so its data is always loaded.
  const stateData = location.stateData as TaxData;

  const exemptions = input.exempt_taxes.map(({ tax, scope }) => {
    const key = normalizeKey(tax);
    const valid =
      scope === CITY_SCOPE
        ? exemptableKeys(city ? stateData[CITIES]?.[city] : undefined)
        : exemptableKeys(scope === FEDERAL_SCOPE ? federal : stateData);
    if (!valid.includes(key)) {
      throw new InputError(
        `"${tax}" is not a ${scope} tax for this location.`,
        valid,
      );
    }
    return { title: key, value: key, scope, disabled: false };
  });

  return {
    federal,
    stateData,
    year,
    state,
    city,
    filingStatus: input.filing_status,
    payFrequency: input.pay_frequency,
    requestedContribution: input.retirement_contribution,
    maxContribution: federal[MAX_401K_CONTRIBUTION],
    federalDeductions: input.federal_deductions,
    stateDeductions: input.state_deductions,
    exemptions,
  };
}

/**
 * The contribution actually used at this income: never above the year's
 * 401(k) limit (as the calculator UI enforces) or above the income itself.
 */
function contributionAt(resolved: Resolved, income: number): number {
  return Math.min(
    resolved.requestedContribution,
    resolved.maxContribution ?? Infinity,
    income,
  );
}

function run(resolved: Resolved, income: number) {
  return calculate(
    resolved.federal,
    resolved.stateData,
    income,
    resolved.filingStatus,
    contributionAt(resolved, income),
    resolved.federalDeductions,
    resolved.stateDeductions,
    resolved.exemptions,
    resolved.state,
    resolved.city,
  );
}

function amounts(money: Money, income: Money, payFrequency: PaycheckFrequency) {
  return {
    annual: toUnit(money),
    per_paycheck: toUnit(getPaycheckByFrequency(money, payFrequency)),
    percent_of_gross: getPercent(money, income),
  };
}

function breakdown(results: TaxResults | TaxResultsWithCities | undefined) {
  const out: Record<string, number | typeof EXEMPT> = {};
  for (const [taxType, value] of Object.entries(results ?? {})) {
    if (taxType === CITIES || value === undefined) continue;
    out[taxType] = value === EXEMPT ? EXEMPT : toUnit(value as Money);
  }
  return out;
}

function pageUrl(siteUrl: string, resolved: Resolved, income: number): string {
  const path = [resolved.year, resolved.state, resolved.city]
    .filter(Boolean)
    .map(snakeToDashCase)
    .join("/");
  return `${siteUrl}/${path}/?income=${Math.round(income)}`;
}

function describe(resolved: Resolved, income: number, siteUrl: string) {
  const result = run(resolved, income);
  const gross = asCurrency(income);
  const contribution = contributionAt(resolved, income);
  const afterContribution = Math.max(0, income - contribution);
  const taxAt = (atIncome: number) =>
    toUnit(run(resolved, atIncome).totalTaxes);
  const marginal = getMarginalRate(taxAt, income);

  const notes: string[] = [];
  if (contribution < resolved.requestedContribution) {
    notes.push(
      `retirement_contribution reduced from ${resolved.requestedContribution} to ${contribution}: ` +
        (contribution === income
          ? "it cannot exceed income."
          : `the ${resolved.year} 401(k) limit is ${resolved.maxContribution}.`),
    );
  }

  return {
    inputs: {
      year: resolved.year,
      state: resolved.state,
      city: resolved.city || null,
      filing_status: resolved.filingStatus,
      income,
      retirement_contribution: contribution,
      federal_deductions:
        resolved.federalDeductions ??
        standardDeductionFor(
          resolved.federal,
          resolved.filingStatus,
          afterContribution,
        ) ??
        0,
      federal_deductions_source:
        resolved.federalDeductions === undefined ? "standard" : "provided",
      state_deductions:
        resolved.stateDeductions ??
        standardDeductionFor(
          resolved.stateData,
          resolved.filingStatus,
          afterContribution,
        ) ??
        0,
      state_deductions_source:
        resolved.stateDeductions === undefined ? "standard" : "provided",
      exempt_taxes: resolved.exemptions.map(({ value, scope }) => ({
        tax: value,
        scope,
      })),
      pay_frequency: resolved.payFrequency,
      paychecks_per_year:
        FREQUENCY_TO_PAYCHECKS_PER_YEAR[resolved.payFrequency],
    },
    take_home: amounts(result.takeHome.amount, gross, resolved.payFrequency),
    total_taxes: amounts(result.totalTaxes, gross, resolved.payFrequency),
    totals: {
      federal_including_fica: amounts(
        result.totalFederal.amount,
        gross,
        resolved.payFrequency,
      ),
      fica: amounts(result.totalFica.amount, gross, resolved.payFrequency),
      state_including_local: amounts(
        result.totalState.amount,
        gross,
        resolved.payFrequency,
      ),
      local: amounts(result.totalCity.amount, gross, resolved.payFrequency),
    },
    taxable_income: {
      federal: toUnit(result.federalTaxableIncome),
      state: toUnit(result.stateTaxableIncome),
      // Federal income tax a state lets filers subtract before its own rates
      // apply (Oregon); already taken out of `state`. 0 elsewhere.
      state_federal_tax_subtraction: result.stateFederalTaxSubtraction,
    },
    // Nonrefundable credits taken off state income tax; `by_tax.state` and the
    // totals are already net of them.
    state_credits: {
      personal_exemption: result.statePersonalExemptionCredit,
    },
    marginal_tax_rate_percent: Math.round(marginal.percent * 100) / 100,
    by_tax: {
      federal: breakdown(result.federalResults),
      state: breakdown(result.stateResults),
      local: breakdown(result.stateResults[CITIES] as TaxResults | undefined),
    },
    notes,
    source: pageUrl(siteUrl, resolved, income),
  };
}

export type CalculateOutput = ReturnType<typeof describe>;

export async function runCalculate(
  input: CalculateInput,
  siteUrl: string,
): Promise<CalculateOutput> {
  const resolved = await resolve(input);
  return describe(resolved, input.income, siteUrl);
}

export async function runTarget(input: TargetInput, siteUrl: string) {
  const resolved = await resolve(input);
  const periods =
    input.target_period === ANNUAL
      ? 1
      : FREQUENCY_TO_PAYCHECKS_PER_YEAR[
          input.target_period as PaycheckFrequency
        ];
  const annualTarget = input.take_home * periods;

  const solution = solveForIncome(
    (incomeCents) => toCents(run(resolved, incomeCents / 100).takeHome.amount),
    Math.round(annualTarget * 100),
  );
  if (!solution) {
    throw new InputError(
      `A take-home of ${annualTarget} a year is out of range for this calculator.`,
    );
  }

  const income = solution.incomeCents / 100;
  return {
    required_gross_income: income,
    target: {
      take_home: input.take_home,
      target_period: input.target_period,
      annual_take_home: annualTarget,
    },
    result: describe(resolved, income, siteUrl),
  };
}

export type TargetOutput = Awaited<ReturnType<typeof runTarget>>;
