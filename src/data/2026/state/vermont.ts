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
  // Form IN-111 for 2026 is not published yet, so these come from the
  // Department's own 2026 withholding guide instead. Its annual percentage
  // tables begin withholding above half the single standard deduction and
  // three quarters of the married one - a relationship that reproduces the
  // published 2023, 2024 and 2025 deductions exactly - which puts 2026 at
  // 3925 x 2 = 7850 and 11775 / 0.75 = 15700. Head of household is the
  // statutory $9,000 base run through the same 32 V.S.A. 5811(21)(D)
  // inflation adjustment, which also reproduces those two figures and the
  // $5,400 personal exemption the guide prints outright.
  // Replace these with the IN-111-2026 amounts once that form is posted.
  // Source: GB-1210, 2026 Income Tax Withholding Instructions and Tables.
  // https://tax.vermont.gov/sites/tax/files/documents/GB-1210-2026.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 7850,
    [MARRIED]: 15700,
    [MARRIED_SEPARATELY]: 7850,
    [HEAD_OF_HOUSEHOLD]: 11800,
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
  // PROVISIONAL: these are the "2026 Preliminary Vermont Tax Rates" printed
  // in the 2026 Form IN-114 instructions (Rev. 10/25). Vermont has not yet
  // published the final 2026 rate schedule; replace when it posts.
  // Source: 2026 Form IN-114 instructions, 2026 Preliminary Vermont Tax Rates.
  // https://tax.vermont.gov/sites/tax/files/documents/IN-114-Instr-2026.pdf
  // Not modelled: for federal AGI over $150,000 Vermont charges the greater
  // of this schedule or 3%% of AGI less U.S. obligation interest (IN-111
  // line 8). The schedule wins at every income this calculator produces.
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 50750, rate: 3.35 },
      { min: 50750, max: 122850, rate: 6.6 },
      { min: 122850, max: 256300, rate: 7.6 },
      { min: 256300, max: INFINITY, rate: 8.75 },
    ],
    [MARRIED]: [
      { min: 0, max: 84700, rate: 3.35 },
      { min: 84700, max: 204750, rate: 6.6 },
      { min: 204750, max: 312050, rate: 7.6 },
      { min: 312050, max: INFINITY, rate: 8.75 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 42350, rate: 3.35 },
      { min: 42350, max: 102375, rate: 6.6 },
      { min: 102375, max: 156025, rate: 7.6 },
      { min: 156025, max: INFINITY, rate: 8.75 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 68000, rate: 3.35 },
      { min: 68000, max: 175500, rate: 6.6 },
      { min: 175500, max: 284150, rate: 7.6 },
      { min: 284150, max: INFINITY, rate: 8.75 },
    ],
  },
} as TaxData;
