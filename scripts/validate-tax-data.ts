import {
  CITIES,
  INCOME_BASES,
  INFINITY,
  STATE_INCOME_TAX_BASIS,
  TAX_BASES,
  TAX_FREQUENCY_PERIODS_PER_YEAR,
} from "@/constants";
import {
  MARRIED,
  SINGLE,
  MARRIED_SEPARATELY,
  HEAD_OF_HOUSEHOLD,
  ALL,
} from "@/constants/filing-status";
import {
  ART_TAX,
  FEDERAL_INCOME,
  FEDERAL_TAX_SUBTRACTION,
  PERSONAL_EXEMPTION_CREDIT,
  MAX_401K_CONTRIBUTION,
  MEDICARE,
  NONE,
  SOCIAL_SECURITY,
  STANDARD_DEDUCTION,
  STATE_INCOME,
} from "@/constants/tax_types";
import { ALL_STATES } from "@/constants/states";
import { readTaxDataFromDisk } from "@/utils/read-tax-data";
import { resolveStandardDeduction } from "@/utils/standard-deduction";
import Joi from "joi";

const yearSchema = Joi.string().pattern(/^\d{4}$/);

const isSnakeCaseRegex = /^[a-z0-9_]+$/;

const max = Joi.alternatives(
  Joi.number().integer(),
  Joi.string().valid(INFINITY),
);

// One row of a published standard-deduction schedule, for the five states that
// shrink the deduction as income rises. See DeductionBand in types/.
const deductionBand = Joi.object()
  .keys({
    min: Joi.number().integer().min(0).required(),
    max: max.required(),
    amount: Joi.number().min(0).required(),
    reduce_from: Joi.number().integer().min(0).optional(),
    reduce_rate: Joi.number().greater(0).max(100).optional(),
    reduce_per: Joi.number().greater(0).optional(),
    reduce_by: Joi.number().greater(0).optional(),
    percent_of_income: Joi.number().greater(0).max(100).optional(),
    floor: Joi.number().min(0).optional(),
  })
  // A band reduces at a rate or in steps, never both, and a step needs both
  // halves to mean anything. A percentage-of-income band does not reduce at
  // all -- it rises -- so it cannot carry either.
  .nand("reduce_rate", "reduce_per")
  .and("reduce_per", "reduce_by")
  .nand("percent_of_income", "reduce_rate")
  .nand("percent_of_income", "reduce_per");

const standardDeduction = Joi.alternatives(
  Joi.number().integer(),
  // A single band is a flat amount written the long way round; two is the
  // fewest that expresses a phase-out.
  Joi.array().items(deductionBand).min(2),
);

const standardDeductions = Joi.object().keys({
  [SINGLE]: standardDeduction.required(),
  [MARRIED]: standardDeduction.required(),
  [MARRIED_SEPARATELY]: standardDeduction.required(),
  [HEAD_OF_HOUSEHOLD]: standardDeduction.required(),
});

// Amounts are converted with `amount * 100` into Dinero, which rejects
// non-integers. Anything finer than a cent throws at runtime.
const wholeCents = Joi.number().custom((value, helpers) => {
  if (Math.abs(value * 100 - Math.round(value * 100)) > 1e-9) {
    return helpers.error("any.invalid");
  }
  return value;
}, "whole cents");

const rateBracket = Joi.object().keys({
  min: Joi.number().integer().required(),
  // Required: a missing max reaches asCurrency(undefined) and throws.
  max: max.required(),
  rate: Joi.number().min(0).max(60).required(),
  percent_of_total: Joi.number().min(0).max(100).optional(),
  // Marks a rate-lookup schedule; see isRateLookupSchedule in utils/calculator.
  rate_on_total: Joi.boolean().valid(true).optional(),
  // Tax already owed at the bracket's floor. See isBaseAmountSchedule.
  base_amount: wholeCents.min(0).optional(),
  // Rate schedules may also be charged on the computed state income tax --
  // Yonkers' resident surcharge. calculateFlatFee has no such base, so the
  // flat-fee schema below keeps to the two income bases.
  basis: Joi.string()
    .valid(...TAX_BASES)
    .optional(),
});

const flatFeeBracket = Joi.object().keys({
  min: Joi.number().integer().min(0).optional(),
  amount: wholeCents.required(),
  frequency: Joi.string()
    .valid(...Object.keys(TAX_FREQUENCY_PERIODS_PER_YEAR))
    .optional(),
  basis: Joi.string()
    .valid(...INCOME_BASES)
    .optional(),
});

const singleBracket = Joi.array()
  .items(Joi.alternatives(rateBracket, flatFeeBracket))
  .min(1);

const brackets = Joi.alternatives(
  // All four filing statuses, or none of them. A partial set means
  // calculateTaxBracket is handed undefined for the missing ones.
  Joi.object()
    .keys({
      [SINGLE]: singleBracket.required(),
      [MARRIED]: singleBracket.required(),
      [MARRIED_SEPARATELY]: singleBracket.required(),
      [HEAD_OF_HOUSEHOLD]: singleBracket.required(),
    })
    .required(),
  Joi.object()
    .keys({
      [ALL]: singleBracket.required(),
    })
    .required(),
  Joi.string().valid(NONE).required(),
);

const federalTaxData = Joi.object().keys({
  [STANDARD_DEDUCTION]: standardDeductions,
  [MAX_401K_CONTRIBUTION]: Joi.number().required(),
  [FEDERAL_INCOME]: brackets,
  [SOCIAL_SECURITY]: brackets,
  [MEDICARE]: brackets,
});

const stateTaxData = Joi.object()
  .keys({
    [STANDARD_DEDUCTION]: standardDeductions,
    // Same shape as a standard deduction: a cap, or bands chosen by income.
    [FEDERAL_TAX_SUBTRACTION]: standardDeductions,
    // A credit per filing status, in the same shape; bands write an AGI limit.
    [PERSONAL_EXEMPTION_CREDIT]: standardDeductions,
    [STATE_INCOME]: brackets,
    [CITIES]: Joi.object().optional(),
  })
  .pattern(/^\w+$/, brackets);

const cityTaxData = Joi.object()
  .keys({
    [ART_TAX]: brackets,
  })
  .pattern(/^\w+$/, brackets);

const errors: string[] = [];

/**
 * Rate brackets must be ordered and contiguous: each bracket's `max` is the
 * next one's `min`. A gap leaves a slice of income untaxed, an overlap taxes it
 * twice, and anything after an INFINITY bracket is unreachable.
 *
 * Checked here rather than in the Joi schema because `brackets` is an
 * alternatives() and Joi collapses an inner failure into a generic "does not
 * match any of the allowed types", which tells a contributor nothing.
 */
function validateBracketOrdering(location: string, taxTypeData: any): string[] {
  if (!taxTypeData || typeof taxTypeData !== "object") {
    return [];
  }
  const problems: string[] = [];
  for (const [statusKey, bracketList] of Object.entries<any>(taxTypeData)) {
    if (!Array.isArray(bracketList)) {
      continue;
    }
    const rates = bracketList.filter(
      (bracket) => typeof bracket?.rate !== "undefined",
    );
    for (let i = 0; i < rates.length; i++) {
      const bracket = rates[i];
      const where = `${location}[${statusKey}][${i}]`;
      if (typeof bracket.max === "number" && bracket.max <= bracket.min) {
        problems.push(
          `${where}: max ${bracket.max} must be greater than min ${bracket.min}`,
        );
        continue;
      }
      if (i === 0) {
        continue;
      }
      const previous = rates[i - 1];
      // A base amount is the tax already owed at the band's floor, so it can
      // only grow with income. A base below the one beneath it would mean the
      // bill falls as income rises, which is a transposed row.
      if (
        typeof bracket.base_amount === "number" &&
        typeof previous.base_amount === "number" &&
        bracket.base_amount < previous.base_amount
      ) {
        problems.push(
          `${where}: base_amount ${bracket.base_amount} is below the previous bracket's ${previous.base_amount}, so tax would fall as income rises`,
        );
      }
      if (previous.max === INFINITY) {
        problems.push(
          `${where}: follows an ${INFINITY} bracket, so it can never be reached`,
        );
      } else if (previous.max !== bracket.min) {
        problems.push(
          `${where}: min ${bracket.min} does not meet the previous bracket's max ${previous.max}`,
        );
      }
    }
  }
  return problems;
}

/**
 * A surcharge on the state's own tax is not an income schedule.
 *
 * It has no bands: the rate applies to the whole of the state tax, whatever
 * the income. Writing it with income breakpoints would mean restating the
 * state's schedule in a second place -- exactly the duplication this basis
 * exists to avoid -- and would put rates on the tax-tables page that appear in
 * no published document.
 */
function validateStateTaxBasis(location: string, taxTypeData: any): string[] {
  if (!taxTypeData || typeof taxTypeData !== "object") {
    return [];
  }
  const problems: string[] = [];
  for (const [statusKey, bracketList] of Object.entries<any>(taxTypeData)) {
    if (!Array.isArray(bracketList) || !bracketList.length) {
      continue;
    }
    if (bracketList[0]?.basis !== STATE_INCOME_TAX_BASIS) {
      continue;
    }
    const where = `${location}[${statusKey}]`;
    if (bracketList.length !== 1) {
      problems.push(
        `${where}: a ${STATE_INCOME_TAX_BASIS} schedule has no income bands, so it must be a single bracket, not ${bracketList.length}`,
      );
    }
    const only = bracketList[0];
    if (only.min !== 0 || only.max !== INFINITY) {
      problems.push(
        `${where}: a ${STATE_INCOME_TAX_BASIS} bracket must span 0 to ${INFINITY}, not ${only.min} to ${only.max}`,
      );
    }
    if (only.base_amount !== undefined || only.rate_on_total !== undefined) {
      problems.push(
        `${where}: a ${STATE_INCOME_TAX_BASIS} bracket cannot also carry base_amount or rate_on_total`,
      );
    }
  }
  return problems;
}

/**
 * A banded standard deduction must cover every income exactly once, and must
 * never allow more deduction at a higher income than at a lower one.
 *
 * The bands are a transcription of a published schedule, so the failure mode
 * is a mistyped boundary: a gap leaves an income with no band at all, and a
 * reversed amount means a row was copied into the wrong place. Neither shows
 * up as a wrong-looking number until someone happens to enter an income in the
 * affected range.
 */
function validateDeductionBands(location: string, taxTypeData: any): string[] {
  if (!taxTypeData || typeof taxTypeData !== "object") {
    return [];
  }
  const problems: string[] = [];
  for (const [statusKey, bands] of Object.entries<any>(taxTypeData)) {
    if (!Array.isArray(bands)) {
      continue;
    }
    const where = `${location}[${statusKey}]`;

    if (bands[0]?.min !== 0) {
      problems.push(
        `${where}: first band starts at ${bands[0]?.min}, so income below it has no deduction band`,
      );
    }
    const last = bands[bands.length - 1];
    if (last?.max !== INFINITY) {
      problems.push(
        `${where}: last band ends at ${last?.max} rather than ${INFINITY}, so high incomes have no band`,
      );
    }

    for (let i = 0; i < bands.length; i++) {
      const band = bands[i];
      if (typeof band.max === "number" && band.max <= band.min) {
        problems.push(
          `${where}[${i}]: max ${band.max} must be greater than min ${band.min}`,
        );
        continue;
      }
      if (band.floor !== undefined && band.floor > band.amount) {
        problems.push(
          `${where}[${i}]: floor ${band.floor} is above the band's own amount ${band.amount}`,
        );
      }
      if (i > 0) {
        const previous = bands[i - 1];
        if (previous.max === INFINITY) {
          problems.push(
            `${where}[${i}]: follows an ${INFINITY} band, so it can never be reached`,
          );
        } else if (previous.max !== band.min) {
          problems.push(
            `${where}[${i}]: min ${band.min} does not meet the previous band's max ${previous.max}`,
          );
        }
      }
    }

    // Walk the schedule and confirm it only ever moves one way. Most phase
    // out, but Montana's pre-2024 rule was a percentage of AGI and rose to a
    // cap, so the check is monotonicity rather than a fixed direction: a
    // schedule that both rises and falls is a transcription error. Sampling
    // each band's own ends is enough, since within a band the amount is
    // monotonic by construction.
    let previousAllowed: number | undefined;
    let rises = false;
    let falls = false;
    for (const band of bands) {
      const samples = [band.min];
      samples.push(
        typeof band.max === "number" ? band.max - 1 : band.min + 1_000_000,
      );
      for (const income of samples) {
        const allowed = resolveStandardDeduction(bands, income) ?? 0;
        if (previousAllowed !== undefined) {
          if (allowed > previousAllowed) rises = true;
          if (allowed < previousAllowed) falls = true;
        }
        previousAllowed = allowed;
      }
    }
    if (rises && falls) {
      problems.push(
        `${where}: the deduction both rises and falls as income rises, so at least one band is transcribed wrong`,
      );
    }
  }
  return problems;
}

/**
 * `rate_on_total` and `basis` are schedule-wide facts written per bracket, and
 * the calculator reads both off the first bracket. Setting either on only some
 * brackets does nothing at all, silently — so require all or none.
 */
function validateScheduleUniformity(
  location: string,
  taxTypeData: any,
): string[] {
  if (!taxTypeData || typeof taxTypeData !== "object") {
    return [];
  }
  const problems: string[] = [];
  for (const [statusKey, bracketList] of Object.entries<any>(taxTypeData)) {
    if (!Array.isArray(bracketList) || bracketList.length < 2) {
      continue;
    }
    // Rate schedules only. calculateFlatFee reads `basis` per bracket, so a
    // fee schedule may legitimately measure its tiers against different bases.
    if (bracketList.some((bracket) => typeof bracket?.rate === "undefined")) {
      continue;
    }
    for (const field of ["rate_on_total", "basis", "base_amount"]) {
      const set = bracketList.filter(
        (bracket) => typeof bracket?.[field] !== "undefined",
      );
      if (set.length === 0 || set.length === bracketList.length) {
        continue;
      }
      problems.push(
        `${location}[${statusKey}]: ${field} is set on ${set.length} of ${bracketList.length} brackets. It describes the whole schedule, so set it on every bracket or none.`,
      );
    }
    const distinct = new Set(
      bracketList.map((bracket) => bracket?.basis).filter(Boolean),
    );
    if (distinct.size > 1) {
      problems.push(
        `${location}[${statusKey}]: brackets declare more than one basis (${[...distinct].join(", ")}); only the first is used.`,
      );
    }
  }
  return problems;
}

/**
 * Invariants that hold for the main income taxes but not for every tax.
 *
 * Scoped deliberately to `federal_income` and `state_income`. Applied to the
 * whole data set these produce 146 false positives, all legitimate: wage-capped
 * taxes (Social Security, the state SDI/FAMLI/TDI family) top out at a finite
 * max and express the cap as a trailing 0% bracket, which reads as a rate
 * decrease; New Hampshire's interest-and-dividends tax and Portland's
 * supportive-housing and preschool taxes start above $0 because they are
 * threshold taxes. A broad rule here would train contributors to ignore the
 * validator, which is worse than not having the rule.
 */
function validateIncomeTaxSchedule(
  location: string,
  taxTypeData: any,
): string[] {
  if (!taxTypeData || typeof taxTypeData !== "object") {
    return [];
  }
  const problems: string[] = [];
  for (const [statusKey, bracketList] of Object.entries<any>(taxTypeData)) {
    if (!Array.isArray(bracketList)) {
      continue;
    }
    const rates = bracketList.filter(
      (bracket) => typeof bracket?.rate !== "undefined",
    );
    if (!rates.length) {
      continue;
    }
    const where = `${location}[${statusKey}]`;

    // Income below the first bracket is charged nothing at all. A state that
    // genuinely exempts a first slice of income says so with a 0% bracket
    // starting at 0, which is also what makes the bracket table render it.
    if (rates[0].min !== 0) {
      problems.push(
        `${where}: first bracket starts at ${rates[0].min}, so income below that is untaxed. Use an explicit 0% bracket from 0.`,
      );
    }

    // A finite top bracket silently stops taxing the highest earners.
    const top = rates[rates.length - 1];
    if (top.max !== INFINITY) {
      problems.push(
        `${where}: top bracket ends at ${top.max}, so income above it is untaxed. The last bracket must run to ${INFINITY}.`,
      );
    }

    for (let i = 1; i < rates.length; i++) {
      if (rates[i].rate < rates[i - 1].rate) {
        problems.push(
          `${where}[${i}]: rate ${rates[i].rate}% is lower than the previous bracket's ${rates[i - 1].rate}%`,
        );
      }
    }
  }
  return problems;
}

async function main() {
  const { taxDataByYear } = await readTaxDataFromDisk(
    process.cwd() + "/src/data",
  );
  let errorCount = 0;

  // Walk every bracket list in the data set and check ordering separately from
  // the Joi shape validation.
  const checkOrdering = (location: string, taxData: any) => {
    for (const [taxType, taxTypeData] of Object.entries<any>(taxData || {})) {
      if (taxType === MAX_401K_CONTRIBUTION) {
        continue;
      }
      if (
        taxType === STANDARD_DEDUCTION ||
        taxType === FEDERAL_TAX_SUBTRACTION ||
        taxType === PERSONAL_EXEMPTION_CREDIT
      ) {
        for (const problem of validateDeductionBands(
          `${location}/${taxType}`,
          taxTypeData,
        )) {
          errorCount++;
          errors.push(`${errorCount}. ${problem}`);
        }
        continue;
      }
      if (taxType === CITIES) {
        for (const [city, cityData] of Object.entries<any>(taxTypeData || {})) {
          for (const [cityTax, cityTaxData] of Object.entries<any>(
            cityData || {},
          )) {
            const where = `${location}/${city}/${cityTax}`;
            for (const problem of [
              ...validateBracketOrdering(where, cityTaxData),
              ...validateScheduleUniformity(where, cityTaxData),
              ...validateStateTaxBasis(where, cityTaxData),
            ]) {
              errorCount++;
              errors.push(`${errorCount}. ${problem}`);
            }
          }
        }
        continue;
      }
      const checks = [
        ...validateBracketOrdering(`${location}/${taxType}`, taxTypeData),
        ...validateScheduleUniformity(`${location}/${taxType}`, taxTypeData),
        // Only a city can levy this: a state tax charged on itself is
        // circular, and nothing computes a state tax before the state pass.
        ...(Object.values<any>(taxTypeData ?? {}).some(
          (schedule) =>
            Array.isArray(schedule) &&
            schedule[0]?.basis === STATE_INCOME_TAX_BASIS,
        )
          ? [
              `${location}/${taxType}: ${STATE_INCOME_TAX_BASIS} is only meaningful for a city tax, and this is levied at state level`,
            ]
          : []),
        ...(taxType === FEDERAL_INCOME || taxType === STATE_INCOME
          ? validateIncomeTaxSchedule(`${location}/${taxType}`, taxTypeData)
          : []),
      ];
      for (const problem of checks) {
        errorCount++;
        errors.push(`${errorCount}. ${problem}`);
      }
    }
  };

  for (const [year, dataByYear] of Object.entries(taxDataByYear)) {
    // Validate that year is valid
    try {
      await yearSchema.validateAsync(year, {
        abortEarly: false,
        convert: false,
      });
    } catch (error) {
      errorCount++;
      errors.push(`${errorCount}. Invalid year: ${year}`);
    }

    // Validate that federal tax data is valid
    if (!dataByYear.federal) {
      errorCount++;
      errors.push(`${errorCount}. No federal tax data for year ${year}`);
    } else {
      try {
        await federalTaxData.validateAsync(dataByYear.federal, {
          abortEarly: false,
          convert: false,
        });
      } catch (error: any) {
        errorCount++;
        errors.push(`${errorCount}. For ${year}/federal: ${error?.message}`);
      }
      checkOrdering(`${year}/federal`, dataByYear.federal);
    }

    // The roster has to match ALL_STATES exactly. A file that is missing, or
    // named something the constant does not list, produces no error anywhere
    // else: the year simply renders with a state quietly absent from the
    // picker, and the routes for it stop being generated.
    const statesPresent = Object.keys(dataByYear).filter(
      (key) => key !== "federal",
    );
    for (const expected of ALL_STATES) {
      if (!statesPresent.includes(expected)) {
        errorCount++;
        errors.push(`${errorCount}. ${year} has no data file for ${expected}`);
      }
    }
    for (const present of statesPresent) {
      if (!ALL_STATES.includes(present)) {
        errorCount++;
        errors.push(
          `${errorCount}. ${year}/${present} is not in ALL_STATES, so nothing will link to it`,
        );
      }
    }

    for (const [state, stateData] of Object.entries(dataByYear)) {
      if (state === "federal") {
        continue;
      }
      if (!isSnakeCaseRegex.test(state)) {
        errorCount++;
        errors.push(
          `${errorCount}. Invalid state name: ${state}. Must be snake_case`,
        );
      }
      try {
        await stateTaxData.validateAsync(stateData, {
          abortEarly: false,
          convert: false,
        });
      } catch (error: any) {
        errorCount++;
        errors.push(`${errorCount}. For ${year}/${state}: ${error?.message}`);
      }
      checkOrdering(`${year}/${state}`, stateData);

      if (stateData[CITIES]) {
        for (const [city, cityData] of Object.entries(stateData[CITIES])) {
          if (!isSnakeCaseRegex.test(city)) {
            errorCount++;
            errors.push(
              `${errorCount}. Invalid city name: ${city}. Must be snake_case`,
            );
          }
          try {
            await cityTaxData.validateAsync(cityData, {
              abortEarly: false,
              convert: false,
            });
          } catch (error: any) {
            for (const detail of error?.details) {
              errorCount++;
              errors.push(
                `${errorCount}. For ${year}/${state}/${city}: ${detail?.context?.message}`,
              );
            }
          }
        }
      }
    }
  }

  if (errors.length) {
    console.log(`Found ${errors.length} errors:`);
    console.error(errors);
    process.exit(1);
  } else {
    console.log("Tax data is valid! No errors found.");
    process.exit(0);
  }
}

main();
