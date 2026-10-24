import { LOCAL_SALES_TAX, STATE_SALES_TAX } from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// Montana has no general state or local sales tax. Confirmed by Tax
// Foundation 'State and Local Sales Tax Rates, 2026' (Jan 1 2026) and
// 'Midyear 2026' (Jul 1 2026) tables, both showing a 0.00% average local rate
// and no statewide rate change July 2025-July 2026 (0.00%; the table notes
// resort-area taxes are not counted). Local resort taxes (Montana Department
// of Revenue, up to 3%, or 4% under SB 172 of 2025 for workforce housing)
// apply only in small designated resort communities and are excluded as not
// general; a 2025 local-option sales tax bill (HB 489) failed in committee.
export default {
  [STATE_SALES_TAX]: 0,
  [LOCAL_SALES_TAX]: 0,
} as SalesTaxData;
