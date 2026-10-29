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
  // Vermont also subtracts a $4,850 personal exemption per person
  // (IN-111 line 5e) on top of this, which the calculator does not model.
  // Source: 2023 Form IN-111, filing status / standard deduction box.
  // https://tax.vermont.gov/sites/tax/files/documents/IN-111-2023.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 7000,
    [MARRIED]: 14050,
    [MARRIED_SEPARATELY]: 7000,
    [HEAD_OF_HOUSEHOLD]: 10550,
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
  // Source: 2023 Vermont Tax Rate Schedules.
  // https://tax.vermont.gov/sites/tax/files/documents/RateSched-2023.pdf
  // Not modelled: for federal AGI over $150,000 Vermont charges the greater
  // of this schedule or 3%% of AGI less U.S. obligation interest (IN-111
  // line 8). The schedule wins at every income this calculator produces.
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 45400, rate: 3.35 },
      { min: 45400, max: 110050, rate: 6.6 },
      { min: 110050, max: 229550, rate: 7.6 },
      { min: 229550, max: INFINITY, rate: 8.75 },
    ],
    [MARRIED]: [
      { min: 0, max: 75850, rate: 3.35 },
      { min: 75850, max: 183400, rate: 6.6 },
      { min: 183400, max: 279450, rate: 7.6 },
      { min: 279450, max: INFINITY, rate: 8.75 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 37925, rate: 3.35 },
      { min: 37925, max: 91700, rate: 6.6 },
      { min: 91700, max: 139725, rate: 7.6 },
      { min: 139725, max: INFINITY, rate: 8.75 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 60850, rate: 3.35 },
      { min: 60850, max: 157150, rate: 6.6 },
      { min: 157150, max: 254500, rate: 7.6 },
      { min: 254500, max: INFINITY, rate: 8.75 },
    ],
  },
} as TaxData;
