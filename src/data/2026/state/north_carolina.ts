import { INFINITY } from "@/constants";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import { STANDARD_DEDUCTION, STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Verified 2026-09-08 against G.S. 105-153.5(a)(1) as currently enacted,
  // which prints a single table with no year rows: married filing jointly
  // $25,500, head of household $19,125, single $12,750, married filing
  // separately $12,750. Nothing in the 2025 or 2026 sessions amended it, so
  // 2026 matching the earlier years is North Carolina holding a fixed
  // figure, not a value stale in this file.
  // Source: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_105/GS_105-153.5.html
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 12750,
    [MARRIED]: 25500,
    [MARRIED_SEPARATELY]: 12750,
    [HEAD_OF_HOUSEHOLD]: 19125,
  },
  // Verified 2026-09-08: G.S. 105-153.7(a) "After 2025 3.99%", and NCDOR,
  // "For Taxable Years after 2025, the North Carolina individual income tax
  // rate is 3.99% (0.0399)."
  //
  // Watch item for 2027, not for this file: G.S. 105-153.7(a1) drops the rate
  // by half a point if FY2025-26 General Fund revenue exceeds $33,042,000,000
  // as reported by the Office of State Controller. That trigger reads on the
  // 2027 rate, so 3.99% is right for 2026 either way.
  // Sources: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_105/GS_105-153.7.html
  //          https://www.ncdor.gov/taxes-forms/individual-income-tax/tax-rate-schedules
  [STATE_INCOME]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 3.99 }],
  },
} as TaxData;
