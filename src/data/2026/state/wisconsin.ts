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
  // Wisconsin's standard deduction shrinks as income rises, so it is a
  // schedule rather than one number per filing status. Each band below is one
  // printed row of the DOR's own schedule; the amounts here are the maxima
  // that used to be stored alone, which a filer only gets at the very bottom
  // of the income range.
  //
  // Two things to know when transcribing one of these:
  //
  //  * Bands are half-open, [min, max). A printed row reading "over $X but not
  //    over $Y" becomes `min: X + 1, max: Y + 1`, so every boundary below is
  //    one dollar above the figure on the page.
  //  * Head of household phases out twice. It falls at 22.515% until it meets
  //    the single taxpayer's schedule, then continues on that schedule -- and
  //    the DOR keeps measuring the second stage from the *first* threshold,
  //    which is what `reduce_from` is for. The two formulas agree to within a
  //    few cents at the crossover, which is how the crossover was chosen.
  //
  // Source: 2026 Form 1-ES instructions, "2026 Standard Deduction" schedules.
  // https://www.revenue.wi.gov/TaxForms2026/2026-Form1-ES-inst.pdf
  // Verified: evaluated at the midpoint of each $500 step, this schedule
  // reproduces every row of the Form 1 Standard Deduction Table exactly, for
  // all four filing statuses. The calculator evaluates at the taxpayer's own
  // income rather than snapping to a step, so it can sit up to half a step
  // away from the printed table -- at most about $50 of deduction for a joint
  // filer, $30 for a single one, which is a couple of dollars of tax.
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 20120, amount: 13960 },
      { min: 20120, max: 136454, amount: 13960, reduce_rate: 12 },
      { min: 136454, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 29040, amount: 25840 },
      { min: 29040, max: 159691, amount: 25840, reduce_rate: 19.778 },
      { min: 159691, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 13780, amount: 12280 },
      { min: 13780, max: 75870, amount: 12280, reduce_rate: 19.778 },
      { min: 75870, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 20120, amount: 18030 },
      { min: 20120, max: 58828, amount: 18030, reduce_rate: 22.515 },
      {
        min: 58828,
        max: 136454,
        amount: 13960,
        reduce_from: 20120,
        reduce_rate: 12,
      },
      { min: 136454, max: INFINITY, amount: 0 },
    ],
  },
  // Verified: the cumulative "Gross Tax is" figures in the 2026 Form 1-ES
  // rate schedules ($528.85 / $2,149.81 / $17,030.62 for single and head of
  // household, and the joint and separate equivalents) reconcile to the cent
  // with these brackets at 3.5/4.4/5.3/7.65.
  // Married filing separately is NOT exactly half of joint: Wisconsin rounds
  // to $10,080 and $221,820, where halving joint would give $10,075 and
  // $221,815. The file held the halved figures until this was checked.
  // Head of household shares the single schedule (1-ES Schedule A).
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 15110, rate: 3.5 },
      { min: 15110, max: 51950, rate: 4.4 },
      { min: 51950, max: 332720, rate: 5.3 },
      { min: 332720, max: INFINITY, rate: 7.65 },
    ],
    [MARRIED]: [
      { min: 0, max: 20150, rate: 3.5 },
      { min: 20150, max: 69260, rate: 4.4 },
      { min: 69260, max: 443630, rate: 5.3 },
      { min: 443630, max: INFINITY, rate: 7.65 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 10080, rate: 3.5 },
      { min: 10080, max: 34630, rate: 4.4 },
      { min: 34630, max: 221820, rate: 5.3 },
      { min: 221820, max: INFINITY, rate: 7.65 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 15110, rate: 3.5 },
      { min: 15110, max: 51950, rate: 4.4 },
      { min: 51950, max: 332720, rate: 5.3 },
      { min: 332720, max: INFINITY, rate: 7.65 },
    ],
  },
} as TaxData;
