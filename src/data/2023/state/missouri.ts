import { GROSS_INCOME_BASIS, INFINITY } from "@/constants";
import { CITIES, KANSAS_CITY, ST_LOUIS } from "@/constants/cities";
import { ALL } from "@/constants/filing-status";
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
    [SINGLE]: 13850,
    [MARRIED]: 27700,
    [MARRIED_SEPARATELY]: 13850,
    [HEAD_OF_HOUSEHOLD]: 20800,
  },
  [STATE_INCOME]: {
    [ALL]: [
      { min: 0, max: 1207, rate: 0 },
      { min: 1207, max: 2414, rate: 2 },
      { min: 2414, max: 3621, rate: 2.5 },
      { min: 3621, max: 4828, rate: 3 },
      { min: 4828, max: 6035, rate: 3.5 },
      { min: 6035, max: 7242, rate: 4 },
      { min: 7242, max: 8449, rate: 4.5 },
      { min: 8449, max: INFINITY, rate: 4.95 },
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
