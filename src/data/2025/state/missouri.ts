import { GROSS_INCOME_BASIS, INFINITY } from "@/constants";
import { CITIES, KANSAS_CITY, ST_LOUIS } from "@/constants/cities";
import {
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
    [SINGLE]: 15750,
    [MARRIED]: 31500,
    [MARRIED_SEPARATELY]: 15750,
    [HEAD_OF_HOUSEHOLD]: 23625,
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 1313, rate: 0 },
      { min: 1313, max: 2626, rate: 2 },
      { min: 2626, max: 3939, rate: 2.5 },
      { min: 3939, max: 5252, rate: 3 },
      { min: 5252, max: 6565, rate: 3.5 },
      { min: 6565, max: 7878, rate: 4 },
      { min: 7878, max: 9191, rate: 4.5 },
      { min: 9191, max: INFINITY, rate: 4.7 },
    ],
    [MARRIED]: [
      { min: 0, max: 1313, rate: 0 },
      { min: 1313, max: 2626, rate: 2 },
      { min: 2626, max: 3939, rate: 2.5 },
      { min: 3939, max: 5252, rate: 3 },
      { min: 5252, max: 6565, rate: 3.5 },
      { min: 6565, max: 7878, rate: 4 },
      { min: 7878, max: 9191, rate: 4.5 },
      { min: 9191, max: INFINITY, rate: 4.7 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 1313, rate: 0 },
      { min: 1313, max: 2626, rate: 2 },
      { min: 2626, max: 3939, rate: 2.5 },
      { min: 3939, max: 5252, rate: 3 },
      { min: 5252, max: 6565, rate: 3.5 },
      { min: 6565, max: 7878, rate: 4 },
      { min: 7878, max: 9191, rate: 4.5 },
      { min: 9191, max: INFINITY, rate: 4.7 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 1313, rate: 0 },
      { min: 1313, max: 2626, rate: 2 },
      { min: 2626, max: 3939, rate: 2.5 },
      { min: 3939, max: 5252, rate: 3 },
      { min: 5252, max: 6565, rate: 3.5 },
      { min: 6565, max: 7878, rate: 4 },
      { min: 7878, max: 9191, rate: 4.5 },
      { min: 9191, max: INFINITY, rate: 4.7 },
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
        [SINGLE]: [
          { min: 0, max: INFINITY, rate: 1, basis: GROSS_INCOME_BASIS },
        ],
        [MARRIED]: [
          { min: 0, max: INFINITY, rate: 1, basis: GROSS_INCOME_BASIS },
        ],
        [MARRIED_SEPARATELY]: [
          { min: 0, max: INFINITY, rate: 1, basis: GROSS_INCOME_BASIS },
        ],
        [HEAD_OF_HOUSEHOLD]: [
          { min: 0, max: INFINITY, rate: 1, basis: GROSS_INCOME_BASIS },
        ],
      },
    },
    [ST_LOUIS]: {
      // RSMo 92.111(2)(1): the earnings tax is levied on "salaries, wages,
      // commissions and other compensation", not on Missouri taxable income, so
      // the state standard deduction must not shrink its base. St. Louis's own
      // taxable-items list matches -- gross pay less pre-tax deferrals only.
      [CITY_INCOME]: {
        [SINGLE]: [
          { min: 0, max: INFINITY, rate: 1, basis: GROSS_INCOME_BASIS },
        ],
        [MARRIED]: [
          { min: 0, max: INFINITY, rate: 1, basis: GROSS_INCOME_BASIS },
        ],
        [MARRIED_SEPARATELY]: [
          { min: 0, max: INFINITY, rate: 1, basis: GROSS_INCOME_BASIS },
        ],
        [HEAD_OF_HOUSEHOLD]: [
          { min: 0, max: INFINITY, rate: 1, basis: GROSS_INCOME_BASIS },
        ],
      },
    },
  },
} as TaxData;
