// GET /api/tax-tables: the brackets, rates and deductions the calculator uses.

import { handleGet, preflight, withoutBody } from "@/mcp/http";
import type { TaxTablesInput } from "@/mcp/inputs";
import { taxTablesInput } from "@/mcp/inputs";
import { runTaxTables } from "@/mcp/tax-tables";

const get = (request: Request) =>
  handleGet<TaxTablesInput>(request, taxTablesInput, runTaxTables);

export const onRequestGet: PagesFunction = ({ request }) => get(request);

export const onRequestHead: PagesFunction = async ({ request }) =>
  withoutBody(await get(request));

export const onRequestOptions: PagesFunction = () => preflight();
