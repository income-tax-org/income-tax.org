import { INFINITY } from "@/constants";
import { ALL } from "@/constants/filing-status";
import { STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Verified 2026-09-08 against the Utah State Tax Commission's rate history:
  // "January 1, 2024 - December 31, 2024: 4.55% or .0455". One rate for every
  // filing status, hence [ALL]. No standard deduction exists in Utah; see
  // 2023 and 2025 for the taxpayer tax credit that stands in its place.
  // Source (Wayback, 2026-08-26): https://web.archive.org/web/20260826173109/https://incometax.utah.gov/paying/tax-rates
  // UNMODELLED, all years: Utah's taxpayer tax credit. See the 2025 file for
  // the full note. Worth $945 at low income and exactly $0 above about
  // $90,300, so this file overstates tax below that and is right above it.
  [STATE_INCOME]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 4.55 }],
  },
} as TaxData;
