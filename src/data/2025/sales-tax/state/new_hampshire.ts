import { LOCAL_SALES_TAX, STATE_SALES_TAX } from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// New Hampshire has no general state or local sales tax. Confirmed by Tax
// Foundation 'State and Local Sales Tax Rates, 2026' (Jan 1 2026) and
// 'Midyear 2026' (Jul 1 2026) tables, both showing a 0.00% average local rate
// and no statewide rate change July 2025-July 2026 (0.00%). The 8.5% Meals
// and Rooms (Rentals) Tax administered by the NH Department of Revenue
// Administration is excluded as not general.
export default {
  [STATE_SALES_TAX]: 0,
  [LOCAL_SALES_TAX]: 0,
} as SalesTaxData;
