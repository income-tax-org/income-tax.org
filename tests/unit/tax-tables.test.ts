import { describe, it, expect } from "vitest";
import federal2026 from "@/data/2026/federal";
import { taxTablesInput } from "@/api/inputs";
import type { TaxTablesInput } from "@/api/inputs";
import { parseQuery } from "@/api/http";
import { InputError, loadLocation } from "@/api/run";
import { TAX_DATA_REGISTRY, YEARS } from "@/data-loaders/registry";
import { runTaxTables } from "@/api/tax-tables";
import { salesTaxCitiesFor } from "@/utils/sales-tax";

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

  it("includes Oregon's exemption credit and explains it", async () => {
    const result: Json = await tables({ year: "2025", state: "oregon" });
    expect(result.state.personal_exemption_credit.single).toEqual([
      { min: 0, max: 100001, amount: 256 },
      { min: 100001, max: null, amount: 0 },
    ]);
    expect(result.state.personal_exemption_credit.married[0].amount).toBe(512);
    expect(
      result.how_to_read.some((line: string) =>
        line.startsWith("personal_exemption_credit"),
      ),
    ).toBe(true);
    expect(result.state.taxes.personal_exemption_credit).toBeUndefined();
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
  // every schedule in them must carry a kind the response explains. So must
  // every city the tax tables add for sales tax alone.
  it("describes every state and city in every year", async () => {
    for (const year of YEARS) {
      for (const state of Object.keys(TAX_DATA_REGISTRY[year].states)) {
        const { cities, salesTax } = await loadLocation(
          { year, state },
          { withSalesTax: true },
        );
        const allCities = new Set([
          ...cities,
          ...salesTaxCitiesFor(salesTax ?? null),
        ]);
        for (const city of ["", ...Array.from(allCities)]) {
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

describe("runTaxTables sales tax", () => {
  const allYear = (rate: number) => [
    { from: "2026-01-01", to: "2026-12-31", rate_percent: rate },
  ];

  it("gives the state rate, the average and each city's rate by period", async () => {
    const result: Json = await tables({ year: "2026", state: "washington" });
    const salesTax = result.sales_tax;
    expect(salesTax.data_available).toBe(true);
    expect(salesTax.state_rate).toEqual(allYear(6.5));
    expect(salesTax.state_average.local_rate).toEqual([
      { from: "2026-01-01", to: "2026-06-30", rate_percent: 3.01 },
      { from: "2026-07-01", to: "2026-12-31", rate_percent: 3.07 },
    ]);
    expect(salesTax.cities.seattle.combined_rate).toEqual(allYear(10.55));
    expect(salesTax.cities.tacoma.combined_rate).toEqual([
      { from: "2026-01-01", to: "2026-03-31", rate_percent: 10.3 },
      { from: "2026-04-01", to: "2026-06-30", rate_percent: 10.4 },
      { from: "2026-07-01", to: "2026-12-31", rate_percent: 10.5 },
    ]);
    expect(result.how_to_read.join("\n")).toContain("sales_tax:");
  });

  it("accepts a city with a sales tax rate but no local income tax", async () => {
    const result: Json = await tables({
      year: "2026",
      state: "washington",
      city: "seattle",
    });
    expect(result.location.city).toBe("seattle");
    expect(result.local).toBeNull();
    expect(Object.keys(result.sales_tax.cities)).toEqual(["seattle"]);
    expect(result.sales_tax.cities.seattle).toEqual({
      local_rate: allYear(4.05),
      combined_rate: allYear(10.55),
    });
    expect(result.source).toBe(`${SITE}/tax-tables/2026/washington/seattle/`);
  });

  it("says a year has no data rather than reporting 0%", async () => {
    const result: Json = await tables({ year: "2024", state: "washington" });
    expect(result.sales_tax).toEqual({
      data_available: false,
      note: "No sales tax data for 2024. That is missing data, not a 0% rate. Years with data: 2026, 2025.",
    });
    expect(result.how_to_read.join("\n")).not.toContain("sales_tax:");
  });

  it("rejects a sales tax city in a year without sales tax data", async () => {
    await expect(
      tables({ year: "2024", state: "washington", city: "seattle" }),
    ).rejects.toThrow(InputError);
  });

  it("returns sales tax alone when asked for it alone", async () => {
    const result: Json = await tables({
      year: "2026",
      state: "washington",
      tax_types: ["sales_tax"],
    });
    expect(result.federal.taxes).toEqual({});
    expect(result.state.taxes).toEqual({});
    expect(result.sales_tax.data_available).toBe(true);
  });

  it("leaves sales tax out when other tax types are asked for", async () => {
    const result: Json = await tables({
      year: "2026",
      state: "washington",
      tax_types: ["state_income"],
    });
    expect(result.sales_tax).toBeNull();
  });

  it("has no sales tax without a state", async () => {
    const result: Json = await tables({ year: "2026" });
    expect(result.sales_tax).toBeNull();
    await expect(
      tables({ year: "2026", tax_types: ["sales_tax"] }),
    ).rejects.toThrow(InputError);
  });
});

describe("parseQuery tax_types", () => {
  it("splits and normalises the list", () => {
    expect(
      parseQuery(new URLSearchParams("tax_types=state-income, City Income")),
    ).toEqual({ tax_types: ["state_income", "city_income"] });
  });
});
