import { NONE, STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

// Verified 2026-09-07: correct and complete. Florida levies no individual
// income tax, and the state constitution forbids one (Fla. Const. art. VII,
// sec. 5(a)). The Department of Revenue's "Taxes and Fees or Refunds" list
// covers corporate income but no personal income tax.
// https://floridarevenue.com/taxes/taxesfees/Pages/default.aspx
// Nothing else has crept into this file -- STATE_INCOME: NONE is all there is
// and all there should be.
export default {
  [STATE_INCOME]: NONE,
} as TaxData;
