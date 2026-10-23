import { describe, it, expect } from "vitest";
import federal2026 from "@/data/2026/federal";
import { taxTablesInput } from "@/mcp/inputs";
import type { TaxTablesInput } from "@/mcp/inputs";
import { parseQuery } from "@/mcp/http";
import { InputError, loadLocation } from "@/mcp/run";
import { TAX_DATA_REGISTRY, YEARS } from "@/mcp/tax-data-registry";
import { runTaxTables } from "@/mcp/tax-tables";

const SITE = "https://income-tax.org";

const tables = (args: Record<string, unknown>) =>
  runTaxTables(taxTablesInput.parse(args) as TaxTablesInput, SITE);

// The response is loosely typed JSON; tests read into it by path.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

describe("runTaxTables", () => {
  it("returns federal tables alone when no state is given", async () => {
    const result: Json = await tables({
      year: "2026",
      filing_status: "single",
    });
    expect(result.state).toBeNull();
    expect(result.local).toBeNull();
    expect(result.max_401k_contribution).toBe(
      federal2026.max_401k_contribution,
    );
    expect(result.federal.standard_deduction).toEqual({
      single: federal2026.standard_deduction?.single,
    });
    const income = result.federal.taxes.federal_income.schedules.single;
    expect(income.kind).toBe("marginal");
    expect(income.basis).toBe("taxable");
    // Infinity becomes null so the response stays valid JSON.
    expect(income.brackets.at(-1).max).toBeNull();
    expect(result.source).toBe(`${SITE}/tax-tables/2026/`);
  });

  it("returns every filing status when none is given", async () => {
    const result: Json = await tables({ tax_types: ["federal_income"] });
    expect(
      Object.keys(result.federal.taxes.federal_income.schedules).sort(),
    ).toEqual(["head_of_household", "married", "married_separately", "single"]);
  });

  it("charges FICA on gross wages", async () => {
    const result: Json = await tables({ tax_types: ["social_security"] });
    expect(result.federal.taxes.social_security.schedules.all.basis).toBe(
      "gross",
    );
  });

  it("lists a state's cities without their tables until one is asked for", async () => {
    const result: Json = await tables({ year: "2026", state: "maryland" });
    expect(result.state.cities_with_local_taxes).toContain("baltimore_city");
    expect(result.local).toBeNull();
  });

  it("labels Ohio's schedule base-plus-rate and explains it", async () => {
    const result: Json = await tables({
      year: "2026",
      state: "ohio",
      tax_types: ["state_income"],
    });
    const schedule = result.state.taxes.state_income.schedules.all;
    expect(schedule.kind).toBe("base_amount");
    expect(schedule.brackets.at(-1).base_amount).toBeGreaterThan(0);
    expect(
      result.how_to_read.some((line: string) => line.startsWith("base_amount")),
    ).toBe(true);
  });

  it("includes Oregon's federal tax subtraction cap and explains it", async () => {
    const result: Json = await tables({
      year: "2025",
      state: "oregon",
      filing_status: "married_separately",
    });
    const [first, second] =
      result.state.federal_tax_subtraction_cap.married_separately;
    expect(first).toEqual({ min: 0, max: 125000, amount: 4250 });
    expect(second).toEqual({ min: 125000, max: 130000, amount: 3400 });
    expect(
      result.how_to_read.some((line: string) =>
        line.startsWith("federal_tax_subtraction_cap"),
      ),
    ).toBe(true);
    // Data, not a tax: it must not show up as a schedule.
    expect(result.state.taxes.federal_tax_subtraction).toBeUndefined();
  });

  it("labels Eugene's payroll tax a rate on the whole base", async () => {
    const result: Json = await tables({
      year: "2026",
      state: "oregon",
      city: "eugene",
    });
    const schedule = result.local.taxes.employee_payroll_tax.schedules.all;
    expect(schedule.kind).toBe("rate_on_total");
    expect(schedule.basis).toBe("gross");
  });

  it("labels Yonkers' surcharge as charged on the state tax", async () => {
    const result: Json = await tables({
      year: "2026",
      state: "new_york",
      city: "yonkers",
    });
    expect(result.local.taxes.city_income.schedules.all.basis).toBe(
      "state_income_tax",
    );
  });

  it("gives the employee's share of a split payroll tax", async () => {
    const result: Json = await tables({
      year: "2026",
      state: "oregon",
      tax_types: ["oregon_paid_family_and_medical_leave"],
    });
    const [bracket] =
      result.state.taxes.oregon_paid_family_and_medical_leave.schedules.all
        .brackets;
    expect(bracket).toMatchObject({
      rate_percent: 1,
      employee_share_percent: 60,
      employee_rate_percent: 0.6,
    });
  });

  it("annualises flat fees and keeps their basis", async () => {
    const result: Json = await tables({
      year: "2026",
      state: "oregon",
      city: "portland",
      filing_status: "single",
      tax_types: ["art_tax"],
    });
    const [tier] = result.local.taxes.art_tax.schedules.single.tiers;
    expect(tier).toMatchObject({
      min_income: 20_000,
      amount: 50,
      annual_amount: 50,
      basis: "taxable",
    });
  });

  it("flags taxes a wage earner does not pay", async () => {
    const result: Json = await tables({ year: "2026", state: "washington" });
    const flagged = Object.entries(result.state.taxes).filter(
      ([, tax]: [string, Json]) => tax.withheld_from_wages === false,
    );
    expect(flagged.length).toBeGreaterThan(0);
    expect(
      result.how_to_read.some((line: string) =>
        line.startsWith("withheld_from_wages"),
      ),
    ).toBe(true);
  });

  it("rejects an unknown tax type with the valid ones", async () => {
    const error = await tables({
      state: "oregon",
      tax_types: ["arts_tax"],
    }).catch((e) => e);
    expect(error).toBeInstanceOf(InputError);
    expect(error.validValues).toContain("state_income");
  });

  it("rejects a city without a state", async () => {
    await expect(tables({ city: "portland" })).rejects.toThrow(
      "A city needs a state.",
    );
  });

  // Every location the calculator can serve must also produce tables, and
  // every schedule in them must carry a kind the response explains.
  it("describes every state and city in every year", async () => {
    for (const year of YEARS) {
      for (const state of Object.keys(TAX_DATA_REGISTRY[year].states)) {
        const { cities } = await loadLocation({ year, state });
        for (const city of ["", ...cities]) {
          const result: Json = await tables({ year, state, city });
          const explained = result.how_to_read.join("\n");
          for (const section of [result.federal, result.state, result.local]) {
            for (const tax of Object.values(section?.taxes ?? {}) as Json[]) {
              const schedules = tax.kind ? [tax] : Object.values(tax.schedules);
              for (const schedule of schedules as Json[]) {
                expect(explained).toContain(`${schedule.kind}:`);
              }
            }
          }
        }
      }
    }
  }, 60_000);
});

describe("parseQuery tax_types", () => {
  it("splits and normalises the list", () => {
    expect(
      parseQuery(new URLSearchParams("tax_types=state-income, City Income")),
    ).toEqual({ tax_types: ["state_income", "city_income"] });
  });
});
