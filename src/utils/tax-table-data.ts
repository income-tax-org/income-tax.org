import { FILING_STATUSES } from "@/constants/filing-status";
import {
  BASE_AMOUNT_SCHEDULE,
  FLAT_FEE_SCHEDULE,
  INFINITY,
  RATE_ON_TOTAL_SCHEDULE,
  STATE_INCOME_TAX_BASIS,
  TAX_FREQUENCY_PERIODS_PER_YEAR,
} from "@/constants";
import { NONE } from "@/constants/tax-types";
import type {
  BracketSchedule,
  DeductionBand,
  FlatFeeBracket,
  RateBracket,
  SalesTaxData,
  StandardDeduction,
  StandardDeductionByFilingStatus,
  TaxData,
  TaxFrequency,
} from "@/types";
import { scheduleForFilingStatus, scheduleKind } from "./calculator";
import type { SalesTaxPeriod } from "./sales-tax";
import {
  localSalesTaxRates,
  salesTaxCitiesFor,
  salesTaxPeriods,
  salesTaxRatesFor,
  stateSalesTaxRates,
  usesAverageLocalRate,
} from "./sales-tax";
import { isBandedDeduction } from "./standard-deduction";
import { snakeToTitleCase, toSnakeCase } from "./string-utils";
import {
  asCurrency,
  formatMoney,
  formatMoneyNoCents,
  multiplyMoney,
} from "@/utils/money";

export type Table = {
  name: string;
  headers: string[];
  rows: (string | number)[][];
  /** Shown under the table, for what the cells alone cannot say. */
  note?: string;
};

type BracketColumn = {
  header: string;
  brackets: BracketSchedule;
};

/**
 * One column per filing status.
 *
 * An ALL schedule applies to everyone, so it is shown under every filing status
 * rather than in a single unlabelled column.
 */
function bracketColumns(taxData: TaxData[string]): BracketColumn[] {
  return FILING_STATUSES.flatMap((status) => {
    const brackets = scheduleForFilingStatus(taxData, status);
    return brackets ? [{ header: snakeToTitleCase(status), brackets }] : [];
  });
}

export function tableDataFromTaxData(
  name: string,
  taxData: TaxData[string],
): Table {
  if (taxData === NONE) {
    return {
      name,
      headers: ["No Taxes"],
      rows: [],
    };
  }

  const columns = bracketColumns(taxData);
  if (columns.length === 0) {
    return { name, headers: [], rows: [] };
  }

  // A surcharge on the state's own tax has no income ranges to show: its one
  // band covers every income, and the rate is charged on a tax rather than on
  // a slice of pay. Showing it in the usual rate-and-range grid would invite
  // the reader to apply 16.75% to their salary.
  const firstBracket = columns[0].brackets[0] as RateBracket | undefined;
  if (firstBracket?.basis === STATE_INCOME_TAX_BASIS) {
    return {
      name: toSnakeCase(name),
      headers: ["Tax"],
      rows: [[`${firstBracket.rate}% of state income tax`]],
    };
  }

  // Filing statuses do not always have the same number of brackets -- 2026 New
  // Jersey runs 7 for single and married-separately against 8 for the other
  // two -- so the table is as tall as the longest column and short columns get
  // a blank cell. Indexing off the first column instead put the extra bracket's
  // values under the wrong headers.
  const rowCount = Math.max(...columns.map((column) => column.brackets.length));
  const rowIndexes = Array.from({ length: rowCount }, (_, index) => index);

  // A schedule is uniformly fees or uniformly rates, so the first column decides.
  const kind = scheduleKind(columns[0].brackets);
  if (kind === FLAT_FEE_SCHEDULE) {
    return {
      name,
      headers: columns.map((column) => column.header),
      rows: rowIndexes.map((index) =>
        columns.map((column) => {
          const bracket = column.brackets[index] as FlatFeeBracket | undefined;
          return bracket ? formatFlatFee(bracket) : "";
        }),
      ),
    };
  }

  // Rates are shared across filing statuses; only the income ranges differ. So
  // the rate (and the employee share, where the tax is split with the employer)
  // leads the row, and each status column carries that status's range.
  const rateColumns = columns as { header: string; brackets: RateBracket[] }[];
  const rateAt = (index: number) =>
    rateColumns.find((column) => column.brackets[index])?.brackets[index];

  const headers: string[] = [];
  const isSplitTax = rateAt(0)?.percent_of_total !== undefined;
  if (isSplitTax) {
    headers.push("Employee Portion");
  }
  // A rate-lookup schedule's ranges pick the rate rather than bound what it is
  // charged on, so the plain "Rate" header would read as marginal. See
  // isRateLookupSchedule.
  // A base-amount schedule's rate is only half the story: Ohio charges "$342.00
  // plus 2.750% of the amount in excess of $26,050", and showing the 2.75%
  // alone is what understated it in the first place.
  const isBaseAmount = kind === BASE_AMOUNT_SCHEDULE;
  headers.push(
    kind === RATE_ON_TOTAL_SCHEDULE
      ? "Rate (on all wages)"
      : isBaseAmount
        ? "Tax"
        : "Rate",
    ...rateColumns.map((column) => column.header),
  );

  const rows = rowIndexes.map((index) => {
    const reference = rateAt(index);
    const row: (string | number)[] = [];
    if (isSplitTax) {
      row.push(
        reference?.percent_of_total === undefined
          ? ""
          : `${reference.percent_of_total}%`,
      );
    }
    // `rate` is compared against undefined rather than checked for truthiness:
    // a 0% first bracket is real (Ohio, Oklahoma, North Dakota and 100-odd
    // others) and a falsiness check dropped the entire row.
    row.push(
      reference?.rate === undefined
        ? ""
        : isBaseAmount
          ? formatBaseAmountTax(reference)
          : `${reference.rate}%`,
    );
    for (const column of rateColumns) {
      const bracket = column.brackets[index];
      row.push(bracket ? formatBracketRange(bracket, index) : "");
    }
    return row;
  });

  return { name, headers, rows };
}

/**
 * What a base-amount bracket charges, in the form its statute uses.
 *
 * "$342.00 + 2.75%" for Ohio's middle band, and a bare "0%" for the band below
 * the threshold, where there is no base to state.
 */
function formatBaseAmountTax(bracket: RateBracket): string {
  if (!bracket.base_amount) {
    return `${bracket.rate}%`;
  }
  return `${formatMoney(asCurrency(bracket.base_amount))} + ${bracket.rate}%`;
}

/**
 * The income range a bracket covers.
 *
 * Every bracket after the first starts a dollar above the previous one's max,
 * which is where the +1 comes from: consecutive brackets share a boundary in
 * the data ({ max: 20000 } then { min: 20000 }) but must not appear to overlap.
 */
function formatBracketRange(bracket: RateBracket, index: number): string {
  const min = formatMoneyNoCents(
    asCurrency(bracket.min + (index === 0 ? 0 : 1)),
  );
  if (bracket.max === INFINITY) {
    return `${min}+`;
  }
  return `${min} - ${formatMoneyNoCents(asCurrency(bracket.max as number))}`;
}

/**
 * Render a fixed-dollar tax the way the calculator actually charges it.
 *
 * Data declares these per period ($3 weekly, $5.75 monthly), so showing the raw
 * amount made the table disagree with the calculator by a factor of 52 or 12.
 * The qualifying threshold is included for the same reason — it decides whether
 * the fee applies at all.
 */
function formatFlatFee(bracket: FlatFeeBracket): string {
  const amount = asCurrency(bracket.amount);

  let label: string;
  if (bracket.frequency) {
    const periodsPerYear =
      TAX_FREQUENCY_PERIODS_PER_YEAR[bracket.frequency as TaxFrequency];
    label = `${formatMoneyNoCents(
      multiplyMoney(amount, periodsPerYear),
    )}/yr (${formatMoney(amount)} ${snakeToTitleCase(
      bracket.frequency,
    ).toLowerCase()})`;
  } else {
    label = formatMoneyNoCents(amount);
  }

  if (bracket.min) {
    label += ` at ${formatMoneyNoCents(asCurrency(bracket.min))}+`;
  }

  return label;
}

/**
 * The income range a deduction band covers.
 *
 * Bands are half-open in the data -- `[19550, 57211)` -- and the states print
 * them closed: "over $19,549 but not over $57,210". Subtracting the dollar
 * puts the printed figures back on the page, so a reader can hold the table
 * next to the state's own schedule.
 */
function formatBandRange(band: DeductionBand): string {
  const min = formatMoneyNoCents(asCurrency(band.min));
  if (band.max === INFINITY) {
    return `${min}+`;
  }
  return `${min} - ${formatMoneyNoCents(asCurrency((band.max as number) - 1))}`;
}

/**
 * How much a band allows, in the words its schedule uses.
 *
 * "$13,560 less 12% of income over $19,550" is Wisconsin's own phrasing, and
 * "less $175 per $500 over $25,999" is Alabama's. Showing only the top amount
 * is what made the reference page overstate these in the first place.
 */
function formatBandAmount(band: DeductionBand): string {
  const amount = formatMoneyNoCents(asCurrency(band.amount));
  const over = formatMoneyNoCents(asCurrency(band.reduce_from ?? band.min));

  let label = amount;
  if (band.percent_of_income !== undefined) {
    label = `${band.percent_of_income}% of income, up to ${amount}`;
  } else if (band.reduce_rate !== undefined) {
    label = `${amount} less ${band.reduce_rate}% of income over ${over}`;
  } else if (band.reduce_per !== undefined && band.reduce_by !== undefined) {
    label = `${amount} less ${formatMoneyNoCents(
      asCurrency(band.reduce_by),
    )} per ${formatMoneyNoCents(asCurrency(band.reduce_per))} over ${over}`;
  }

  if (band.floor) {
    label += `, and never below ${formatMoneyNoCents(asCurrency(band.floor))}`;
  }
  return label;
}

export function standardDeductionMapToTable(
  name: string,
  standardDeductionMap: StandardDeductionByFilingStatus,
): Table {
  const entries = Object.entries(standardDeductionMap) as [
    string,
    StandardDeduction,
  ][];

  // Five states shrink the deduction as income rises. One amount per filing
  // status cannot say that, so a schedule gets a row per band and an income
  // column to read them against.
  if (!entries.some(([, deduction]) => isBandedDeduction(deduction))) {
    return {
      name: toSnakeCase(name),
      headers: ["Filing Status", "Amount"],
      rows: entries.map(([filingStatus, amount]) => [
        snakeToTitleCase(filingStatus),
        formatMoneyNoCents(asCurrency(amount as number)),
      ]),
    };
  }

  const rows = [] as (string | number)[][];
  for (const [filingStatus, deduction] of entries) {
    const label = snakeToTitleCase(filingStatus);
    if (!isBandedDeduction(deduction)) {
      rows.push([label, "Any", formatMoneyNoCents(asCurrency(deduction))]);
      continue;
    }
    deduction.forEach((band, index) => {
      rows.push([
        index === 0 ? label : "",
        formatBandRange(band),
        formatBandAmount(band),
      ]);
    });
  }

  return {
    name: toSnakeCase(name),
    headers: ["Filing Status", "Income", "Deduction"],
    rows,
  };
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * A sales tax rate as it was charged: "6.5%" where it held all year, and a
 * line per run of months where it changed. Tacoma's 2026 local rate reads
 * "3.8% (Jan–Mar)", "3.9% (Apr–Jun)", "4% (Jul–Dec)"; averaging it into one
 * figure would print a rate that was never charged.
 */
function formatSalesTaxRate(periods: SalesTaxPeriod[]): string {
  if (periods.length === 1) {
    return `${periods[0].rate}%`;
  }
  return periods
    .map(({ firstMonth, lastMonth, rate }) => {
      const months =
        firstMonth === lastMonth
          ? MONTH_NAMES[firstMonth]
          : `${MONTH_NAMES[firstMonth]}–${MONTH_NAMES[lastMonth]}`;
      return `${rate}% (${months})`;
    })
    .join("\n");
}

/**
 * A state's general sales tax: its rate, the local rate on top and the two
 * combined, for every city the file lists, or for the one city picked.
 *
 * `salesTax` is null where the year has no file for the state, and the table
 * says so rather than showing 0%. Oregon has no sales tax; a state with no
 * file has simply not been collected for that year.
 */
export function salesTaxToTable(
  name: string,
  salesTax: SalesTaxData | null,
  year: string,
  city: string,
): Table {
  if (!salesTax) {
    return { name, headers: [`No sales tax data for ${year}`], rows: [] };
  }

  const cities = salesTaxCitiesFor(salesTax).sort();
  if (
    !cities.length &&
    salesTaxRatesFor(salesTax, "").every((rate) => rate === 0)
  ) {
    return { name, headers: ["No Taxes"], rows: [] };
  }

  // "Seattle (state average)" for a picked city the file does not list,
  // as the comparison labels it. Where the average is zero it is exact, and
  // the city needs no qualifier.
  const label = (location: string) => {
    if (!location) {
      return usesAverageLocalRate(salesTax, "") ? "State average" : "Statewide";
    }
    const title = snakeToTitleCase(location);
    return usesAverageLocalRate(salesTax, location)
      ? `${title} (state average)`
      : title;
  };

  const statePeriods = salesTaxPeriods(stateSalesTaxRates(salesTax));
  let changedDuringYear = statePeriods.length > 1;
  const rows = (city ? [city] : ["", ...cities]).map((location) => {
    const local = salesTaxPeriods(localSalesTaxRates(salesTax, location));
    const combined = salesTaxPeriods(salesTaxRatesFor(salesTax, location));
    changedDuringYear ||= local.length > 1 || combined.length > 1;
    return [
      label(location),
      formatSalesTaxRate(statePeriods),
      formatSalesTaxRate(local),
      formatSalesTaxRate(combined),
    ];
  });

  return {
    name,
    headers: ["Location", "State Rate", "Local Rate", "Combined Rate"],
    rows,
    ...(changedDuringYear && {
      note: `Rates that changed during ${year} are listed with the months each applied.`,
    }),
  };
}
