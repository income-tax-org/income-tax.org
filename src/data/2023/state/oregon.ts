import { INFINITY } from "@/constants";
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
  PRESCHOOL_FOR_ALL,
  STANDARD_DEDUCTION,
  STATE_INCOME,
  SUPPORTIVE_HOUSING_SERVICES,
  OREGON_TRANSIT_TAX,
  PERSONAL_EXEMPTION_CREDIT,
} from "@/constants/tax_types";
import type { TaxData } from "@/types";

export default {
  // Verified 2026-09-07: all four correct. The 5210 joint figure being
  // exactly 2x single is Oregon's published number here, not a derivation -
  // 2024 is the year where the doubling does not hold.
  // MARRIED_SEPARATELY equals SINGLE because Table 5 splits the status in
  // two: the full single amount if your spouse also takes the standard
  // deduction, $0 if your spouse itemizes. This models the first case.
  // Source: 2023 Form OR-40 instructions, "Table 5. Standard deduction".
  // https://www.oregon.gov/dor/forms/FormsPubs/form-or-40-inst_101-040-1_2023.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 2605,
    [MARRIED]: 5210,
    [MARRIED_SEPARATELY]: 2605,
    [HEAD_OF_HOUSEHOLD]: 4195,
  },
  // Federal tax liability subtraction, verified against Table 4 of the 2023
  // Form OR-40 instructions (150-101-040-1, Rev. 03-20-24): "limited to
  // $7,800 ($3,900 if married filing separately)", phased out by federal AGI.
  // Rows are transcribed as printed -- the steps are rounded, so 6,250 is not
  // exactly 80% of 7,800. Head of household shares the joint rows.
  // https://www.oregon.gov/dor/forms/FormsPubs/form-or-40-inst_101-040-1_2023.pdf
  [FEDERAL_TAX_SUBTRACTION]: {
    [SINGLE]: [
      { min: 0, max: 125000, amount: 7800 },
      { min: 125000, max: 130000, amount: 6250 },
      { min: 130000, max: 135000, amount: 4700 },
      { min: 135000, max: 140000, amount: 3100 },
      { min: 140000, max: 145000, amount: 1550 },
      { min: 145000, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 250000, amount: 7800 },
      { min: 250000, max: 260000, amount: 6250 },
      { min: 260000, max: 270000, amount: 4700 },
      { min: 270000, max: 280000, amount: 3100 },
      { min: 280000, max: 290000, amount: 1550 },
      { min: 290000, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 125000, amount: 3900 },
      { min: 125000, max: 130000, amount: 3125 },
      { min: 130000, max: 135000, amount: 2350 },
      { min: 135000, max: 140000, amount: 1550 },
      { min: 140000, max: 145000, amount: 775 },
      { min: 145000, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 250000, amount: 7800 },
      { min: 250000, max: 260000, amount: 6250 },
      { min: 260000, max: 270000, amount: 4700 },
      { min: 270000, max: 280000, amount: 3100 },
      { min: 280000, max: 290000, amount: 1550 },
      { min: 290000, max: INFINITY, amount: 0 },
    ],
  },
  // Exemption credit, verified against the 2023 Form OR-40 instructions
  // (150-101-040-1, Rev. 03-20-24), line 25 worksheet: "Line 4 times $236",
  // and 0 "if your federal AGI is more than $200,000 ($100,000 if your filing
  // status is single or married filing separately)".
  // https://www.oregon.gov/dor/forms/FormsPubs/form-or-40-inst_101-040-1_2023.pdf
  //
  // A nonrefundable credit per exemption, off Oregon income tax only. The
  // figures below are the total for the filer (and spouse, filing jointly);
  // dependents would add one exemption each but are not modelled. "More than
  // $100,000" means $100,000 itself still qualifies, so the cliff band starts
  // one dollar up, per the half-open band convention.
  [PERSONAL_EXEMPTION_CREDIT]: {
    [SINGLE]: [
      { min: 0, max: 100001, amount: 236 },
      { min: 100001, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 200001, amount: 472 },
      { min: 200001, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 100001, amount: 236 },
      { min: 100001, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 200001, amount: 236 },
      { min: 200001, max: INFINITY, amount: 0 },
    ],
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 4300, rate: 4.75 },
      { min: 4300, max: 10750, rate: 6.75 },
      { min: 10750, max: 125000, rate: 8.75 },
      { min: 125000, max: INFINITY, rate: 9.9 },
    ],
    [MARRIED]: [
      { min: 0, max: 8600, rate: 4.75 },
      { min: 8600, max: 21500, rate: 6.75 },
      { min: 21500, max: 250000, rate: 8.75 },
      { min: 250000, max: INFINITY, rate: 9.9 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 4300, rate: 4.75 },
      { min: 4300, max: 10750, rate: 6.75 },
      { min: 10750, max: 125000, rate: 8.75 },
      { min: 125000, max: INFINITY, rate: 9.9 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 8600, rate: 4.75 },
      { min: 8600, max: 21500, rate: 6.75 },
      { min: 21500, max: 250000, rate: 8.75 },
      { min: 250000, max: INFINITY, rate: 9.9 },
    ],
  },
  [OREGON_TRANSIT_TAX]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 0.1 }],
  },
  [OREGON_PAID_FAMILY_AND_MEDICAL_LEAVE]: {
    [ALL]: [{ min: 0, max: 132900, rate: 1, percent_of_total: 60 }],
  },
  // Portland/Eugene local layer verified 2026-09-07.
  //   Arts Education Tax $35 with a $1,000 income floor - the City's own
  //     history section: from 2012 through 2025 the tax "was owed by any
  //     resident whose household annual income was above the annual federal
  //     poverty level and/or who had more than $1,000 of annual taxable
  //     income". The poverty-level half of that test is not modelled; the
  //     $1,000 floor is.
  //     https://www.portland.gov/revenue/arts-tax
  //   Metro Supportive Housing Services 1% above 125,000 (single and married
  //     filing separately) / 200,000 (joint and head of household). The
  //     thresholds were fixed at those figures for 2021-2025.
  //     https://www.portland.gov/revenue/personal-tax
  //   Eugene community safety payroll tax - checked against the City's own
  //     rate chart PDF for the period noted on the schedule below.
  [CITIES]: {
    [PORTLAND]: {
      [ART_TAX]: {
        [ALL]: [{ min: 1000, amount: 35 }],
      },
      [SUPPORTIVE_HOUSING_SERVICES]: {
        [SINGLE]: [{ min: 125000, max: INFINITY, rate: 1 }],
        [MARRIED]: [{ min: 200000, max: INFINITY, rate: 1 }],
        [MARRIED_SEPARATELY]: [{ min: 125000, max: INFINITY, rate: 1 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 200000, max: INFINITY, rate: 1 }],
      },
      // Multnomah County uses the same filing-status grouping for both local
      // taxes: "single" is Single and Married filing separately; "joint" is
      // Married filing jointly, Head of household, and Qualifying surviving
      // spouse. So HEAD_OF_HOUSEHOLD belongs on the joint thresholds here,
      // exactly as it already does in SUPPORTIVE_HOUSING_SERVICES above -
      // keep the two schedules' groupings in step.
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
          // Chart of 7/1/2023 - 6/30/2024. Exempt below the Oregon minimum
          // wage annualised; the reduced 0.30% band runs up to the $15.00/hr
          // equivalent set by Ordinance 20616.
          // https://www.eugene-or.gov/DocumentCenter/View/70580/7123---63024-Employee-tax-rate-charts
          { min: 0, max: 29557, rate: 0, rate_on_total: true },
          { min: 29557, max: 31221, rate: 0.3, rate_on_total: true },
          { min: 31221, max: INFINITY, rate: 0.44, rate_on_total: true },
        ],
      },
    },
  },
} as TaxData;
