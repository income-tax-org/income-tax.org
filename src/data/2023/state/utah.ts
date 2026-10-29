import { INFINITY } from "@/constants";
import { ALL } from "@/constants/filing-status";
import { STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Verified 2026-09-08 against the Utah State Tax Commission's own rate
  // history: "January 1, 2023 - December 31, 2023: 4.65% or .0465".
  // Utah applies one rate to every filing status, hence [ALL].
  // Source (Wayback, 2026-08-26): https://web.archive.org/web/20260826173109/https://incometax.utah.gov/paying/tax-rates
  //
  // Utah has no standard deduction, which is why this file has no
  // STANDARD_DEDUCTION key: TC-40 applies the rate to Utah taxable income
  // derived from federal AGI, with no deduction subtracted. What Utah gives
  // instead is the nonrefundable taxpayer tax credit (Utah Code 59-10-1018),
  // 6% of the federal deduction plus exemptions, phased out at 1.3% of income
  // above a base amount. It is a credit, not a subtraction, so it has no slot
  // here -- see the note in the 2025 file for what that omission costs.
  // UNMODELLED, all years: Utah's taxpayer tax credit. See the 2025 file for
  // the full note. Worth $945 at low income and exactly $0 above about
  // $90,300, so this file overstates tax below that and is right above it.
  [STATE_INCOME]: {
    [ALL]: [
      {
        min: 0,
        max: INFINITY,
        rate: 4.65,
      },
    ],
  },
} as TaxData;
