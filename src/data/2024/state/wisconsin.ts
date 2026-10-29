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
  // Source: 2024 Form 1-ES instructions, "2024 Standard Deduction" schedules.
  // https://www.revenue.wi.gov/TaxForms2024/2024-Form1-ES-inst.pdf
  // Verified: evaluated at the midpoint of each $500 step, this schedule
  // reproduces every row of the Form 1 Standard Deduction Table exactly, for
  // all four filing statuses. The calculator evaluates at the taxpayer's own
  // income rather than snapping to a step, so it can sit up to half a step
  // away from the printed table -- at most about $50 of deduction for a joint
  // filer, $30 for a single one, which is a couple of dollars of tax.
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 19070, amount: 13230 },
      { min: 19070, max: 129320, amount: 13230, reduce_rate: 12 },
      { min: 129320, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 27520, amount: 24490 },
      { min: 27520, max: 151345, amount: 24490, reduce_rate: 19.778 },
      { min: 151345, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 13060, amount: 11630 },
      { min: 13060, max: 71863, amount: 11630, reduce_rate: 19.778 },
      { min: 71863, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 19070, amount: 17090 },
      { min: 19070, max: 55780, amount: 17090, reduce_rate: 22.515 },
      {
        min: 55780,
        max: 129320,
        amount: 13230,
        reduce_from: 19070,
        reduce_rate: 12,
      },
      { min: 129320, max: INFINITY, amount: 0 },
    ],
  },
  // Verified: the 2024 Form 1 Tax Computation Worksheet's 5.3% subtraction
  // amount for single and head of household ($386.64) and its top-bracket
  // floors ($315,310 single and head of household, $420,420 joint, $210,210
  // separate) reconcile with these brackets at 3.5/4.4/5.3/7.65. Correct as
  // written; no need to re-check.
  // Head of household shares the single schedule (worksheet Section A).
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 14320, rate: 3.5 },
      { min: 14320, max: 28640, rate: 4.4 },
      { min: 28640, max: 315310, rate: 5.3 },
      { min: 315310, max: INFINITY, rate: 7.65 },
    ],
    [MARRIED]: [
      { min: 0, max: 19090, rate: 3.5 },
      { min: 19090, max: 38190, rate: 4.4 },
      { min: 38190, max: 420420, rate: 5.3 },
      { min: 420420, max: INFINITY, rate: 7.65 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 9550, rate: 3.5 },
      { min: 9550, max: 19090, rate: 4.4 },
      { min: 19090, max: 210210, rate: 5.3 },
      { min: 210210, max: INFINITY, rate: 7.65 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 14320, rate: 3.5 },
      { min: 14320, max: 28640, rate: 4.4 },
      { min: 28640, max: 315310, rate: 5.3 },
      { min: 315310, max: INFINITY, rate: 7.65 },
    ],
  },
} as TaxData;
