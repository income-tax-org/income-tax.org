import { LOCAL_SALES_TAX, STATE_SALES_TAX } from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// Oregon has no general sales tax, state or local. A few cities tax specific
// purchases -- Ashland's 5% food and beverage tax, for one -- which a general
// rate on all taxable spending cannot represent, so they are left out.
export default {
  [STATE_SALES_TAX]: 0,
  [LOCAL_SALES_TAX]: 0,
} as SalesTaxData;
