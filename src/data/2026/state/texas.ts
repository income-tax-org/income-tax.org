import { NONE, STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

// Verified 2026-09-07: correct and complete. Texas levies no individual
// income tax, and since 2019 the state constitution forbids one (Tex. Const.
// art. VIII, sec. 24-a, adopted as Proposition 4). The Comptroller's list of
// every Texas tax has no entry for one. https://comptroller.texas.gov/taxes/
// Nothing else has crept into this file -- STATE_INCOME: NONE is all there is
// and all there should be.
export default {
  [STATE_INCOME]: NONE,
} as TaxData;
