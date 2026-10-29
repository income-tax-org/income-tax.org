// Tax tables as static files: /data/tax-tables/{year}[/{state}[/{city}]].json.
//
// A table depends on year and location only, never on income, so the whole set
// is written out at build time (scripts/generate-static-tax-tables.ts). Static
// files cost no Function requests and are cached at the edge. They live outside
// /api/ on purpose: public/_routes.json sends /api/* to Functions, and an
// exclude for /api/tax-tables/* also caught /api/tax-tables itself, taking the
// query-string endpoint (still there for filtering by tax type or filing
// status) away from its Function.

import { snakeToDashCase } from "@/utils/string-utils";

export const STATIC_TAX_TABLES_PREFIX = "/data/tax-tables";

/** Site-relative path; state and city arrive snake_case and go out dash-case. */
export function staticTaxTablesPath(
  year: string,
  state?: string,
  city?: string,
): string {
  const segments = [year, state, state ? city : undefined]
    .filter(Boolean)
    .map((segment) => snakeToDashCase(segment as string));
  return `${STATIC_TAX_TABLES_PREFIX}/${segments.join("/")}.json`;
}
