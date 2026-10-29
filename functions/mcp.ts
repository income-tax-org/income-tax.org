// MCP server at /mcp: Streamable HTTP, stateless, tools only.

import { createMcpHandler } from "@modelcontextprotocol/server";
import { preflight, withCors } from "@/api/http";
import { createServer } from "@/api/mcp-server";

// Only reached if the SDK ever calls the factory without the request.
const FALLBACK_SITE_URL = "https://income-tax.org";

const handler = createMcpHandler(({ requestInfo }) =>
  createServer(
    requestInfo ? new URL(requestInfo.url).origin : FALLBACK_SITE_URL,
  ),
);

export const onRequest: PagesFunction = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return preflight();
  }
  return withCors(await handler.fetch(request));
};
