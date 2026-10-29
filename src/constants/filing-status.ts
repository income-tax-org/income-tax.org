export const ALL = "all"; // When the tax is applied regardless of filing status
export const SINGLE = "single";
export const MARRIED = "married";
export const MARRIED_SEPARATELY = "married_separately";
export const HEAD_OF_HOUSEHOLD = "head_of_household";

export type FilingStatus =
  | typeof SINGLE
  | typeof MARRIED
  | typeof MARRIED_SEPARATELY
  | typeof HEAD_OF_HOUSEHOLD;

export const FILING_STATUSES: FilingStatus[] = [
  SINGLE,
  MARRIED,
  MARRIED_SEPARATELY,
  HEAD_OF_HOUSEHOLD,
];

export const EMPTY_STANDARD_DEDUCTION_MAP = {
  [SINGLE]: 0,
  [MARRIED]: 0,
  [MARRIED_SEPARATELY]: 0,
  [HEAD_OF_HOUSEHOLD]: 0,
};

export type StandardDeductionMap = typeof EMPTY_STANDARD_DEDUCTION_MAP;
