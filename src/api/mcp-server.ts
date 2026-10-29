// The MCP server behind /mcp. Built fresh per request by the factory, as
// createMcpHandler requires; there is no session state to keep.

import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import type { CalculateInput, TargetInput, TaxTablesInput } from "./inputs";
import { calculateInput, targetInput, taxTablesInput } from "./inputs";
import { InputError, runCalculate, runTarget } from "./run";
import { YEARS } from "@/data-loaders/registry";
import { runTaxTables } from "./tax-tables";

const SHARED_NOTES = `All amounts are US dollars per year unless labelled per_paycheck. FICA and state payroll programs are charged on gross wages: a 401(k)/IRA contribution and deductions lower income tax only. "totals.federal_including_fica" includes Social Security and Medicare; "totals.state_including_local" includes city/county taxes. Tax data covers ${YEARS.join(", ")}. Estimates only, not tax advice.`;

function toolResult(output: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(output) }],
    structuredContent: output as Record<string, unknown>,
  };
}

function toolError(error: unknown) {
  const message =
    error instanceof InputError
      ? JSON.stringify({
          error: error.message,
          valid_values: error.validValues,
        })
      : error instanceof z.ZodError
        ? JSON.stringify({ error: "Invalid arguments.", issues: error.issues })
        : "Internal error.";
  if (!(error instanceof InputError) && !(error instanceof z.ZodError)) {
    console.error(error);
  }
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}

export function createServer(siteUrl: string) {
  const server = new McpServer({
    name: "income-tax",
    title: "US Income Tax Calculator",
    version: "1.0.0",
    websiteUrl: siteUrl,
  });

  server.registerTool(
    "calculate",
    {
      title: "Calculate take-home pay",
      description: `Calculate US federal, state and local taxes and take-home pay for an annual gross salary. ${SHARED_NOTES}`,
      inputSchema: calculateInput,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => {
      try {
        return toolResult(await runCalculate(args as CalculateInput, siteUrl));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "target",
    {
      title: "Find gross income for a take-home goal",
      description: `Work backwards from a desired take-home pay to the annual gross salary needed to reach it, with the full tax breakdown at that salary. take_home can be annual or per paycheck. Returns the lowest gross income, to the cent, whose take-home meets or exceeds the target. ${SHARED_NOTES}`,
      inputSchema: targetInput,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => {
      try {
        return toolResult(await runTarget(args as TargetInput, siteUrl));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "tax_tables",
    {
      title: "Look up tax brackets and rates",
      description: `Return the tax schedules the calculator uses: income tax brackets, payroll taxes (Social Security, Medicare, state programs), local taxes, standard deductions, the 401(k) limit and the state's sales tax rates, for a year, state and optional city. Use it to explain rates or brackets, or to discover a state's cities and tax-type keys. Each schedule has a kind and a basis; how_to_read explains them. For dollar amounts at a specific income use calculate, which applies every rule correctly. Tax data covers ${YEARS.join(", ")}.`,
      inputSchema: taxTablesInput,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => {
      try {
        return toolResult(await runTaxTables(args as TaxTablesInput, siteUrl));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  return server;
}
