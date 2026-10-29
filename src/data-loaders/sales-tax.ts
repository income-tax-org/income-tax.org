// Lazy-imports one state's sales tax file, code-split per state like the
// income tax data in src/hooks/use-tax-data.ts. Safe in client components.

import type { SalesTaxData } from "@/types";

/** Null where the year has no sales tax data for the state. */
export async function loadSalesTax(
  year: string,
  state: string,
): Promise<SalesTaxData | null> {
  try {
    const mod = (await import(
      `@/data/${year}/sales-tax/state/${state}.ts`
    )) as {
      default: SalesTaxData;
    };
    return mod.default;
  } catch {
    return null;
  }
}
