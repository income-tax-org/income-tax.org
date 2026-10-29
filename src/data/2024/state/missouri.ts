import { GROSS_INCOME_BASIS, INFINITY } from "@/constants";
import { CITIES, KANSAS_CITY, ST_LOUIS } from "@/constants/cities";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  CITY_INCOME,
  STANDARD_DEDUCTION,
  STATE_INCOME,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 14600,
    [MARRIED]: 29200,
    [MARRIED_SEPARATELY]: 14600,
    [HEAD_OF_HOUSEHOLD]: 21900,
  },
  [STATE_INCOME]: {
    [ALL]: [
      { min: 0, max: 1273, rate: 0 },
      { min: 1273, max: 2546, rate: 2 },
      { min: 2546, max: 3819, rate: 2.5 },
      { min: 3819, max: 5092, rate: 3 },
      { min: 5092, max: 6365, rate: 3.5 },
      { min: 6365, max: 7638, rate: 4 },
      { min: 7638, max: 8911, rate: 4.5 },
      { min: 8911, max: INFINITY, rate: 4.8 },
    ],
  },
  [CITIES]: {
    // Renewals verified 2026-09-07. RSMo 92.111(1) requires voters to
    // reauthorise the earnings tax every five years or it phases down under
    // RSMo 92.125. Both cities' April 2021 votes carried the tax through 2026,
    // and both renewed again on April 7, 2026, so 1% holds for all four years
    // here. Kansas City Question 1 ("Shall the earnings tax of 1% ... be
    // continued for a period of five (5) years") passed 21,223-4,820 in the
    // Kansas City Election Board's official summary; St. Louis Proposition E
    // passed 22,869-4,131 (84.70%) in the Board of Election Commissioners'
    // Final Official Summary.
    [KANSAS_CITY]: {
      // RSMo 92.111(2)(1): the earnings tax is levied on "salaries, wages,
      // commissions and other compensation", not on Missouri taxable income, so
      // the state standard deduction must not shrink its base. St. Louis's own
      // taxable-items list matches -- gross pay less pre-tax deferrals only.
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1, basis: GROSS_INCOME_BASIS }],
      },
    },
    [ST_LOUIS]: {
      // RSMo 92.111(2)(1): the earnings tax is levied on "salaries, wages,
      // commissions and other compensation", not on Missouri taxable income, so
      // the state standard deduction must not shrink its base. St. Louis's own
      // taxable-items list matches -- gross pay less pre-tax deferrals only.
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1, basis: GROSS_INCOME_BASIS }],
      },
    },
  },
} as TaxData;
