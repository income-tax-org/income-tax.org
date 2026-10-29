// GET /api/target: the gross income needed for a take-home goal, as JSON.

import { handleGet, preflight, withoutBody } from "@/mcp/http";
import type { TargetInput } from "@/mcp/inputs";
import { targetInput } from "@/mcp/inputs";
import { runTarget } from "@/mcp/run";

const get = (request: Request) =>
  handleGet<TargetInput>(request, targetInput, runTarget);

export const onRequestGet: PagesFunction = ({ request }) => get(request);

export const onRequestHead: PagesFunction = async ({ request }) =>
  withoutBody(await get(request));

export const onRequestOptions: PagesFunction = () => preflight();
