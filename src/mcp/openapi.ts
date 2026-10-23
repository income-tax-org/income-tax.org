// OpenAPI description of the /api GET routes, served at /openapi.json.
//
// Built from the same Zod schemas the routes validate with, so the spec
// cannot drift from what they accept. Agent frameworks and ChatGPT custom
// GPT Actions import an OpenAPI document directly, which reaches assistants
// that support neither fetching a hand-built URL nor MCP.

import { z } from "zod";
import { calculateInput, targetInput, taxTablesInput } from "./inputs";
import { YEARS } from "./tax-data-registry";

type JsonSchema = {
  type?: string;
  enum?: unknown[];
  default?: unknown;
  description?: string;
  items?: JsonSchema;
  minimum?: number;
  exclusiveMinimum?: number;
  properties?: Record<string, JsonSchema>;
  required?: string[];
};

/**
 * One query parameter per schema property.
 *
 * Arrays need care, because the query string is not JSON. `tax_types` is a
 * plain comma-separated list, which OpenAPI spells `style: form,
 * explode: false`. `exempt_taxes` is a list of objects, sent as `scope:tax`
 * pairs that parseQuery in ./http splits apart; OpenAPI has no notation for
 * that, so it is described as a string.
 */
function queryParameters(schema: z.ZodType) {
  const json = z.toJSONSchema(schema, { io: "input" }) as JsonSchema;
  const required = new Set(json.required ?? []);
  return Object.entries(json.properties ?? {}).map(([name, property]) => {
    const { description, ...rest } = property;
    const base = { name, in: "query", required: required.has(name) };

    if (property.type === "array" && property.items?.type === "object") {
      return {
        ...base,
        description: `${description} Sent as comma-separated scope:tax pairs, e.g. federal:social_security,city:city_income.`,
        schema: { type: "string" },
      };
    }
    if (property.type === "array") {
      return {
        ...base,
        description: `${description} Comma-separated.`,
        style: "form",
        explode: false,
        schema: rest,
      };
    }
    return { ...base, description, schema: rest };
  });
}

const errorResponse = {
  description:
    "The parameters are invalid, or name something the data does not have. `valid_values` lists what would be accepted, such as the cities a state has local tax data for.",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          error: { type: "string" },
          valid_values: { type: "array", items: { type: "string" } },
          issues: {
            type: "array",
            items: {
              type: "object",
              properties: {
                param: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
        required: ["error"],
      },
    },
  },
};

function operation(
  operationId: string,
  summary: string,
  description: string,
  schema: z.ZodType,
  resultDescription: string,
) {
  return {
    get: {
      operationId,
      summary,
      description,
      parameters: queryParameters(schema),
      responses: {
        "200": {
          description: resultDescription,
          content: { "application/json": { schema: { type: "object" } } },
        },
        "400": errorResponse,
      },
    },
  };
}

export function buildOpenApiSpec(siteUrl: string) {
  return {
    openapi: "3.1.0",
    info: {
      title: "US Income Tax Calculator API",
      version: "1.0.0",
      // No `license`: the repository is "All Rights Reserved", so there is no
      // open license to name here.
      description: `Free US federal, state and local income tax calculations, with no API key. The same calculation as ${siteUrl}. Amounts are US dollars per year unless labelled per_paycheck. FICA and state payroll programs are charged on gross wages; a 401(k)/IRA contribution and deductions lower income tax only. Tax data covers ${YEARS.join(", ")}. Estimates for a single wage earner, not tax advice. Also available as an MCP server at ${siteUrl}/mcp.`,
    },
    servers: [{ url: siteUrl }],
    // No authentication: the API is free and keyless. An empty list says so
    // explicitly rather than leaving it undefined.
    security: [],
    externalDocs: {
      description: "Parameters, examples and limits",
      url: `${siteUrl}/developers/`,
    },
    paths: {
      "/api/calculate": operation(
        "calculate",
        "Calculate take-home pay",
        "Take-home pay and every federal, state and local tax for an annual gross income, with per-paycheck figures, taxable income, the marginal rate and a per-tax breakdown.",
        calculateInput,
        "Take-home pay, totals by jurisdiction, taxable income, credits, the marginal rate, a per-tax breakdown, notes, and a link to the same result on the site.",
      ),
      "/api/target": operation(
        "target",
        "Find gross income for a take-home goal",
        "Works backwards from a take-home goal, annual or per paycheck, to the lowest gross salary (to the cent) that reaches it, with the full breakdown at that salary.",
        targetInput,
        "required_gross_income, the target restated as annual, and the full calculate result at that income.",
      ),
      "/api/tax-tables": operation(
        "taxTables",
        "Look up tax brackets and rates",
        "The brackets, rates, standard deductions, credits and 401(k) limit the calculator uses, for a year, state and optional city. Each schedule is labelled with how it is applied (`kind`) and the income it is charged on (`basis`); `how_to_read` explains both. Use calculate for dollar amounts.",
        taxTablesInput,
        "Schedules by jurisdiction, with how_to_read notes and a link to the site's tax tables.",
      ),
    },
  };
}
