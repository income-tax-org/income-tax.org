// GET /api/target: the gross income needed for a take-home goal, as JSON.

import { handleGet, preflight } from "@/mcp/http";
import type { TargetInput } from "@/mcp/inputs";
import { targetInput } from "@/mcp/inputs";
import { runTarget } from "@/mcp/run";

export const onRequestGet: PagesFunction = ({ request }) =>
  handleGet<TargetInput>(request, targetInput, runTarget);

export const onRequestOptions: PagesFunction = () => preflight();
