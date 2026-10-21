// Shared plumbing for the /api GET routes: query string in, JSON out.

import { z } from "zod";
import { STATE_SCOPE } from "@/constants";
import { normalizeKey } from "./inputs";
import { InputError } from "./run";

const NUMERIC_PARAMS = [
  "income",
  "take_home",
  "retirement_contribution",
  "federal_deductions",
  "state_deductions",
];

const KEY_PARAMS = [
  "state",
  "city",
  "filing_status",
  "pay_frequency",
  "target_period",
];

/**
 * Turn a query string into the object the input schemas expect.
 *
 * Numbers are coerced here rather than in the schemas, which also back the MCP
 * tools and must stay plain JSON Schema. `exempt_taxes` is a comma-separated
 * list of `scope:tax` pairs, e.g. `federal:social_security,city:city_income`;
 * a bare `tax` is taken as federal-or-state, which share one namespace.
 * `tax_types` is a plain comma-separated list.
 */
export function parseQuery(params: URLSearchParams): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [name, raw] of params) {
    const value = raw.trim();
    if (value === "") continue;
    if (NUMERIC_PARAMS.includes(name)) {
      // Tolerate "$120,000" from a model that copied a figure verbatim.
      const cleaned = value.replace(/[$,_\s]/g, "");
      out[name] = cleaned === "" ? value : Number(cleaned);
    } else if (KEY_PARAMS.includes(name)) {
      out[name] = normalizeKey(value);
    } else if (name === "exempt_taxes") {
      out[name] = value.split(",").map((entry) => {
        const [first, second] = entry.split(":").map((part) => part.trim());
        return second === undefined
          ? { tax: first, scope: STATE_SCOPE }
          : { tax: second, scope: normalizeKey(first) };
      });
    } else if (name === "tax_types") {
      out[name] = value.split(",").map(normalizeKey).filter(Boolean);
    } else {
      out[name] = value;
    }
  }
  return out;
}

const HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
};

/**
 * CORS for browser-based clients. Nothing here is authenticated or personal,
 * so any origin may call it. The MCP headers are the ones Streamable HTTP
 * clients send and read.
 */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, Mcp-Protocol-Version",
  "Access-Control-Max-Age": "86400",
};

export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/** Copy a response with CORS headers added; streamed bodies pass through. */
export function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(CORS_HEADERS)) {
    headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function json(body: unknown, status = 200, cache = true): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...HEADERS,
      // Results only change when the tax data does, which ships as a deploy.
      "Cache-Control": cache ? "public, max-age=3600" : "no-store",
    },
  });
}

/** A 400 for anything the caller can fix, a 500 for everything else. */
export function errorResponse(error: unknown): Response {
  if (error instanceof z.ZodError) {
    return json(
      {
        error: "Invalid parameters.",
        issues: error.issues.map((issue) => ({
          param: issue.path.join("."),
          message: issue.message,
        })),
      },
      400,
      false,
    );
  }
  if (error instanceof InputError) {
    return json(
      { error: error.message, valid_values: error.validValues },
      400,
      false,
    );
  }
  console.error(error);
  return json({ error: "Internal error." }, 500, false);
}

/** Run one GET route: parse, validate, compute, respond. */
export async function handleGet<Input>(
  request: Request,
  schema: z.ZodType<unknown>,
  runner: (input: Input, siteUrl: string) => Promise<unknown>,
): Promise<Response> {
  const url = new URL(request.url);
  try {
    const input = schema.parse(parseQuery(url.searchParams)) as Input;
    return json(await runner(input, url.origin));
  } catch (error) {
    return errorResponse(error);
  }
}
