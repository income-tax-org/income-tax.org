// GET /api/calculate: take-home pay and taxes for a gross income, as JSON.

import { handleGet, preflight, withoutBody } from "@/mcp/http";
import type { CalculateInput } from "@/mcp/inputs";
import { calculateInput } from "@/mcp/inputs";
import { runCalculate } from "@/mcp/run";

const get = (request: Request) =>
  handleGet<CalculateInput>(request, calculateInput, runCalculate);

export const onRequestGet: PagesFunction = ({ request }) => get(request);

export const onRequestHead: PagesFunction = async ({ request }) =>
  withoutBody(await get(request));

export const onRequestOptions: PagesFunction = () => preflight();
