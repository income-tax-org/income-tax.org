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
  // Source: 2023 Form 1-ES instructions, "2023 Standard Deduction" schedules.
  // https://www.revenue.wi.gov/TaxForms2023/2023-Form1-ES-inst.pdf
  // Verified: evaluated at the midpoint of each $500 step, this schedule
  // reproduces every row of the Form 1 Standard Deduction Table exactly, for
  // all four filing statuses. The calculator evaluates at the taxpayer's own
  // income rather than snapping to a step, so it can sit up to half a step
  // away from the printed table -- at most about $50 of deduction for a joint
  // filer, $30 for a single one, which is a couple of dollars of tax.
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 18400, amount: 12760 },
      { min: 18400, max: 124734, amount: 12760, reduce_rate: 12 },
      { min: 124734, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 26550, amount: 23620 },
      { min: 26550, max: 145977, amount: 23620, reduce_rate: 19.778 },
      { min: 145977, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 12600, amount: 11220 },
      { min: 12600, max: 69331, amount: 11220, reduce_rate: 19.778 },
      { min: 69331, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 18400, amount: 16480 },
      { min: 18400, max: 53779, amount: 16480, reduce_rate: 22.515 },
      {
        min: 53779,
        max: 124734,
        amount: 12760,
        reduce_from: 18400,
        reduce_rate: 12,
      },
      { min: 124734, max: INFINITY, amount: 0 },
    ],
  },
  // Boundaries confirmed against the 2023 Form 1 Tax Computation Worksheet:
  // its 5.3% subtraction amounts -- $372.96 single and head of household,
  // $497.34 joint, $248.67 separate -- reconcile to the cent with these
  // brackets at 3.5/4.4/5.3/7.65. The file previously carried the 2024
  // boundaries. Note that 2023 Act 19 cut the first two rates from 3.54% and
  // 4.65% after the Form 1-ES schedules were printed, so the 1-ES rates are
  // stale for 2023 even though its bracket boundaries are not.
  // Head of household shares the single schedule (worksheet Section A).
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 13810, rate: 3.5 },
      { min: 13810, max: 27630, rate: 4.4 },
      { min: 27630, max: 304170, rate: 5.3 },
      { min: 304170, max: INFINITY, rate: 7.65 },
    ],
    [MARRIED]: [
      { min: 0, max: 18420, rate: 3.5 },
      { min: 18420, max: 36840, rate: 4.4 },
      { min: 36840, max: 405550, rate: 5.3 },
      { min: 405550, max: INFINITY, rate: 7.65 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 9210, rate: 3.5 },
      { min: 9210, max: 18420, rate: 4.4 },
      { min: 18420, max: 202780, rate: 5.3 },
      { min: 202780, max: INFINITY, rate: 7.65 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 13810, rate: 3.5 },
      { min: 13810, max: 27630, rate: 4.4 },
      { min: 27630, max: 304170, rate: 5.3 },
      { min: 304170, max: INFINITY, rate: 7.65 },
    ],
  },
} as TaxData;
