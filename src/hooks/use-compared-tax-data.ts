import { useEffect, useState } from "react";
import { loadSalesTax } from "@/data-loaders/sales-tax";
import type { SalesTaxData, TaxData } from "@/types";
import type { ComparedLocation } from "@/utils/compare-locations";

type ComparedTaxDataArgs = {
  locations: ComparedLocation[];
  year: string;
  includeSalesTax: boolean;
  defaultFederalTaxes: TaxData;
};

/**
 * Federal schedules for the year, plus income and sales tax data for every
 * state in the comparison, keyed by state name.
 */
export function useComparedTaxData({
  locations,
  year,
  includeSalesTax,
  defaultFederalTaxes,
}: ComparedTaxDataArgs) {
  const [stateTaxesByState, setStateTaxesByState] = useState<
    Record<string, TaxData>
  >({});
  const [federalTaxes, setFederalTaxes] =
    useState<TaxData>(defaultFederalTaxes);
  const [salesTaxByState, setSalesTaxByState] = useState<
    Record<string, SalesTaxData | null>
  >({});

  // Each location needs its own state's schedules. The files are a few KB and
  // code-split per state, so this is a handful of small parallel fetches.
  useEffect(() => {
    let cancelled = false;
    const wanted = Array.from(new Set(locations.map((l) => l.state)));

    async function load() {
      const federal = (await import(`@/data/${year}/federal.ts`)) as {
        default: TaxData;
      };
      const loaded = await Promise.all(
        wanted.map(async (state) => {
          try {
            const mod = (await import(`@/data/${year}/state/${state}.ts`)) as {
              default: TaxData;
            };
            return [state, mod.default] as const;
          } catch {
            return null;
          }
        }),
      );
      // Small files, and only fetched once sales tax is switched on.
      const salesTax = includeSalesTax
        ? await Promise.all(
            wanted.map(
              async (state) =>
                [state, await loadSalesTax(year, state)] as const,
            ),
          )
        : [];
      if (cancelled) return;
      setFederalTaxes(federal.default);
      setStateTaxesByState(
        Object.fromEntries(loaded.filter(Boolean) as [string, TaxData][]),
      );
      setSalesTaxByState(Object.fromEntries(salesTax));
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [locations, year, includeSalesTax]);

  return { federalTaxes, stateTaxesByState, salesTaxByState };
}
