import {
  CITIES,
  STATE_INCOME_TAX_BASIS,
  TAXABLE_INCOME_BASIS,
} from "@/constants";
import { ANNUALLY, TAX_FREQUENCY_PERIODS_PER_YEAR } from "@/constants";
import { FILING_STATUSES, SINGLE } from "@/constants/filing-status";
import {
  BIWEEKLY,
  MONTHLY,
  SEMI_MONTHLY,
  WEEKLY,
} from "@/constants/paycheck-frequency";
import {
  ART_TAX,
  FEDERAL_INCOME,
  MEDICARE,
  NONE,
  NON_TAX_DATA_KEYS,
  NON_WAGE_TAX_TYPES,
  NYC_INCOME,
  PRESCHOOL_FOR_ALL,
  SOCIAL_SECURITY,
  STATE_INCOME,
  SUPPORTIVE_HOUSING_SERVICES,
} from "@/constants/tax-types";
import type {
  BracketSchedule,
  FlatFeeBracket,
  RateBracket,
  SalesTaxData,
  TaxData,
  TaxFrequency,
} from "@/types";
import {
  incomeBasisFor,
  isFlatFeeSchedule,
  isRateLookupSchedule,
  scheduleForFilingStatus,
} from "./calculator";
import {
  asCurrency,
  formatMoney,
  formatMoneyNoCents,
  multiplyMoney,
  toCents,
} from "./money";
import type { Money } from "./money";
import { localSalesTaxRates, stateSalesTaxRates } from "./sales-tax";
import { snakeToTitleCase } from "./string-utils";

// Plain-English summaries of a place's taxes, for the short paragraph under
// each generated page's heading. Every figure comes from the tax data, so the
// text cannot drift from the tables and calculator it introduces.

/** Rates as published: 2.5%, 3.125%, never 3.1250000000000004%. */
export function formatRate(rate: number): string {
  return `${Math.round(rate * 10_000) / 10_000}%`;
}

function rateRange(low: number, high: number): string {
  return low === high
    ? formatRate(low)
    : `${formatRate(low)} to ${formatRate(high)}`;
}

/** "a" and "c", or "a, b and c". */
function joinList(items: string[]): string {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

function article(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

/** Whole dollars without cents, otherwise to the cent: $69, $5.75. */
function formatDollars(money: Money): string {
  return toCents(money) % 100 === 0
    ? formatMoneyNoCents(money)
    : formatMoney(money);
}

type RateSummary =
  | { kind: "none" }
  | { kind: "flat"; rate: number }
  | { kind: "range"; low: number; high: number; progressive: boolean };

/**
 * The rates a schedule actually charges. A 0% band is an exempt amount or a
 * wage cap rather than a rate anyone pays, so Idaho's 0% / 5.3% schedule is a
 * flat 5.3% tax, which is how the state itself describes it.
 */
function summarizeRates(schedule: BracketSchedule | undefined): RateSummary {
  if (!schedule?.length || isFlatFeeSchedule(schedule)) return { kind: "none" };
  const rates = schedule.map((bracket) => bracket.rate);
  const charged = rates.filter((rate) => rate > 0);
  if (!charged.length) return { kind: "none" };
  const low = Math.min(...charged);
  const high = Math.max(...charged);
  if (low === high) return { kind: "flat", rate: low };
  return {
    kind: "range",
    low,
    high,
    progressive: rates.every((rate, i) => i === 0 || rate >= rates[i - 1]),
  };
}

function sameSummary(a: RateSummary, b: RateSummary): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export type StateIncomeTax = RateSummary & {
  /**
   * The summary is a single filer's, because another status's differs. New
   * Jersey's joint schedule has a band its single one lacks, but both run
   * 1.4% to 10.75%, so it needs no qualifier.
   */
  singleFilersOnly: boolean;
};

export function stateIncomeTax(stateTaxes: TaxData): StateIncomeTax {
  const data = stateTaxes[STATE_INCOME];
  if (!data || data === NONE) {
    return { kind: "none", singleFilersOnly: false };
  }
  const single = summarizeRates(scheduleForFilingStatus(data, SINGLE));
  const singleFilersOnly = FILING_STATUSES.some(
    (status) =>
      !sameSummary(
        single,
        summarizeRates(scheduleForFilingStatus(data, status)),
      ),
  );
  return { ...single, singleFilersOnly };
}

/**
 * The state's income tax as a noun phrase without its article: "flat 4.25%
 * income tax", "progressive income tax (2% to 5%)". Undefined for a state
 * with none. Not "state income tax": the District of Columbia is not one.
 */
function stateIncomeTaxNoun(tax: StateIncomeTax): string | undefined {
  const forSingle = tax.singleFilersOnly ? " for single filers" : "";
  switch (tax.kind) {
    case "none":
      return undefined;
    case "flat":
      return `flat ${formatRate(tax.rate)} income tax${forSingle}`;
    case "range":
      return `${tax.progressive ? "progressive " : ""}income tax (${rateRange(tax.low, tax.high)}${forSingle})`;
  }
}

/** "has a flat 2.5% income tax", "has no state income tax". */
function stateIncomeTaxPredicate(tax: StateIncomeTax): string {
  const noun = stateIncomeTaxNoun(tax);
  return noun ? `has ${article(noun)} ${noun}` : "has no state income tax";
}

/** Keys that are a tax charged on the modelled employee's wages. */
function isWageTax(taxType: string): boolean {
  return (
    taxType !== CITIES &&
    !NON_TAX_DATA_KEYS.includes(taxType) &&
    !NON_WAGE_TAX_TYPES.includes(taxType)
  );
}

/** State-level taxes on wages other than the income tax: SDI, paid leave. */
function statePayrollTaxCount(stateTaxes: TaxData): number {
  return Object.keys(stateTaxes).filter(
    (taxType) => taxType !== STATE_INCOME && isWageTax(taxType),
  ).length;
}

function hasStateWageTax(stateTaxes: TaxData): boolean {
  return (
    stateIncomeTax(stateTaxes).kind !== "none" ||
    statePayrollTaxCount(stateTaxes) > 0
  );
}

/**
 * Proper names, where lower-casing the key would be wrong. Everything else
 * reads fine as a common noun: "city income tax", "occupational tax".
 */
const LOCAL_TAX_NAMES: Record<string, string> = {
  [NYC_INCOME]: "New York City income tax",
  [ART_TAX]: "Arts Tax",
  [PRESCHOOL_FOR_ALL]: "Preschool for All tax",
  [SUPPORTIVE_HOUSING_SERVICES]: "Supportive Housing Services tax",
};

export function localTaxName(taxType: string): string {
  if (LOCAL_TAX_NAMES[taxType]) return LOCAL_TAX_NAMES[taxType];
  const words = taxType.replace(/_/g, " ");
  return /\btax$/.test(words) ? words : `${words} tax`;
}

const PER_PERIOD: Record<TaxFrequency, string> = {
  [WEEKLY]: "a week",
  [BIWEEKLY]: "every two weeks",
  [SEMI_MONTHLY]: "twice a month",
  [MONTHLY]: "a month",
  [ANNUALLY]: "a year",
};

function incomeWord(basis: string): string {
  return basis === TAXABLE_INCOME_BASIS ? "taxable income" : "wages";
}

/** Thresholds that differ by filing status are quoted for a single filer. */
function variesByStatus(data: TaxData[string]): boolean {
  const single = JSON.stringify(scheduleForFilingStatus(data, SINGLE));
  return FILING_STATUSES.some(
    (status) =>
      JSON.stringify(scheduleForFilingStatus(data, status)) !== single,
  );
}

function describeFlatFee(
  name: string,
  tiers: FlatFeeBracket[],
  forSingle: string,
): string {
  const annual = (tier: FlatFeeBracket) =>
    multiplyMoney(
      asCurrency(tier.amount),
      TAX_FREQUENCY_PERIODS_PER_YEAR[tier.frequency ?? ANNUALLY],
    );
  const head = `${article(name)} ${name} of `;
  if (tiers.length > 1) {
    const amounts = tiers.map((tier) => toCents(annual(tier)));
    const low = asCurrency(Math.min(...amounts) / 100);
    const high = asCurrency(Math.max(...amounts) / 100);
    return `${head}${formatDollars(low)} to ${formatDollars(high)} a year, depending on income${forSingle}`;
  }
  const [tier] = tiers;
  const perPeriod =
    tier.frequency && tier.frequency !== ANNUALLY
      ? ` (${formatDollars(asCurrency(tier.amount))} ${PER_PERIOD[tier.frequency]})`
      : "";
  const threshold = tier.min
    ? ` on ${incomeWord(tier.basis ?? "")} of ${formatDollars(asCurrency(tier.min))} or more${forSingle}`
    : "";
  return `${head}${formatDollars(annual(tier))} a year${perPeriod}${threshold}`;
}

function describeRateSchedule(
  taxType: string,
  name: string,
  brackets: RateBracket[],
  forSingle: string,
): string | undefined {
  const rates = summarizeRates(brackets);
  if (rates.kind === "none") return undefined;
  const amount =
    rates.kind === "flat"
      ? formatRate(rates.rate)
      : rateRange(rates.low, rates.high);
  const head = `${article(name)} ${name} of ${amount}`;
  const basis = incomeBasisFor(taxType, brackets);
  if (basis === STATE_INCOME_TAX_BASIS) {
    return `${head} of the state income tax`;
  }
  const firstCharged = brackets.find((bracket) => bracket.rate > 0)!;
  if (!firstCharged.min) return head;
  const threshold = formatDollars(asCurrency(firstCharged.min));
  return isRateLookupSchedule(brackets)
    ? `${head} on all ${incomeWord(basis)} once ${basis === TAXABLE_INCOME_BASIS ? "it reaches" : "they reach"} ${threshold}${forSingle}`
    : `${head} on ${incomeWord(basis)} over ${threshold}${forSingle}`;
}

/**
 * One phrase per local tax the modelled employee pays, e.g. "a city income
 * tax of 2.5%". Employer-paid taxes such as Newark's payroll tax are left
 * out, as the calculator leaves them out.
 */
export function describeLocalTaxes(
  stateTaxes: TaxData,
  city: string,
): string[] {
  const cityTaxes = stateTaxes[CITIES]?.[city] ?? {};
  const phrases: string[] = [];
  for (const [taxType, data] of Object.entries(cityTaxes)) {
    if (!isWageTax(taxType)) continue;
    const schedule = scheduleForFilingStatus(data, SINGLE);
    if (!schedule?.length) continue;
    const name = localTaxName(taxType);
    const forSingle = variesByStatus(data) ? " for single filers" : "";
    const phrase = isFlatFeeSchedule(schedule)
      ? describeFlatFee(name, schedule, forSingle)
      : describeRateSchedule(taxType, name, schedule, forSingle);
    if (phrase) phrases.push(phrase);
  }
  return phrases;
}

/** Localities in the state that levy a tax on the modelled employee's pay. */
export function localitiesWithWageTaxes(stateTaxes: TaxData): string[] {
  return Object.keys(stateTaxes[CITIES] ?? {}).filter(
    (city) => describeLocalTaxes(stateTaxes, city).length > 0,
  );
}

/** "10% to 37%", from the single filer's federal brackets. */
function federalIncomeTaxRange(federalTaxes: TaxData): string | undefined {
  const rates = summarizeRates(
    scheduleForFilingStatus(federalTaxes[FEDERAL_INCOME], SINGLE),
  );
  if (rates.kind === "none") return undefined;
  return rates.kind === "flat"
    ? formatRate(rates.rate)
    : rateRange(rates.low, rates.high);
}

/**
 * "federal income tax (10% to 37%), Social Security, Medicare and Ohio
 * taxes": what the calculator takes out of a salary. `stateTaxes` is the
 * last item's wording, empty for a state that takes nothing.
 */
function deductedTaxes(federalTaxes: TaxData, stateTaxes: string): string {
  const federalRange = federalIncomeTaxRange(federalTaxes);
  const taxes = [
    federalRange
      ? `federal income tax (${federalRange})`
      : "federal income tax",
  ];
  if (federalTaxes[SOCIAL_SECURITY]) taxes.push("Social Security");
  if (federalTaxes[MEDICARE]) taxes.push("Medicare");
  if (stateTaxes) taxes.push(stateTaxes);
  return joinList(taxes);
}

/**
 * The opening sentence for a state: its income tax, and for a state without
 * one, whether wages still carry a state payroll tax -- Washington's Cares
 * Fund is the reason it trails Texas.
 */
function stateSentence(
  stateTaxes: TaxData,
  stateName: string,
  year: string,
): string {
  const tax = stateIncomeTax(stateTaxes);
  const payroll = statePayrollTaxCount(stateTaxes);
  const payrollClause =
    tax.kind === "none" && payroll > 0
      ? `, though wages there are subject to ${payroll === 1 ? "a state payroll tax" : "state payroll taxes"}`
      : "";
  return `${stateName} ${stateIncomeTaxPredicate(tax)} in ${year}${payrollClause}.`;
}

function localitiesSentence(stateTaxes: TaxData, stateName: string): string {
  const count = localitiesWithWageTaxes(stateTaxes).length;
  if (!count) return "";
  return count === 1
    ? `One locality in ${stateName} adds its own tax on wages.`
    : `${count} localities in ${stateName} add their own tax on wages.`;
}

/**
 * "Columbus, Ohio levies a city income tax of 2.5% in 2025, on top of Ohio's
 * progressive income tax (2.75% to 3.125%) and federal taxes."
 */
function citySentence(
  stateTaxes: TaxData,
  stateName: string,
  cityName: string,
  city: string,
  year: string,
): string {
  const place = `${cityName}, ${stateName}`;
  const local = describeLocalTaxes(stateTaxes, city);
  const stateNoun = stateIncomeTaxNoun(stateIncomeTax(stateTaxes));
  if (!local.length) {
    return stateNoun
      ? `${place} has no local income tax in ${year}; ${stateName} has ${article(stateNoun)} ${stateNoun}.`
      : `${place} has no local income tax in ${year}, and ${stateName} has no state income tax.`;
  }
  const levies = `${place} levies ${joinList(local)} in ${year}`;
  return stateNoun
    ? `${levies}, on top of ${stateName}'s ${stateNoun} and federal taxes.`
    : `${levies}, on top of federal taxes. ${stateName} has no state income tax.`;
}

/**
 * "Washington's state sales tax rate is 6.5%, and local taxes add about
 * 2.95% on average." A rate that changed during the year is given as its
 * range; the local average, which the files carry by half-year, as its mean.
 */
function stateSalesTaxSentence(
  salesTax: SalesTaxData,
  stateName: string,
): string {
  const state = rangeOf(stateSalesTaxRates(salesTax));
  const localRates = localSalesTaxRates(salesTax, "");
  const local = rangeOf(localRates);
  if (state.high === 0 && local.high === 0) {
    return `${stateName} has no sales tax.`;
  }
  const localAverage =
    local.low === local.high
      ? formatRate(local.low)
      : `about ${formatRate(roundTo(mean(localRates), 2))}`;
  const localClause = `local taxes add ${localAverage} on average`;
  if (state.high === 0) {
    return `${stateName} has no state sales tax, though ${localClause}.`;
  }
  const stateRate = rateRange(state.low, state.high);
  return local.high === 0
    ? `${stateName}'s sales tax rate is ${stateRate}.`
    : `${stateName}'s state sales tax rate is ${stateRate}, and ${localClause}.`;
}

/**
 * "The combined sales tax rate in Seattle is 10.35%: Washington's 6.5% plus
 * 3.85% in local taxes." Empty for a city the sales tax file does not list,
 * which is charged the state average rather than a rate of its own.
 */
function citySalesTaxSentence(
  salesTax: SalesTaxData,
  stateName: string,
  cityName: string,
  city: string,
  year: string,
): string {
  if (!salesTax[CITIES]?.[city]) return "";
  const stateRates = stateSalesTaxRates(salesTax);
  const localRates = localSalesTaxRates(salesTax, city);
  const combined = rangeOf(stateRates.map((rate, i) => rate + localRates[i]));
  const state = rangeOf(stateRates);
  const local = rangeOf(localRates);
  if (combined.high === 0) {
    return `There is no sales tax in ${cityName}.`;
  }
  if (combined.low !== combined.high) {
    return `The combined sales tax rate in ${cityName} ranges from ${rateRange(combined.low, combined.high)} during ${year}.`;
  }
  const rate = formatRate(combined.low);
  if (state.low !== state.high || local.low !== local.high) {
    return `The combined sales tax rate in ${cityName} is ${rate}.`;
  }
  if (state.high === 0) {
    return `The sales tax rate in ${cityName} is ${rate}, all of it local.`;
  }
  if (local.high === 0) {
    return `The sales tax rate in ${cityName} is ${rate}, with no local sales tax.`;
  }
  return `The combined sales tax rate in ${cityName} is ${rate}: ${stateName}'s ${formatRate(state.low)} plus ${formatRate(local.low)} in local taxes.`;
}

function rangeOf(rates: number[]): { low: number; high: number } {
  return { low: Math.min(...rates), high: Math.max(...rates) };
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundTo(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function sentences(...parts: string[]): string {
  return parts.filter(Boolean).join(" ");
}

type PlaceArgs = {
  year: string;
  /** snake_case state key. */
  state: string;
  federalTaxes: TaxData;
  stateTaxes: TaxData;
};

export function calculatorStateIntro({
  year,
  state,
  federalTaxes,
  stateTaxes,
}: PlaceArgs): string {
  const stateName = snakeToTitleCase(state);
  return sentences(
    stateSentence(stateTaxes, stateName, year),
    localitiesSentence(stateTaxes, stateName),
    `Enter a salary to estimate take-home pay after ${deductedTaxes(
      federalTaxes,
      hasStateWageTax(stateTaxes) ? `${stateName} taxes` : "",
    )}.`,
  );
}

export function calculatorCityIntro({
  year,
  state,
  city,
  stateTaxes,
}: PlaceArgs & { city: string }): string {
  const stateName = snakeToTitleCase(state);
  return sentences(
    citySentence(stateTaxes, stateName, snakeToTitleCase(city), city, year),
    "Enter a salary to estimate take-home pay with every federal, state and local tax included.",
  );
}

type TaxTablesArgs = {
  year: string;
  state: string;
  stateTaxes: TaxData;
  /** Null where the year has no sales tax data. */
  salesTax: SalesTaxData | null;
};

export function taxTablesStateIntro({
  year,
  state,
  stateTaxes,
  salesTax,
}: TaxTablesArgs): string {
  const stateName = snakeToTitleCase(state);
  return sentences(
    stateSentence(stateTaxes, stateName, year),
    salesTax ? stateSalesTaxSentence(salesTax, stateName) : "",
    localitiesSentence(stateTaxes, stateName),
  );
}

export function taxTablesCityIntro({
  year,
  state,
  city,
  stateTaxes,
  salesTax,
}: TaxTablesArgs & { city: string }): string {
  const stateName = snakeToTitleCase(state);
  const cityName = snakeToTitleCase(city);
  return sentences(
    citySentence(stateTaxes, stateName, cityName, city, year),
    salesTax
      ? citySalesTaxSentence(salesTax, stateName, cityName, city, year)
      : "",
  );
}

type CompareArgs = {
  year: string;
  stateA: string;
  stateB: string;
  federalTaxes: TaxData;
  stateTaxesA: TaxData;
  stateTaxesB: TaxData;
};

export function comparePairIntro({
  year,
  stateA,
  stateB,
  federalTaxes,
  stateTaxesA,
  stateTaxesB,
}: CompareArgs): string {
  const nameA = snakeToTitleCase(stateA);
  const nameB = snakeToTitleCase(stateB);
  const taxA = stateIncomeTax(stateTaxesA);
  const taxB = stateIncomeTax(stateTaxesB);
  const opening =
    taxA.kind === "none" && taxB.kind === "none"
      ? `In ${year}, neither ${nameA} nor ${nameB} has a state income tax.`
      : `In ${year}, ${nameA} ${stateIncomeTaxPredicate(taxA)}, while ${nameB} ${stateIncomeTaxPredicate(taxB)}.`;
  return sentences(
    opening,
    `Compare take-home pay in both at any salary, after ${deductedTaxes(
      federalTaxes,
      "each state's own taxes",
    )}.`,
  );
}
