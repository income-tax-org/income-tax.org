// GET /api/tax-tables: the brackets, rates and deductions the calculator uses.

import { handleGet, preflight } from "@/mcp/http";
import type { TaxTablesInput } from "@/mcp/inputs";
import { taxTablesInput } from "@/mcp/inputs";
import { runTaxTables } from "@/mcp/tax-tables";

export const onRequestGet: PagesFunction = ({ request }) =>
  handleGet<TaxTablesInput>(request, taxTablesInput, runTaxTables);

export const onRequestOptions: PagesFunction = () => preflight();
