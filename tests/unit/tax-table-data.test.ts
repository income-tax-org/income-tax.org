import { describe, it, expect } from "vitest";
import {
  salesTaxToTable,
  standardDeductionMapToTable,
  tableDataFromTaxData,
} from "@/utils/tax-table-data";
import { INFINITY } from "@/constants";
import ohio2026 from "@/data/2026/state/ohio";
import ohio2025 from "@/data/2025/state/ohio";
import newYork2025 from "@/data/2025/state/new_york";
import newJersey2026 from "@/data/2026/state/new_jersey";
import oregon2026 from "@/data/2026/state/oregon";
import texas2025 from "@/data/2025/state/texas";
import { STATE_INCOME } from "@/constants/tax-types";
import { CITIES } from "@/constants";
import type { SalesTaxData, TaxData } from "@/types";
import washingtonSalesTax2026 from "@/data/2026/sales-tax/state/washington";
import oregonSalesTax2026 from "@/data/2026/sales-tax/state/oregon";

const everyRowMatchesHeaderCount = (table: {
  headers: string[];
  rows: unknown[][];
}) => table.rows.every((row) => row.length === table.headers.length);

describe("tableDataFromTaxData", () => {
  it("renders a 0% bracket rather than dropping the row", () => {
    // Ohio's first bracket is 0% up to $26,050. A truthiness check on `rate`
    // treated it as absent, blanking the row and shifting every later row one
    // column left of its header.
    const table = tableDataFromTaxData("state_income", ohio2026[STATE_INCOME]);

    // "Tax" rather than "Rate": Ohio's bands carry a base amount, so the
    // column states "$332.00 + 2.75%" and a bare rate would understate it.
    // The 0% row has no base, so it still reads as a plain rate.
    expect(table.headers[0]).toBe("Tax");
    expect(table.rows[0][0]).toBe("0%");
    expect(table.rows[0][1]).toBe("$0 - $26,050");
    expect(everyRowMatchesHeaderCount(table)).toBe(true);
  });

  it("keeps columns aligned when filing statuses have different bracket counts", () => {
    // 2026 New Jersey: 7 brackets for single and married-separately, 8 for the
    // other two. The extra bracket must sit under the statuses that have it.
    const table = tableDataFromTaxData(
      "state_income",
      newJersey2026[STATE_INCOME],
    );

    expect(table.headers).toEqual([
      "Rate",
      "Single",
      "Married",
      "Married Separately",
      "Head of Household",
    ]);
    expect(everyRowMatchesHeaderCount(table)).toBe(true);

    const lastRow = table.rows[table.rows.length - 1];
    expect(lastRow[1]).toBe(""); // single has no 8th bracket
    expect(lastRow[2]).toBe("$1,000,001+"); // married does
    expect(lastRow[3]).toBe(""); // married separately does not
    expect(lastRow[4]).toBe("$1,000,001+"); // head of household does
  });

  it("shows an ALL schedule under every filing status", () => {
    const table = tableDataFromTaxData("state_income", ohio2026[STATE_INCOME]);
    expect(table.headers).toEqual([
      // See above: Ohio's schedule carries base amounts.
      "Tax",
      "Single",
      "Married",
      "Married Separately",
      "Head of Household",
    ]);
    const [, single, married] = table.rows[1];
    expect(single).toBe(married);
  });

  it("gives a split payroll tax its own employee-portion column", () => {
    const table = tableDataFromTaxData(
      "oregon_paid_family_and_medical_leave",
      oregon2026["oregon_paid_family_and_medical_leave"],
    );

    expect(table.headers[0]).toBe("Employee Portion");
    expect(table.headers[1]).toBe("Rate");
    expect(table.rows[0][0]).toBe("60%");
    expect(table.rows[0][1]).toBe("1%");
    expect(everyRowMatchesHeaderCount(table)).toBe(true);
  });

  it("annualizes a flat fee and states its threshold", () => {
    const artTax = (oregon2026[CITIES] as TaxData[typeof CITIES])?.portland
      ?.art_tax;
    const table = tableDataFromTaxData("art_tax", artTax);

    expect(table.headers).toContain("Single");
    expect(String(table.rows[0][0])).toMatch(/^\$50 at \$20,000\+$/);
    expect(everyRowMatchesHeaderCount(table)).toBe(true);
  });

  it("renders a no-income-tax state as such", () => {
    expect(
      tableDataFromTaxData("state_income", texas2025[STATE_INCOME]),
    ).toEqual({ name: "state_income", headers: ["No Taxes"], rows: [] });
  });

  it("starts each bracket a dollar above the previous boundary", () => {
    const table = tableDataFromTaxData(
      "state_income",
      newJersey2026[STATE_INCOME],
    );
    expect(table.rows[0][1]).toBe("$0 - $20,000");
    expect(table.rows[1][1]).toBe("$20,001 - $35,000");
  });

  it("returns an empty table for data that holds no brackets", () => {
    expect(tableDataFromTaxData("max_401k_contribution", 24500)).toEqual({
      name: "max_401k_contribution",
      headers: [],
      rows: [],
    });
  });
});

// Showing "2.75%" alone is exactly what understated Ohio: the statute charges
// "$342.00 plus 2.750% of the amount in excess of $26,050", and the base is
// most of the bill at the bottom of the range.
describe("a schedule whose bands carry a base amount", () => {
  const table = tableDataFromTaxData(
    "Ohio State Income",
    (ohio2025 as TaxData)[STATE_INCOME],
  );

  it("heads the column Tax rather than Rate", () => {
    expect(table.headers[0]).toBe("Tax");
  });

  it("states the base alongside the rate, as the statute does", () => {
    expect(table.rows.map((row) => row[0])).toEqual([
      "0%",
      "$342.00 + 2.75%",
      "$2,394.32 + 3.125%",
    ]);
  });

  it("keeps the income ranges", () => {
    expect(table.rows[1][1]).toBe("$26,051 - $100,000");
  });
});

// Yonkers' surcharge is charged on the state's tax, so the usual
// rate-and-range grid would invite a reader to apply 16.75% to their salary.
describe("a schedule charged on the state's own tax", () => {
  const table = tableDataFromTaxData(
    "yonkers_income",
    (newYork2025 as TaxData)[CITIES]?.yonkers?.city_income,
  );

  it("states what the rate is charged on, with no income ranges", () => {
    expect(table.headers).toEqual(["Tax"]);
    expect(table.rows).toEqual([["16.75% of state income tax"]]);
  });
});

describe("standardDeductionMapToTable", () => {
  it("lists one row per filing status", () => {
    const table = standardDeductionMapToTable("Standard Oregon Deductions", {
      single: 2910,
      married: 5820,
      married_separately: 2910,
      head_of_household: 4680,
    });

    expect(table.name).toBe("standard_oregon_deductions");
    expect(table.headers).toEqual(["Filing Status", "Amount"]);
    expect(table.rows).toHaveLength(4);
    expect(table.rows[0]).toEqual(["Single", "$2,910"]);
  });

  // A state that shrinks the deduction as income rises cannot be described by
  // one amount per status. Showing only the maximum on the reference page is
  // the same overstatement the calculator used to make.
  describe("a schedule that varies with income", () => {
    const banded = standardDeductionMapToTable(
      "Standard Wisconsin Deductions",
      {
        single: [
          { min: 0, max: 19550, amount: 13560 },
          { min: 19550, max: 132550, amount: 13560, reduce_rate: 12 },
          { min: 132550, max: INFINITY, amount: 0 },
        ],
        married: 25110,
        married_separately: 11930,
        head_of_household: [
          { min: 0, max: 19550, amount: 17520 },
          { min: 19550, max: 57211, amount: 17520, reduce_rate: 22.515 },
          {
            min: 57211,
            max: 132550,
            amount: 13560,
            reduce_from: 19550,
            reduce_rate: 12,
          },
          { min: 132550, max: INFINITY, amount: 0 },
        ],
      },
    );

    it("gains an income column", () => {
      expect(banded.headers).toEqual(["Filing Status", "Income", "Deduction"]);
    });

    it("puts the published ranges back on the page", () => {
      // Half-open [19550, 132550) in the data; "$19,550 - $132,549" is how
      // Wisconsin prints it.
      expect(banded.rows[0]).toEqual(["Single", "$0 - $19,549", "$13,560"]);
      expect(banded.rows[1]).toEqual([
        "",
        "$19,550 - $132,549",
        "$13,560 less 12% of income over $19,550",
      ]);
      expect(banded.rows[2]).toEqual(["", "$132,550+", "$0"]);
    });

    it("keeps a flat status alongside a banded one", () => {
      expect(banded.rows[3]).toEqual(["Married", "Any", "$25,110"]);
    });

    it("shows where a second-stage band measures its reduction from", () => {
      const crossover = banded.rows.find(
        (row) => row[1] === "$57,211 - $132,549",
      );
      expect(crossover?.[2]).toBe("$13,560 less 12% of income over $19,550");
    });

    it("spells out a stepped reduction and its floor", () => {
      const stepped = standardDeductionMapToTable("Stepped", {
        single: [
          { min: 0, max: 26000, amount: 8500 },
          {
            min: 26000,
            max: INFINITY,
            amount: 8500,
            reduce_per: 500,
            reduce_by: 175,
            floor: 5000,
          },
        ],
        married: 8500,
        married_separately: 8500,
        head_of_household: 8500,
      });
      expect(stepped.rows[1][2]).toBe(
        "$8,500 less $175 per $500 over $26,000, and never below $5,000",
      );
    });
  });
});

describe("salesTaxToTable", () => {
  const washington = washingtonSalesTax2026 as SalesTaxData;

  it("says a year has no data rather than showing 0%", () => {
    const table = salesTaxToTable("washington_sales_tax", null, "2024", "");
    expect(table.headers).toEqual(["No sales tax data for 2024"]);
    expect(table.rows).toEqual([]);
  });

  it("shows a state whose data says it has no sales tax as no taxes", () => {
    const table = salesTaxToTable(
      "oregon_sales_tax",
      oregonSalesTax2026 as SalesTaxData,
      "2026",
      "",
    );
    expect(table.headers).toEqual(["No Taxes"]);
    expect(table.rows).toEqual([]);
  });

  it("lists the state average and every city the file lists", () => {
    const table = salesTaxToTable(
      "washington_sales_tax",
      washington,
      "2026",
      "",
    );
    expect(table.headers).toEqual([
      "Location",
      "State Rate",
      "Local Rate",
      "Combined Rate",
    ]);
    expect(table.rows).toHaveLength(
      1 + Object.keys(washington[CITIES] ?? {}).length,
    );
    expect(everyRowMatchesHeaderCount(table)).toBe(true);
    // The Tax Foundation's average rose for the second half of the year.
    expect(table.rows[0]).toEqual([
      "State average",
      "6.5%",
      "3.01% (Jan–Jun)\n3.07% (Jul–Dec)",
      "9.51% (Jan–Jun)\n9.57% (Jul–Dec)",
    ]);
    expect(table.rows).toContainEqual(["Seattle", "6.5%", "4.05%", "10.55%"]);
    expect(table.rows).toContainEqual([
      "Tacoma",
      "6.5%",
      "3.8% (Jan–Mar)\n3.9% (Apr–Jun)\n4% (Jul–Dec)",
      "10.3% (Jan–Mar)\n10.4% (Apr–Jun)\n10.5% (Jul–Dec)",
    ]);
    expect(table.note).toBe(
      "Rates that changed during 2026 are listed with the months each applied.",
    );
  });

  it("shows only the city picked, and no note when nothing changed", () => {
    const table = salesTaxToTable(
      "seattle_sales_tax",
      washington,
      "2026",
      "seattle",
    );
    expect(table.rows).toEqual([["Seattle", "6.5%", "4.05%", "10.55%"]]);
    expect(table.note).toBeUndefined();
  });

  it("labels a city the file does not list as the state average", () => {
    const table = salesTaxToTable(
      "ellensburg_sales_tax",
      washington,
      "2026",
      "ellensburg",
    );
    expect(table.rows[0][0]).toBe("Ellensburg (state average)");
    expect(table.rows[0][3]).toBe("9.51% (Jan–Jun)\n9.57% (Jul–Dec)");
  });
});
