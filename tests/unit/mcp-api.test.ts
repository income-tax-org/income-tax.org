import { describe, it, expect } from "vitest";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { calculate } from "@/utils/calculator";
import { toUnit } from "@/utils/money";
import type { TaxData } from "@/types";
import federal2026 from "@/data/2026/federal";
import newYork2026 from "@/data/2026/state/new_york";
import { calculateInput } from "@/mcp/inputs";
import type { CalculateInput } from "@/mcp/inputs";
import { InputError, runCalculate } from "@/mcp/run";
import { handleGet, parseQuery } from "@/mcp/http";
import { createServer } from "@/mcp/server";
import { LATEST_YEAR } from "@/mcp/tax-data-registry";

const SITE = "https://income-tax.org";

const calc = (args: Record<string, unknown>) =>
  runCalculate(calculateInput.parse(args) as CalculateInput, SITE);

describe("runCalculate", () => {
  it("matches the calculator the site runs", async () => {
    const result = await calc({
      income: 120_000,
      state: "new_york",
      city: "new_york_city",
      year: "2026",
      retirement_contribution: 10_000,
    });
    const direct = calculate(
      federal2026 as TaxData,
      newYork2026 as TaxData,
      120_000,
      "single",
      10_000,
      undefined,
      undefined,
      [],
      "new_york",
      "new_york_city",
    );
    expect(result.take_home.annual).toBe(toUnit(direct.takeHome.amount));
    expect(result.total_taxes.annual).toBe(toUnit(direct.totalTaxes));
    expect(result.totals.local.annual).toBe(toUnit(direct.totalCity.amount));
    expect(Object.keys(result.by_tax.local).length).toBeGreaterThan(0);
    expect(result.take_home.per_paycheck).toBeCloseTo(
      result.take_home.annual / 12,
      1,
    );
    expect(result.source).toBe(
      `${SITE}/2026/new-york/new-york-city/?income=120000`,
    );
  });

  it("defaults to the latest year, single, monthly, standard deductions", async () => {
    const result = await calc({ income: 80_000, state: "texas" });
    expect(result.inputs).toMatchObject({
      year: LATEST_YEAR,
      filing_status: "single",
      pay_frequency: "monthly",
      federal_deductions_source: "standard",
      city: null,
    });
    expect(result.inputs.federal_deductions).toBeGreaterThan(0);
  });

  it("applies custom deductions", async () => {
    const standard = await calc({ income: 150_000, state: "oregon" });
    const itemized = await calc({
      income: 150_000,
      state: "oregon",
      federal_deductions: 40_000,
      state_deductions: 20_000,
    });
    expect(itemized.inputs.federal_deductions_source).toBe("provided");
    expect(itemized.take_home.annual).toBeGreaterThan(
      standard.take_home.annual,
    );
  });

  it("caps the retirement contribution at the 401(k) limit", async () => {
    const result = await calc({
      income: 200_000,
      state: "texas",
      retirement_contribution: 1_000_000,
    });
    expect(result.inputs.retirement_contribution).toBe(
      federal2026.max_401k_contribution,
    );
    expect(result.notes[0]).toMatch(/401\(k\) limit/);
  });

  it("does not let the contribution reduce FICA", async () => {
    const without = await calc({ income: 100_000, state: "texas" });
    const withIt = await calc({
      income: 100_000,
      state: "texas",
      retirement_contribution: 20_000,
    });
    expect(withIt.totals.fica.annual).toBe(without.totals.fica.annual);
  });

  it("reports Oregon's federal tax subtraction", async () => {
    const oregon = await calc({
      income: 100_000,
      state: "oregon",
      year: "2025",
    });
    expect(oregon.taxable_income.state_federal_tax_subtraction).toBe(8500);
    // AGI is exactly the $100,000 limit, which still qualifies.
    expect(oregon.state_credits.personal_exemption).toBe(256);
    const texas = await calc({ income: 100_000, state: "texas" });
    expect(texas.taxable_income.state_federal_tax_subtraction).toBe(0);
    expect(texas.state_credits.personal_exemption).toBe(0);
  });

  it("honours exemptions", async () => {
    const result = await calc({
      income: 100_000,
      state: "texas",
      exempt_taxes: [{ tax: "social_security", scope: "federal" }],
    });
    expect(result.by_tax.federal.social_security).toBe("exempt");
  });

  it("rejects an unknown city with the valid ones", async () => {
    await expect(
      calc({ income: 1, state: "oregon", city: "salem" }),
    ).rejects.toMatchObject({
      validValues: ["portland", "eugene"],
    });
  });

  it("rejects an unknown exemption with the valid keys", async () => {
    const error = await calc({
      income: 1,
      state: "texas",
      exempt_taxes: [{ tax: "nope", scope: "federal" }],
    }).catch((e) => e);
    expect(error).toBeInstanceOf(InputError);
    expect(error.validValues).toContain("social_security");
  });

  it("accepts loose city spellings", async () => {
    const result = await calc({
      income: 100_000,
      state: "new_york",
      city: "New York City",
    });
    expect(result.inputs.city).toBe("new_york_city");
  });
});

describe("parseQuery", () => {
  it("coerces numbers, keys and exemptions", () => {
    const parsed = parseQuery(
      new URLSearchParams(
        "income=$120,000&state=New-York&city=new york city&exempt_taxes=federal:social_security,city:city_income,medicare",
      ),
    );
    expect(parsed).toEqual({
      income: 120_000,
      state: "new_york",
      city: "new_york_city",
      exempt_taxes: [
        { tax: "social_security", scope: "federal" },
        { tax: "city_income", scope: "city" },
        { tax: "medicare", scope: "state" },
      ],
    });
  });
});

describe("handleGet", () => {
  const get = (query: string) =>
    handleGet<CalculateInput>(
      new Request(`${SITE}/api/calculate?${query}`),
      calculateInput,
      runCalculate,
    );

  it("returns JSON with CORS", async () => {
    const response = await get("income=90000&state=washington");
    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    const body = await response.json();
    expect(body.take_home.annual).toBeGreaterThan(0);
  });

  it("returns 400 with the issue for bad input", async () => {
    const response = await get("income=abc&state=atlantis");
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.issues.map((i: { param: string }) => i.param)).toEqual([
      "income",
      "state",
    ]);
  });
});

describe("MCP server", () => {
  const handler = createMcpHandler(() => createServer(SITE));
  const rpc = async (method: string, params: unknown) => {
    const response = await handler.fetch(
      new Request(`${SITE}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          "Mcp-Protocol-Version": "2025-06-18",
        },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      }),
    );
    expect(response.status).toBe(200);
    const text = await response.text();
    // Stateless legacy responses may arrive as one SSE event.
    const json = text.startsWith("{")
      ? text
      : text
          .split("\n")
          .find((line) => line.startsWith("data: "))!
          .slice("data: ".length);
    return JSON.parse(json);
  };

  it("lists the tools", async () => {
    const { result } = await rpc("tools/list", {});
    expect(result.tools.map((tool: { name: string }) => tool.name)).toEqual([
      "calculate",
      "target",
      "tax_tables",
    ]);
  });

  it("calls tax_tables", async () => {
    const { result } = await rpc("tools/call", {
      name: "tax_tables",
      arguments: { state: "oregon", city: "portland", filing_status: "single" },
    });
    expect(result.isError).toBeFalsy();
    expect(result.structuredContent.local.taxes.art_tax).toBeDefined();
  });

  it("calls target", async () => {
    const { result } = await rpc("tools/call", {
      name: "target",
      arguments: { take_home: 100_000, state: "california" },
    });
    expect(result.isError).toBeFalsy();
    expect(result.structuredContent.required_gross_income).toBeGreaterThan(
      100_000,
    );
  });

  it("reports input errors as tool errors", async () => {
    const { result } = await rpc("tools/call", {
      name: "calculate",
      arguments: { income: 100_000, state: "oregon", city: "salem" },
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("portland");
  });
});
