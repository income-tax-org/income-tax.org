// GET /api/calculate: take-home pay and taxes for a gross income, as JSON.

import { handleGet, preflight } from "@/mcp/http";
import type { CalculateInput } from "@/mcp/inputs";
import { calculateInput } from "@/mcp/inputs";
import { runCalculate } from "@/mcp/run";

export const onRequestGet: PagesFunction = ({ request }) =>
  handleGet<CalculateInput>(request, calculateInput, runCalculate);

export const onRequestOptions: PagesFunction = () => preflight();
