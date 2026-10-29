import { INFINITY } from "@/constants";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import { STANDARD_DEDUCTION, STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Maine's Code conformity date was still fixed at 2024-12-31 when OBBBA
  // passed, so Maine did not take the raised federal figures; L.D. 2212
  // wrote these 2025 amounts straight into 36 M.R.S. 5124-C(1-B). They
  // equal the pre-OBBBA federal numbers by statute, not by conformity.
  //
  // Maine's deduction is not flat: 36 M.R.S. 5124-C(2) phases it out over a
  // fixed span of Maine AGI, so this is a schedule. The amounts this file
  // used to carry alone are the base amounts, which survive intact only up to
  // the threshold below and are gone entirely one span above it.
  //
  // The rule is the Worksheet for Standard / Itemized Deductions printed with
  // Form 1040ME, line 17. In its own steps: take Maine AGI, subtract the
  // threshold (line 2), divide the excess by the span (line 4) capping the
  // quotient at 1.0000 (line 5), multiply the base deduction by that fraction
  // (line 7) and subtract the product (line 8). So the deduction falls in a
  // straight line from the base amount at the threshold to zero one span
  // above it, which is `reduce_rate` = base / span, measured from the
  // threshold. The span is the same every year: $75,000 single and married
  // filing separately, $112,500 head of household, $150,000 filing jointly.
  //
  // The worksheet is "greater than" the threshold, so each band starts one
  // dollar above the printed figure.
  //
  // MRS rounds its line 5 fraction to four decimal places and the calculator
  // does not. Sampled across the phase-out range the two never differ by more
  // than a dollar of deduction, and only where the exact figure lands on a
  // half dollar and the two round it opposite ways - about seven cents of
  // tax. The divergence is unsigned - the calculator runs a dollar low at 2025
  // head of household on $192,188 and a dollar high at 2026 head of household
  // on $215,275 - so do not try to correct for it in one direction.
  //
  // Cross-checked against the worksheet, and 2025 is the clean year: every
  // base divided by its span is exactly 20%. Single at $137,500: excess
  // 37,500, 37,500 / 75,000 = 0.5000, 15,000 x 0.5 = 7,500 reduced,
  // deduction $7,500 - and 37,500 x 20% = 7,500. Joint at $275,050: excess
  // 75,000, quotient 0.5000, deduction $15,000. Single at $175,000: excess
  // 75,000, quotient 1.0000, deduction $0, which is where the third band
  // starts.
  //
  // Source: MRS 2025 Form 1040ME general instructions - "Worksheet for
  // Standard / Itemized Deductions (for Form 1040ME, line 17)" for the
  // phase-out, "2025 Tax Year Quick Facts" and the "Maine Standard Deduction
  // Chart for line 17" for the base amounts.
  // https://www.maine.gov/revenue/sites/maine.gov.revenue/files/inline-files/25_1040me_gen_instr_w_cover_pg.pdf
  // Base amounts corroborated by the 2025 Individual Income Tax Rate
  // Schedules.
  // https://www.maine.gov/revenue/sites/maine.gov.revenue/files/inline-files/ind_tax_rate_sched_2025.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 100001, amount: 15000 },
      {
        min: 100001,
        max: 175001,
        amount: 15000,
        reduce_from: 100000,
        reduce_rate: 20,
      },
      { min: 175001, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 200051, amount: 30000 },
      {
        min: 200051,
        max: 350051,
        amount: 30000,
        reduce_from: 200050,
        reduce_rate: 20,
      },
      { min: 350051, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 100001, amount: 15000 },
      {
        min: 100001,
        max: 175001,
        amount: 15000,
        reduce_from: 100000,
        reduce_rate: 20,
      },
      { min: 175001, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 150001, amount: 22500 },
      {
        min: 150001,
        max: 262501,
        amount: 22500,
        reduce_from: 150000,
        reduce_rate: 20,
      },
      { min: 262501, max: INFINITY, amount: 0 },
    ],
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 26800, rate: 5.8 },
      { min: 26800, max: 63450, rate: 6.75 },
      { min: 63450, max: INFINITY, rate: 7.15 },
    ],
    [MARRIED]: [
      { min: 0, max: 53600, rate: 5.8 },
      { min: 53600, max: 126900, rate: 6.75 },
      { min: 126900, max: INFINITY, rate: 7.15 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 26800, rate: 5.8 },
      { min: 26800, max: 63450, rate: 6.75 },
      { min: 63450, max: INFINITY, rate: 7.15 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 40200, rate: 5.8 },
      { min: 40200, max: 95150, rate: 6.75 },
      { min: 95150, max: INFINITY, rate: 7.15 },
    ],
  },
} as TaxData;
