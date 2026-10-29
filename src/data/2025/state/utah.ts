import { INFINITY } from "@/constants";
import { ALL } from "@/constants/filing-status";
import { STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Verified 2026-09-08 against the Utah State Tax Commission's rate history:
  // "January 1, 2025 - current: 4.5% or .045", and the TC-40 line 10
  // instruction "Multiply line 9 by 4.5 percent (.045)".
  // Source (Wayback, 2026-08-26): https://web.archive.org/web/20260826173109/https://incometax.utah.gov/paying/tax-rates
  //
  // UNMODELLED / KNOWN OVERSTATEMENT, all years: Utah has no standard deduction, so this
  // file correctly has no STANDARD_DEDUCTION key -- but it also does not model
  // the nonrefundable taxpayer tax credit (Utah Code 59-10-1018) that stands
  // in place of one. The credit is 6% of the federal standard or itemized
  // deduction plus exemptions, reduced by 1.3% of income above a base amount
  // ($17,652 single / $35,304 joint / $26,478 head of household for 2025).
  // It cannot be written as a deduction band without inventing a rule, since
  // it phases out against a different figure than it is computed from.
  // At the 2025 single figures it is worth $945 at low income, $524 at
  // $50,000, and exactly $0 from about $90,300 up -- so the calculator is
  // right for higher earners and overstates tax below that.
  // Source: https://web.archive.org/web/20260826173109/https://incometax.utah.gov/credits/taxpayer-tax-credit
  [STATE_INCOME]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 4.5 }],
  },
} as TaxData;
