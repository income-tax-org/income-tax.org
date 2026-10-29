// /openapi.json: the API's OpenAPI document, written out as a static file at
// build time. See src/api/openapi.ts.

import { SITE_URL } from "@/constants/pages";
import { buildOpenApiSpec } from "@/api/openapi";

export const dynamic = "force-static";

export function GET() {
  return Response.json(buildOpenApiSpec(SITE_URL));
}
