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
  // Source: 2025 Form 1-ES instructions, "2025 Standard Deduction" schedules.
  // https://www.revenue.wi.gov/TaxForms2025/2025-Form1-ES-inst.pdf
  // Verified: evaluated at the midpoint of each $500 step, this schedule
  // reproduces every row of the Form 1 Standard Deduction Table exactly, for
  // all four filing statuses. The calculator evaluates at the taxpayer's own
  // income rather than snapping to a step, so it can sit up to half a step
  // away from the printed table -- at most about $50 of deduction for a joint
  // filer, $30 for a single one, which is a couple of dollars of tax.
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 19550, amount: 13560 },
      { min: 19550, max: 132550, amount: 13560, reduce_rate: 12 },
      { min: 132550, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 28210, amount: 25110 },
      { min: 28210, max: 155170, amount: 25110, reduce_rate: 19.778 },
      { min: 155170, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 13390, amount: 11930 },
      { min: 13390, max: 73710, amount: 11930, reduce_rate: 19.778 },
      { min: 73710, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 19550, amount: 17520 },
      { min: 19550, max: 57211, amount: 17520, reduce_rate: 22.515 },
      {
        min: 57211,
        max: 132550,
        amount: 13560,
        reduce_from: 19550,
        reduce_rate: 12,
      },
      { min: 132550, max: INFINITY, amount: 0 },
    ],
  },
  // 2025 Act 15 widened the second bracket sharply: single runs to $50,480,
  // not the $28,640 this file previously carried over from 2024.
  // Boundaries confirmed against the 2025 Form 1 Tax Computation Worksheet:
  // its 5.3% subtraction amounts -- $586.44 single and head of household,
  // $781.92 joint, $390.96 separate -- reconcile to the cent with these
  // brackets at 3.5/4.4/5.3/7.65.
  // Head of household shares the single schedule (worksheet Section A).
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 14680, rate: 3.5 },
      { min: 14680, max: 50480, rate: 4.4 },
      { min: 50480, max: 323290, rate: 5.3 },
      { min: 323290, max: INFINITY, rate: 7.65 },
    ],
    [MARRIED]: [
      { min: 0, max: 19580, rate: 3.5 },
      { min: 19580, max: 67300, rate: 4.4 },
      { min: 67300, max: 431060, rate: 5.3 },
      { min: 431060, max: INFINITY, rate: 7.65 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 9790, rate: 3.5 },
      { min: 9790, max: 33650, rate: 4.4 },
      { min: 33650, max: 215530, rate: 5.3 },
      { min: 215530, max: INFINITY, rate: 7.65 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 14680, rate: 3.5 },
      { min: 14680, max: 50480, rate: 4.4 },
      { min: 50480, max: 323290, rate: 5.3 },
      { min: 323290, max: INFINITY, rate: 7.65 },
    ],
  },
} as TaxData;
