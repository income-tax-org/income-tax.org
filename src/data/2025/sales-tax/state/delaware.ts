import { LOCAL_SALES_TAX, STATE_SALES_TAX } from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Delaware has no state or local sales tax (it levies a gross receipts tax on
// sellers instead, which is not a tax on the purchaser). Confirmed by Tax
// Foundation 'State and Local Sales Tax Rates, 2026' (Jan 1 2026) and
// 'Midyear 2026' (Jul 1 2026) tables, both showing a 0.00% average local rate
// and no statewide rate change July 2025-July 2026 (0.00% state and local).
// No local option was adopted in 2025-2026.
export default {
  [STATE_SALES_TAX]: 0,
  [LOCAL_SALES_TAX]: 0,
} as SalesTaxData;
