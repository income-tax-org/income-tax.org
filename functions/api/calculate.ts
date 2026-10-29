// GET /api/calculate: take-home pay and taxes for a gross income, as JSON.

import { handleGet, preflight, withoutBody } from "@/api/http";
import type { CalculateInput } from "@/api/inputs";
import { calculateInput } from "@/api/inputs";
import { runCalculate } from "@/api/run";

const get = (request: Request) =>
  handleGet<CalculateInput>(request, calculateInput, runCalculate);

export const onRequestGet: PagesFunction = ({ request }) => get(request);

export const onRequestHead: PagesFunction = async ({ request }) =>
  withoutBody(await get(request));

export const onRequestOptions: PagesFunction = () => preflight();
