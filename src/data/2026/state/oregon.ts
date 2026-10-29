import { INFINITY, TAXABLE_INCOME_BASIS } from "@/constants";
import { CITIES, EUGENE, PORTLAND } from "@/constants/cities";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  ART_TAX,
  EMPLOYEE_PAYROLL_TAX,
  FEDERAL_TAX_SUBTRACTION,
  OREGON_PAID_FAMILY_AND_MEDICAL_LEAVE,
  OREGON_TRANSIT_TAX,
  PERSONAL_EXEMPTION_CREDIT,
  PRESCHOOL_FOR_ALL,
  STANDARD_DEDUCTION,
  STATE_INCOME,
  SUPPORTIVE_HOUSING_SERVICES,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Verified 2026-09-07. SINGLE, MARRIED and MARRIED_SEPARATELY confirmed
  // against the 2026 withholding tax formulas (150-206-436, Rev. 12-31-25,
  // effective 2026-01-01), which compute the base wage as "standard
  // deduction ($2,910[S])" and "($5,820[M])".
  // https://www.oregon.gov/dor/forms/FormsPubs/withholding-tax-formulas_206-436_2026.pdf
  // UNSOURCED: HEAD_OF_HOUSEHOLD. The 2026 Form OR-40 instructions are not
  // published yet and the withholding formulas withhold head-of-household
  // filers at the single amount, so no final figure exists. Publication
  // OR-ESTIMATE 2026 (150-101-026, Rev. 10-07-25) lists 4,650, but it
  // labels its whole set "Estimated Oregon indexed figures" and the later
  // withholding revision raised its single and joint estimates by $10 and
  // $20, so 4,650 is likely low too. 4680 is 4,560 scaled by the confirmed
  // single-filer increase, which also preserves the ~1.61x head-of-household
  // ratio Oregon has held since 2023. Re-check against Table 5 when the
  // 2026 OR-40 instructions publish.
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 2910,
    [MARRIED]: 5820,
    [MARRIED_SEPARATELY]: 2910,
    [HEAD_OF_HOUSEHOLD]: 4680,
  },
  // Federal tax liability subtraction. SINGLE, MARRIED and HEAD_OF_HOUSEHOLD
  // verified 2026-10-23: the 2026 withholding tax formulas (150-206-436,
  // Rev. 12-31-25) print the [S] and [M] phase-out rows below ("wages >=
  // $125,000 and <$130,000 = $7,000" ... "wages >= $290,000 = $0"), and
  // Publication OR-ESTIMATE 2026 (150-101-026, Rev. 10-07-25) gives "Federal
  // tax subtraction: $0 to $8,750". The AGI thresholds are statutory and have
  // not moved since 2023. Head of household takes the joint rows, as it does
  // on every published OR-40 Table 4.
  // https://www.oregon.gov/dor/forms/FormsPubs/withholding-tax-formulas_206-436_2026.pdf
  // UNSOURCED: MARRIED_SEPARATELY. Withholding has no separate-return table
  // and the 2026 OR-40 instructions are not published. 4,375 is half the cap,
  // which is exactly what Table 4 printed in 2023, 2024 and 2025, with the
  // same 80/60/40/20% steps. Re-check against Table 4 when 2026 OR-40
  // instructions publish.
  [FEDERAL_TAX_SUBTRACTION]: {
    [SINGLE]: [
      { min: 0, max: 125000, amount: 8750 },
      { min: 125000, max: 130000, amount: 7000 },
      { min: 130000, max: 135000, amount: 5250 },
      { min: 135000, max: 140000, amount: 3500 },
      { min: 140000, max: 145000, amount: 1750 },
      { min: 145000, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 250000, amount: 8750 },
      { min: 250000, max: 260000, amount: 7000 },
      { min: 260000, max: 270000, amount: 5250 },
      { min: 270000, max: 280000, amount: 3500 },
      { min: 280000, max: 290000, amount: 1750 },
      { min: 290000, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 125000, amount: 4375 },
      { min: 125000, max: 130000, amount: 3500 },
      { min: 130000, max: 135000, amount: 2625 },
      { min: 135000, max: 140000, amount: 1750 },
      { min: 140000, max: 145000, amount: 875 },
      { min: 145000, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 250000, amount: 8750 },
      { min: 250000, max: 260000, amount: 7000 },
      { min: 260000, max: 270000, amount: 5250 },
      { min: 270000, max: 280000, amount: 3500 },
      { min: 280000, max: 290000, amount: 1750 },
      { min: 290000, max: INFINITY, amount: 0 },
    ],
  },
  // Exemption credit. $263 is verified 2026-10-23 against the 2026 withholding
  // tax formulas (150-206-436, Rev. 12-31-25), which subtract "263 x
  // allowances" -- Oregon's withholding allowance is its exemption credit,
  // as the $256 in that document's leftover 2025 example shows. Publication
  // OR-ESTIMATE 2026 (Rev. 10-07-25) printed $260 before that revision, the
  // same early-estimate gap as the standard deduction above. The $100,000 /
  // $200,000 AGI limits are statutory and unchanged since 2023. Re-check the
  // amount against the line 25 worksheet when 2026 OR-40 instructions publish.
  // https://www.oregon.gov/dor/forms/FormsPubs/withholding-tax-formulas_206-436_2026.pdf
  //
  // A nonrefundable credit per exemption, off Oregon income tax only. The
  // figures below are the total for the filer (and spouse, filing jointly);
  // dependents would add one exemption each but are not modelled. "More than
  // $100,000" means $100,000 itself still qualifies, so the cliff band starts
  // one dollar up, per the half-open band convention.
  [PERSONAL_EXEMPTION_CREDIT]: {
    [SINGLE]: [
      { min: 0, max: 100001, amount: 263 },
      { min: 100001, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 200001, amount: 526 },
      { min: 200001, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 100001, amount: 263 },
      { min: 100001, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 200001, amount: 263 },
      { min: 200001, max: INFINITY, amount: 0 },
    ],
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 4550, rate: 4.75 },
      { min: 4550, max: 11400, rate: 6.75 },
      { min: 11400, max: 125000, rate: 8.75 },
      { min: 125000, max: INFINITY, rate: 9.9 },
    ],
    [MARRIED]: [
      { min: 0, max: 9100, rate: 4.75 },
      { min: 9100, max: 22800, rate: 6.75 },
      { min: 22800, max: 250000, rate: 8.75 },
      { min: 250000, max: INFINITY, rate: 9.9 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 4550, rate: 4.75 },
      { min: 4550, max: 11400, rate: 6.75 },
      { min: 11400, max: 125000, rate: 8.75 },
      { min: 125000, max: INFINITY, rate: 9.9 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 9100, rate: 4.75 },
      { min: 9100, max: 22800, rate: 6.75 },
      { min: 22800, max: 250000, rate: 8.75 },
      { min: 250000, max: INFINITY, rate: 9.9 },
    ],
  },
  [OREGON_TRANSIT_TAX]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 0.1 }],
  },
  [OREGON_PAID_FAMILY_AND_MEDICAL_LEAVE]: {
    [ALL]: [{ min: 0, max: 184500, rate: 1, percent_of_total: 60 }],
  },
  // Portland/Eugene local layer verified 2026-09-07.
  //   Arts Education Tax - the rewritten 2026 figures all check out against
  //     the City's page: "$50 for single filers and $100 for joint filers",
  //     thresholds "$20,000 in Oregon taxable income if filing as single or
  //     married filing separately; or $40,000 ... if filing as married filing
  //     jointly, qualifying surviving spouse, or head of household". Note the
  //     head-of-household pairing is not a typo: HoH takes the joint $40,000
  //     threshold but the $50 single-filer amount, exactly as written below.
  //     https://www.portland.gov/revenue/arts-tax
  //   Metro Supportive Housing Services 1% above 128,000 / 205,000 - 2026 is
  //     the first year the thresholds are indexed, up from 125,000 / 200,000.
  //     https://www.portland.gov/revenue/personal-tax
  //   Preschool For All 1.5% / 3.0% at 125,000-250,000 (single) and
  //     200,000-400,000 (joint) confirmed unchanged for 2026. Multnomah
  //     County's page still dates the 0.8-point rise to 2027-01-01 rather
  //     than the 2028-01-01 the schedule's own comment claims; either way
  //     tax year 2026 is unaffected, so nothing here changes.
  //     https://www.multco.us/finance/preschool-all-personal-income-tax
  //   Eugene community safety payroll tax - checked against the City's own
  //     rate chart PDF for the period noted on the schedule below.
  [CITIES]: {
    [PORTLAND]: {
      // Ordinance 192185 (passed 2026-05-27) rewrote the Arts Tax for tax year
      // 2026: $35 flat becomes $50 ($100 filing jointly), and the $1,000 income
      // and federal-poverty exemptions are replaced by an Oregon-taxable-income
      // threshold of $20,000 (single/MFS) or $40,000 (MFJ/HoH). Rate and
      // threshold begin inflation-indexing in tax year 2027.
      [ART_TAX]: {
        [SINGLE]: [{ min: 20000, amount: 50, basis: TAXABLE_INCOME_BASIS }],
        [MARRIED]: [{ min: 40000, amount: 100, basis: TAXABLE_INCOME_BASIS }],
        [MARRIED_SEPARATELY]: [
          { min: 20000, amount: 50, basis: TAXABLE_INCOME_BASIS },
        ],
        [HEAD_OF_HOUSEHOLD]: [
          { min: 40000, amount: 50, basis: TAXABLE_INCOME_BASIS },
        ],
      },
      [SUPPORTIVE_HOUSING_SERVICES]: {
        [SINGLE]: [{ min: 128000, max: INFINITY, rate: 1 }],
        [MARRIED]: [{ min: 205000, max: INFINITY, rate: 1 }],
        [MARRIED_SEPARATELY]: [{ min: 128000, max: INFINITY, rate: 1 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 205000, max: INFINITY, rate: 1 }],
      },
      // Multnomah County uses the same filing-status grouping for both local
      // taxes: "single" is Single and Married filing separately; "joint" is
      // Married filing jointly, Head of household, and Qualifying surviving
      // spouse. So HEAD_OF_HOUSEHOLD belongs on the joint thresholds here,
      // exactly as it already does in SUPPORTIVE_HOUSING_SERVICES above -
      // keep the two schedules' groupings in step.
      // Unlike the SHS thresholds, the PFA thresholds are not indexed: the
      // county shelved the indexing ordinance in August 2025, so 2026 keeps
      // 125,000/200,000/250,000/400,000. The scheduled 0.8-point rate rise
      // was delayed again on 2026-08-27 and now starts 2028-01-01, so tax
      // year 2026 stays at 1.5%/3.0%.
      [PRESCHOOL_FOR_ALL]: {
        [SINGLE]: [
          { min: 125000, max: 250000, rate: 1.5 },
          { min: 250000, max: INFINITY, rate: 3.0 },
        ],
        [MARRIED_SEPARATELY]: [
          { min: 125000, max: 250000, rate: 1.5 },
          { min: 250000, max: INFINITY, rate: 3.0 },
        ],
        [MARRIED]: [
          { min: 200000, max: 400000, rate: 1.5 },
          { min: 400000, max: INFINITY, rate: 3.0 },
        ],
        [HEAD_OF_HOUSEHOLD]: [
          { min: 200000, max: 400000, rate: 1.5 },
          { min: 400000, max: INFINITY, rate: 3.0 },
        ],
      },
    },
    [EUGENE]: {
      // Community safety payroll tax. The rate chart is a lookup, not a
      // marginal schedule: wages pick a rate, and that rate is charged on all
      // subject wages. `rate_on_total` is what says so.
      [EMPLOYEE_PAYROLL_TAX]: {
        [ALL]: [
          // Chart of 7/1/2026 - 6/30/2027.
          // https://www.eugene-or.gov/DocumentCenter/View/83387/7126---63027-Employee-tax-rate-charts
          { min: 0, max: 32344, rate: 0, rate_on_total: true },
          { min: 32344, max: INFINITY, rate: 0.44, rate_on_total: true },
        ],
      },
    },
  },
} as TaxData;
