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
    [SINGLE]: 16100,
    [MARRIED]: 32200,
    [MARRIED_SEPARATELY]: 16100,
    [HEAD_OF_HOUSEHOLD]: 24150,
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 1348, rate: 0 },
      { min: 1348, max: 2696, rate: 2 },
      { min: 2696, max: 4044, rate: 2.5 },
      { min: 4044, max: 5392, rate: 3 },
      { min: 5392, max: 6740, rate: 3.5 },
      { min: 6740, max: 8088, rate: 4 },
      { min: 8088, max: 9436, rate: 4.5 },
      { min: 9436, max: INFINITY, rate: 4.7 },
    ],
    [MARRIED]: [
      { min: 0, max: 1348, rate: 0 },
      { min: 1348, max: 2696, rate: 2 },
      { min: 2696, max: 4044, rate: 2.5 },
      { min: 4044, max: 5392, rate: 3 },
      { min: 5392, max: 6740, rate: 3.5 },
      { min: 6740, max: 8088, rate: 4 },
      { min: 8088, max: 9436, rate: 4.5 },
      { min: 9436, max: INFINITY, rate: 4.7 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 1348, rate: 0 },
      { min: 1348, max: 2696, rate: 2 },
      { min: 2696, max: 4044, rate: 2.5 },
      { min: 4044, max: 5392, rate: 3 },
      { min: 5392, max: 6740, rate: 3.5 },
      { min: 6740, max: 8088, rate: 4 },
      { min: 8088, max: 9436, rate: 4.5 },
      { min: 9436, max: INFINITY, rate: 4.7 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 1348, rate: 0 },
      { min: 1348, max: 2696, rate: 2 },
      { min: 2696, max: 4044, rate: 2.5 },
      { min: 4044, max: 5392, rate: 3 },
      { min: 5392, max: 6740, rate: 3.5 },
      { min: 6740, max: 8088, rate: 4 },
      { min: 8088, max: 9436, rate: 4.5 },
      { min: 9436, max: INFINITY, rate: 4.7 },
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
