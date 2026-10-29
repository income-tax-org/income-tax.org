// The tax_tables tool: the schedules the calculator uses, as plain JSON.
//
// The data files are close to JSON already, but read naively several of them
// mean something other than what they appear to. Ohio's brackets carry a base
// amount that is not the sum of the bands below, Eugene's rate applies to all
// wages rather than a slice, a split payroll tax's rate is the combined one,
// and some taxes are charged on gross wages or on another tax rather than on
// taxable income. Each schedule is therefore labelled with its `kind` and
// `basis`, and the response explains the ones it contains, so a model reading
// it can tell which arithmetic applies -- and is pointed at `calculate` for
// the dollar figures, which handles all of this already.
//
// Sales tax rides along for a state, as rates by period: a rate that changed
// during the year is listed once per run of months, never averaged.

import {
  ANNUALLY,
  BASE_AMOUNT_SCHEDULE,
  FLAT_FEE_SCHEDULE,
  GROSS_INCOME_BASIS,
  INFINITY,
  MARGINAL_SCHEDULE,
  RATE_ON_TOTAL_SCHEDULE,
  STATE_INCOME_TAX_BASIS,
  TAXABLE_INCOME_BASIS,
  TAX_FREQUENCY_PERIODS_PER_YEAR,
} from "@/constants";
import { ALL } from "@/constants/filing-status";
import type { FilingStatus } from "@/constants/filing-status";
import {
  FEDERAL_TAX_SUBTRACTION,
  MAX_401K_CONTRIBUTION,
  NONE,
  PERSONAL_EXEMPTION_CREDIT,
  NON_WAGE_TAX_TYPES,
  SALES_TAX,
  STANDARD_DEDUCTION,
} from "@/constants/tax-types";
import type {
  BracketSchedule,
  DeductionBand,
  FlatFeeBracket,
  RateBracket,
  SalesTaxData,
  StandardDeductionByFilingStatus,
  TaxData,
  TaxFrequency,
} from "@/types";
import type { ScheduleKind } from "@/utils/calculator";
import {
  incomeBasisFor,
  scheduleForFilingStatus,
  scheduleKind,
} from "@/utils/calculator";
import { asCurrency, multiplyMoney, toUnit } from "@/utils/money";
import {
  localSalesTaxRates,
  salesTaxCitiesFor,
  salesTaxPeriods,
  salesTaxRatesFor,
  stateSalesTaxRates,
  usesAverageLocalRate,
} from "@/utils/sales-tax";
import { snakeToDashCase } from "@/utils/string-utils";
import { TAX_DATA_REGISTRY, YEARS } from "@/data-loaders/registry";
import type { TaxTablesInput } from "./inputs";
import { normalizeKey } from "./inputs";
import { InputError, loadLocation, NON_TAX_KEYS } from "./run";

const NO_TAX = "none";

type Kind = ScheduleKind | typeof NO_TAX;

const KIND_NOTES: Record<Kind, string> = {
  [MARGINAL_SCHEDULE]:
    "Progressive brackets: each rate_percent applies only to the slice of income between min and max (max null = no upper limit). Where employee_share_percent is present the tax is split with the employer, and employee_rate_percent is what the employee pays.",
  [RATE_ON_TOTAL_SCHEDULE]:
    "Rate lookup: min/max pick one bracket, and that rate_percent is charged on the whole income base, not a slice.",
  [BASE_AMOUNT_SCHEDULE]:
    "Base plus rate: for income over a bracket's min, tax is base_amount plus rate_percent of the income above min. base_amount is the published figure, not the sum of lower brackets, so tax can jump at a threshold.",
  [FLAT_FEE_SCHEDULE]:
    "Fixed fee: the highest tier whose min_income the taxpayer reaches applies (tiers are not added together). annual_amount is the fee for a full year.",
  [NO_TAX]: "This jurisdiction levies no tax of this type.",
};

const BASIS_NOTES: Record<string, string> = {
  [GROSS_INCOME_BASIS]:
    "gross: charged on gross wages, before deductions and before any 401(k)/IRA contribution.",
  [TAXABLE_INCOME_BASIS]:
    "taxable: charged on taxable income, after the retirement contribution and deductions.",
  [STATE_INCOME_TAX_BASIS]:
    "state_income_tax: charged on the computed state income tax, not on income (a surcharge).",
};

const STANDARD_DEDUCTION_NOTE =
  "standard_deduction is a dollar amount per filing status, or, where it phases out with income, a list of bands: within [min, max) the deduction starts at amount and falls by reduce_rate percent of income above reduce_from (default min), or by reduce_by per whole reduce_per; percent_of_income bands are a percentage of income instead; the result never goes below floor.";

const FEDERAL_TAX_SUBTRACTION_NOTE =
  "federal_tax_subtraction_cap: this state lets filers subtract their federal income tax (not FICA) from income before its rates apply, up to this cap, which steps down by income in the same band format as standard_deduction. The subtraction is the smaller of the cap and the federal income tax; Portland and Multnomah County taxes on Oregon taxable income see it too.";

const PERSONAL_EXEMPTION_CREDIT_NOTE =
  "personal_exemption_credit: a nonrefundable credit taken off this state's income tax (not payroll or local taxes), in the same band format. The amounts are the total for the filer, and spouse when filing jointly; each dependent would add one more exemption but dependents are not modelled. A band dropping to 0 is an AGI limit: one dollar over it loses the whole credit.";

const SALES_TAX_NOTE =
  "sales_tax: general sales tax on taxable purchases, not on income, so calculate never charges it. Each rate is a list of periods, from and to inclusive: one period means the rate held all year, more mean it changed during the year. combined_rate is state_rate plus local_rate. state_average is the population-weighted average local rate, for places not listed under cities; a city marked estimated_from_state_average has no rate of its own in the data and is given that average.";

const NOT_WITHHELD_NOTE =
  "withheld_from_wages: false marks taxes listed for reference that a wage earner does not pay: levied on investment income, or paid by the employer. calculate does not charge them.";

type Collected = {
  kinds: Set<Kind>;
  bases: Set<string>;
  /** Whether any tax in the response is one a wage earner does not pay. */
  notWithheld: boolean;
};

const maxOrNull = (max: number | typeof INFINITY) =>
  max === INFINITY ? null : max;

function describeSchedule(
  taxType: string,
  brackets: BracketSchedule,
  seen: Collected,
) {
  const kind = scheduleKind(brackets);
  seen.kinds.add(kind);

  if (kind === FLAT_FEE_SCHEDULE) {
    return {
      kind,
      tiers: (brackets as FlatFeeBracket[]).map((tier) => {
        const basis = tier.basis ?? GROSS_INCOME_BASIS;
        seen.bases.add(basis);
        const frequency = (tier.frequency ?? ANNUALLY) as TaxFrequency;
        return {
          min_income: tier.min ?? 0,
          basis,
          amount: tier.amount,
          frequency,
          annual_amount: toUnit(
            multiplyMoney(
              asCurrency(tier.amount),
              TAX_FREQUENCY_PERIODS_PER_YEAR[frequency],
            ),
          ),
        };
      }),
    };
  }

  const rates = brackets as RateBracket[];
  const basis = incomeBasisFor(taxType, rates);
  seen.bases.add(basis);

  return {
    kind,
    basis,
    brackets: rates.map(
      ({ min, max, rate, base_amount, percent_of_total }) => ({
        min,
        max: maxOrNull(max),
        ...(kind === BASE_AMOUNT_SCHEDULE && { base_amount: base_amount ?? 0 }),
        rate_percent: rate,
        ...(kind === MARGINAL_SCHEDULE &&
          percent_of_total !== undefined && {
            employee_share_percent: percent_of_total,
            employee_rate_percent:
              Math.round(rate * percent_of_total * 100) / 10_000,
          }),
      }),
    ),
  };
}

function describeTaxes(
  taxData: TaxData | undefined,
  filingStatus: FilingStatus | undefined,
  taxTypes: string[] | undefined,
  seen: Collected,
) {
  const out: Record<string, unknown> = {};
  for (const [taxType, value] of Object.entries(taxData ?? {})) {
    if (NON_TAX_KEYS.includes(taxType)) continue;
    if (taxTypes && !taxTypes.includes(taxType)) continue;
    if (value === NONE) {
      seen.kinds.add(NO_TAX);
      out[taxType] = { kind: NO_TAX };
      continue;
    }

    const byStatus = value as Record<string, BracketSchedule | undefined>;
    const schedules: Record<string, unknown> = {};
    if (filingStatus) {
      const schedule = scheduleForFilingStatus(value, filingStatus);
      if (schedule?.length) {
        const key = byStatus[ALL] ? ALL : filingStatus;
        schedules[key] = describeSchedule(taxType, schedule, seen);
      }
    } else {
      for (const [status, schedule] of Object.entries(byStatus)) {
        if (Array.isArray(schedule) && schedule.length) {
          schedules[status] = describeSchedule(taxType, schedule, seen);
        }
      }
    }
    if (!Object.keys(schedules).length) continue;

    const notWithheld = NON_WAGE_TAX_TYPES.includes(taxType);
    seen.notWithheld ||= notWithheld;
    out[taxType] = {
      ...(notWithheld && { withheld_from_wages: false }),
      schedules,
    };
  }
  return out;
}

function describeBand(band: DeductionBand) {
  return { ...band, max: maxOrNull(band.max) };
}

function describeStandardDeduction(
  taxData: TaxData | undefined,
  filingStatus: FilingStatus | undefined,
  key: string = STANDARD_DEDUCTION,
) {
  const deduction = taxData?.[key] as
    | StandardDeductionByFilingStatus
    | undefined;
  if (!deduction) return null;
  const out: Record<string, unknown> = {};
  for (const [status, value] of Object.entries(deduction)) {
    if (filingStatus && status !== filingStatus) continue;
    out[status] = Array.isArray(value) ? value.map(describeBand) : value;
  }
  return out;
}

/** "2026-04-01" for April, or "2026-04-30" with `end`. */
function isoDate(year: string, month: number, end = false): string {
  const day = end
    ? new Date(Date.UTC(parseInt(year, 10), month + 1, 0)).getUTCDate()
    : 1;
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function describeRate(monthlyRates: number[], year: string) {
  return salesTaxPeriods(monthlyRates).map(
    ({ firstMonth, lastMonth, rate }) => ({
      from: isoDate(year, firstMonth),
      to: isoDate(year, lastMonth, true),
      rate_percent: rate,
    }),
  );
}

/**
 * The state's sales tax for the year, for every listed city or the one asked
 * for. A year with no file says so: missing data is not a 0% rate, which is
 * what Oregon's file of zeros says instead.
 */
function describeSalesTax(
  salesTax: SalesTaxData | null,
  year: string,
  state: string,
  city: string,
) {
  if (!salesTax) {
    const years = YEARS.filter(
      (candidate) => TAX_DATA_REGISTRY[candidate].salesTax[state],
    );
    return {
      data_available: false,
      note:
        `No sales tax data for ${year}. That is missing data, not a 0% rate.` +
        (years.length ? ` Years with data: ${years.join(", ")}.` : ""),
    };
  }

  const rates = (location: string) => ({
    local_rate: describeRate(localSalesTaxRates(salesTax, location), year),
    combined_rate: describeRate(salesTaxRatesFor(salesTax, location), year),
  });
  const places = city ? [city] : salesTaxCitiesFor(salesTax).sort();
  return {
    data_available: true,
    state_rate: describeRate(stateSalesTaxRates(salesTax), year),
    state_average: rates(""),
    cities: Object.fromEntries(
      places.map((place) => [
        place,
        {
          ...rates(place),
          ...(usesAverageLocalRate(salesTax, place) && {
            estimated_from_state_average: true,
          }),
        },
      ]),
    ),
  };
}

function taxKeys(taxData: TaxData | undefined): string[] {
  return Object.keys(taxData ?? {}).filter(
    (key) => !NON_TAX_KEYS.includes(key),
  );
}

export async function runTaxTables(input: TaxTablesInput, siteUrl: string) {
  const { year, federal, state, stateData, city, cities, salesTax } =
    await loadLocation(input, { withSalesTax: true });
  const cityData = city ? stateData?.cities?.[city] : undefined;
  const filingStatus = input.filing_status;

  const taxTypes = input.tax_types?.map(normalizeKey);
  if (taxTypes) {
    const valid = [
      ...new Set([
        ...taxKeys(federal),
        ...taxKeys(stateData),
        ...taxKeys(cityData as TaxData | undefined),
        ...(state ? [SALES_TAX] : []),
      ]),
    ];
    const unknown = taxTypes.filter((type) => !valid.includes(type));
    if (unknown.length) {
      throw new InputError(
        `No tax type ${unknown.map((type) => `"${type}"`).join(", ")} for this location.`,
        valid,
      );
    }
  }

  const seen: Collected = {
    kinds: new Set(),
    bases: new Set(),
    notWithheld: false,
  };
  const federalTaxes = describeTaxes(federal, filingStatus, taxTypes, seen);
  const stateTaxes = stateData
    ? describeTaxes(stateData, filingStatus, taxTypes, seen)
    : null;
  const localTaxes = cityData
    ? describeTaxes(cityData as TaxData, filingStatus, taxTypes, seen)
    : null;

  const salesTaxSection =
    state && (!taxTypes || taxTypes.includes(SALES_TAX))
      ? describeSalesTax(salesTax ?? null, year, state, city)
      : null;

  const path = [year, state, city].filter(Boolean).map(snakeToDashCase);

  return {
    location: {
      year,
      state: state || null,
      city: city || null,
      filing_status: filingStatus ?? ALL,
    },
    max_401k_contribution: federal[MAX_401K_CONTRIBUTION] ?? null,
    federal: {
      standard_deduction: describeStandardDeduction(federal, filingStatus),
      taxes: federalTaxes,
    },
    state: stateData
      ? {
          standard_deduction: describeStandardDeduction(
            stateData,
            filingStatus,
          ),
          // Same shape as the standard deduction, but a cap: the subtraction
          // is the smaller of this and the federal income tax.
          ...(stateData[FEDERAL_TAX_SUBTRACTION] && {
            federal_tax_subtraction_cap: describeStandardDeduction(
              stateData,
              filingStatus,
              FEDERAL_TAX_SUBTRACTION,
            ),
          }),
          ...(stateData[PERSONAL_EXEMPTION_CREDIT] && {
            personal_exemption_credit: describeStandardDeduction(
              stateData,
              filingStatus,
              PERSONAL_EXEMPTION_CREDIT,
            ),
          }),
          taxes: stateTaxes,
          cities_with_local_taxes: cities,
        }
      : null,
    local: localTaxes ? { taxes: localTaxes } : null,
    sales_tax: salesTaxSection,
    how_to_read: [
      ...[...seen.kinds].map((kind) => `${kind}: ${KIND_NOTES[kind]}`),
      ...[...seen.bases].map((basis) => `basis ${BASIS_NOTES[basis]}`),
      STANDARD_DEDUCTION_NOTE,
      ...(stateData?.[FEDERAL_TAX_SUBTRACTION]
        ? [FEDERAL_TAX_SUBTRACTION_NOTE]
        : []),
      ...(stateData?.[PERSONAL_EXEMPTION_CREDIT]
        ? [PERSONAL_EXEMPTION_CREDIT_NOTE]
        : []),
      ...(seen.notWithheld ? [NOT_WITHHELD_NOTE] : []),
      ...(salesTaxSection?.data_available ? [SALES_TAX_NOTE] : []),
      "Rates are percentages. Use the calculate tool for dollar amounts at a given income; it applies all of the above.",
    ],
    source: `${siteUrl}/tax-tables/${path.join("/")}/`,
  };
}

export type TaxTablesOutput = Awaited<ReturnType<typeof runTaxTables>>;
