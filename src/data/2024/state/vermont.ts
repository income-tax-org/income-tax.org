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
  // Vermont sets its own standard deduction under 32 V.S.A. 5811(21)(C)(ii)
  // and indexes it annually. These are NOT the federal amounts.
  // Vermont also subtracts a $5,100 personal exemption per person
  // (IN-111 line 5e) on top of this, which the calculator does not model.
  // Source: 2024 Form IN-111, filing status / standard deduction box.
  // https://tax.vermont.gov/sites/tax/files/documents/IN-111-2024.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 7400,
    [MARRIED]: 14850,
    [MARRIED_SEPARATELY]: 7400,
    [HEAD_OF_HOUSEHOLD]: 11100,
  },
  // Vermont Tax Rate Schedules X (single), Y-1 (joint), Y-2 (separate) and Z
  // (head of household). Each status has its own thresholds - none is a
  // multiple or a copy of another.
  // Do NOT source these from GB-1210, the income tax WITHHOLDING guide. Its
  // annual percentage tables carry the same rates but every threshold is
  // shifted up by half the standard deduction, so they are not rate
  // schedules. (Confusingly, the file the Department names RateSched-2025 /
  // RateSched-2026 is the withholding wage-bracket chart; the rate schedule
  // is TaxRateSched-YYYY or the table inside the IN-111 instructions.)
  // Source: 2024 Vermont Tax Rate Schedules.
  // https://tax.vermont.gov/sites/tax/files/documents/RateSched-2024.pdf
  // Not modelled: for federal AGI over $150,000 Vermont charges the greater
  // of this schedule or 3%% of AGI less U.S. obligation interest (IN-111
  // line 8). The schedule wins at every income this calculator produces.
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 47900, rate: 3.35 },
      { min: 47900, max: 116000, rate: 6.6 },
      { min: 116000, max: 242000, rate: 7.6 },
      { min: 242000, max: INFINITY, rate: 8.75 },
    ],
    [MARRIED]: [
      { min: 0, max: 79950, rate: 3.35 },
      { min: 79950, max: 193300, rate: 6.6 },
      { min: 193300, max: 294600, rate: 7.6 },
      { min: 294600, max: INFINITY, rate: 8.75 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 39975, rate: 3.35 },
      { min: 39975, max: 96650, rate: 6.6 },
      { min: 96650, max: 147300, rate: 7.6 },
      { min: 147300, max: INFINITY, rate: 8.75 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 64200, rate: 3.35 },
      { min: 64200, max: 165700, rate: 6.6 },
      { min: 165700, max: 268300, rate: 7.6 },
      { min: 268300, max: INFINITY, rate: 8.75 },
    ],
  },
} as TaxData;
