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
  // Vermont also subtracts a $5,300 personal exemption per person
  // (IN-111 line 5e) on top of this, which the calculator does not model.
  // Source: 2025 Form IN-111, filing status / standard deduction box.
  // https://tax.vermont.gov/sites/tax/files/documents/IN-111-2025.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 7650,
    [MARRIED]: 15300,
    [MARRIED_SEPARATELY]: 7650,
    [HEAD_OF_HOUSEHOLD]: 11450,
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
  // Source: 2025 Vermont Tax Rate Schedules.
  // https://tax.vermont.gov/sites/tax/files/documents/TaxRateSched-2025.pdf
  // Not modelled: for federal AGI over $150,000 Vermont charges the greater
  // of this schedule or 3%% of AGI less U.S. obligation interest (IN-111
  // line 8). The schedule wins at every income this calculator produces.
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 49400, rate: 3.35 },
      { min: 49400, max: 119700, rate: 6.6 },
      { min: 119700, max: 249700, rate: 7.6 },
      { min: 249700, max: INFINITY, rate: 8.75 },
    ],
    [MARRIED]: [
      { min: 0, max: 82500, rate: 3.35 },
      { min: 82500, max: 199450, rate: 6.6 },
      { min: 199450, max: 304000, rate: 7.6 },
      { min: 304000, max: INFINITY, rate: 8.75 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 41250, rate: 3.35 },
      { min: 41250, max: 99725, rate: 6.6 },
      { min: 99725, max: 152000, rate: 7.6 },
      { min: 152000, max: INFINITY, rate: 8.75 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 66200, rate: 3.35 },
      { min: 66200, max: 171000, rate: 6.6 },
      { min: 171000, max: 276850, rate: 7.6 },
      { min: 276850, max: INFINITY, rate: 8.75 },
    ],
  },
} as TaxData;
