import { INFINITY } from "@/constants";
import { ALL } from "@/constants/filing-status";
import { STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Verified 2026-09-08 against S.B. 60, 2026 General Session, Enrolled Copy,
  // which amends Utah Code 59-10-104(2)(b) from [4.5] to 4.45%, takes effect
  // 2026-05-06, and "has retrospective operation for a taxable year beginning
  // on or after January 1, 2026". So 4.45% is right for the whole of 2026
  // despite the May effective date.
  //
  // Worth knowing: the Tax Commission's public rate page still showed
  // "January 1, 2025 - current: 4.5%" as late as 2026-08-26, because that
  // page is the tax-year-2025 edition of the site. Checking it alone would
  // have said this file was wrong. The enrolled bill is the authority.
  // Source: https://le.utah.gov/Session/2026/bills/enrolled/SB0060.pdf
  //
  // Same taxpayer-tax-credit omission as the other years; see 2025.
  // UNMODELLED, all years: Utah's taxpayer tax credit. See the 2025 file for
  // the full note. Worth $945 at low income and exactly $0 above about
  // $90,300, so this file overstates tax below that and is right above it.
  [STATE_INCOME]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 4.45 }],
  },
} as TaxData;
