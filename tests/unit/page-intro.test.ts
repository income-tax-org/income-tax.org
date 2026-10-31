import { describe, it, expect } from "vitest";
import {
  calculatorCityIntro,
  calculatorStateIntro,
  comparePairIntro,
  describeLocalTaxes,
  formatRate,
  localitiesWithWageTaxes,
  localTaxName,
  stateIncomeTax,
  taxTablesCityIntro,
  taxTablesStateIntro,
} from "@/utils/page-intro";
import { comparePairHeading, placeHeading } from "@/utils/page-heading";
import { INCOME_TAX_CALCULATOR, TAX_TABLES } from "@/constants/pages";
import {
  ART_TAX,
  CITY_INCOME,
  NYC_INCOME,
  OCCUPATIONAL_PRIVILEGE_TAX,
} from "@/constants/tax-types";
import {
  ANCHORAGE,
  COLUMBUS,
  DENVER,
  EUGENE,
  HUNTINGTON,
  JUNEAU,
  NEWARK,
  PORTLAND,
  SEATTLE,
  YONKERS,
} from "@/constants/cities";
import type { SalesTaxData, TaxData } from "@/types";
import federal2025Data from "@/data/2025/federal";
import alabama2026Data from "@/data/2026/state/alabama";
import alaska2025Data from "@/data/2025/state/alaska";
import arizona2026Data from "@/data/2026/state/arizona";
import colorado2025Data from "@/data/2025/state/colorado";
import dc2025Data from "@/data/2025/state/district_of_columbia";
import florida2025Data from "@/data/2025/state/florida";
import idaho2025Data from "@/data/2025/state/idaho";
import newJersey2025Data from "@/data/2025/state/new_jersey";
import newYork2025Data from "@/data/2025/state/new_york";
import ohio2025Data from "@/data/2025/state/ohio";
import oregon2025Data from "@/data/2025/state/oregon";
import texas2025Data from "@/data/2025/state/texas";
import washington2025Data from "@/data/2025/state/washington";
import westVirginia2025Data from "@/data/2025/state/west_virginia";
import alaskaSales2025Data from "@/data/2025/sales-tax/state/alaska";
import newJerseySales2025Data from "@/data/2025/sales-tax/state/new_jersey";
import ohioSales2025Data from "@/data/2025/sales-tax/state/ohio";
import washingtonSales2025Data from "@/data/2025/sales-tax/state/washington";

const federal2025 = federal2025Data as TaxData;
const alabama2026 = alabama2026Data as TaxData;
const alaska2025 = alaska2025Data as TaxData;
const arizona2026 = arizona2026Data as TaxData;
const colorado2025 = colorado2025Data as TaxData;
const dc2025 = dc2025Data as TaxData;
const florida2025 = florida2025Data as TaxData;
const idaho2025 = idaho2025Data as TaxData;
const newJersey2025 = newJersey2025Data as TaxData;
const newYork2025 = newYork2025Data as TaxData;
const ohio2025 = ohio2025Data as TaxData;
const oregon2025 = oregon2025Data as TaxData;
const texas2025 = texas2025Data as TaxData;
const washington2025 = washington2025Data as TaxData;
const westVirginia2025 = westVirginia2025Data as TaxData;
const alaskaSales2025 = alaskaSales2025Data as SalesTaxData;
const newJerseySales2025 = newJerseySales2025Data as SalesTaxData;
const ohioSales2025 = ohioSales2025Data as SalesTaxData;
const washingtonSales2025 = washingtonSales2025Data as SalesTaxData;

describe("formatRate", () => {
  it("prints rates as published, without float noise", () => {
    expect(formatRate(2.5)).toBe("2.5%");
    expect(formatRate(3.125)).toBe("3.125%");
    expect(formatRate(6.5 + 3.85)).toBe("10.35%");
  });
});

describe("stateIncomeTax", () => {
  it("has none for a state that levies none", () => {
    expect(stateIncomeTax(texas2025).kind).toBe("none");
  });

  it("calls a 0% band plus one rate flat, as Idaho does", () => {
    expect(stateIncomeTax(idaho2025)).toEqual({
      kind: "flat",
      rate: 5.3,
      singleFilersOnly: false,
    });
  });

  it("reports the charged range of a progressive schedule", () => {
    // Ohio's 0% band below $26,050 is an exempt amount, not a rate.
    expect(stateIncomeTax(ohio2025)).toEqual({
      kind: "range",
      low: 2.75,
      high: 3.125,
      progressive: true,
      singleFilersOnly: false,
    });
  });

  it("needs no filing-status qualifier when only the bands differ", () => {
    // New Jersey's joint schedule has a 2.45% band the single one lacks, but
    // both run from 1.4% to 10.75%.
    expect(stateIncomeTax(newJersey2025).singleFilersOnly).toBe(false);
  });
});

describe("localTaxName", () => {
  it("reads a key as a common noun", () => {
    expect(localTaxName(CITY_INCOME)).toBe("city income tax");
    expect(localTaxName(OCCUPATIONAL_PRIVILEGE_TAX)).toBe(
      "occupational privilege tax",
    );
  });

  it("keeps proper names", () => {
    expect(localTaxName(NYC_INCOME)).toBe("New York City income tax");
    expect(localTaxName(ART_TAX)).toBe("Arts Tax");
  });
});

describe("describeLocalTaxes", () => {
  it("annualizes a monthly flat fee and gives its threshold", () => {
    expect(describeLocalTaxes(colorado2025, DENVER)).toEqual([
      "an occupational privilege tax of $69 a year ($5.75 a month) on wages of $6,000 or more",
    ]);
  });

  it("annualizes a weekly fee with no threshold", () => {
    expect(describeLocalTaxes(westVirginia2025, HUNTINGTON)).toEqual([
      "an occupational privilege tax of $260 a year ($5 a week)",
    ]);
  });

  it("describes a rate-lookup schedule as charged on all wages", () => {
    expect(describeLocalTaxes(oregon2025, EUGENE)).toEqual([
      "an employee payroll tax of 0.44% on all wages once they reach $31,304",
    ]);
  });

  it("describes every Portland tax, quoting single filers' thresholds", () => {
    expect(describeLocalTaxes(oregon2025, PORTLAND)).toEqual([
      "an Arts Tax of $35 a year on wages of $1,000 or more",
      "a Supportive Housing Services tax of 1% on taxable income over $125,000 for single filers",
      "a Preschool for All tax of 1.5% to 3% on taxable income over $125,000 for single filers",
    ]);
  });

  it("describes Yonkers' surcharge as a share of the state's tax", () => {
    expect(describeLocalTaxes(newYork2025, YONKERS)).toEqual([
      "a city income tax of 16.75% of the state income tax",
    ]);
  });

  it("leaves out a tax the employer pays", () => {
    expect(describeLocalTaxes(newJersey2025, NEWARK)).toEqual([]);
    expect(localitiesWithWageTaxes(newJersey2025)).toEqual([]);
  });
});

describe("calculatorStateIntro", () => {
  it("describes a state with no income tax", () => {
    expect(
      calculatorStateIntro({
        year: "2025",
        state: "texas",
        federalTaxes: federal2025,
        stateTaxes: texas2025,
      }),
    ).toBe(
      "Texas has no state income tax in 2025. Enter a salary to estimate take-home pay after federal income tax (10% to 37%), Social Security and Medicare.",
    );
  });

  it("notes a state payroll tax where there is no income tax", () => {
    expect(
      calculatorStateIntro({
        year: "2025",
        state: "washington",
        federalTaxes: federal2025,
        stateTaxes: washington2025,
      }),
    ).toBe(
      "Washington has no state income tax in 2025, though wages there are subject to a state payroll tax. Enter a salary to estimate take-home pay after federal income tax (10% to 37%), Social Security, Medicare and Washington taxes.",
    );
  });

  it("describes a progressive state and counts its localities", () => {
    expect(
      calculatorStateIntro({
        year: "2025",
        state: "ohio",
        federalTaxes: federal2025,
        stateTaxes: ohio2025,
      }),
    ).toBe(
      "Ohio has a progressive income tax (2.75% to 3.125%) in 2025. 6 localities in Ohio add their own tax on wages. Enter a salary to estimate take-home pay after federal income tax (10% to 37%), Social Security, Medicare and Ohio taxes.",
    );
  });

  it("does not call the District of Columbia a state with a state tax", () => {
    expect(
      calculatorStateIntro({
        year: "2025",
        state: "district_of_columbia",
        federalTaxes: federal2025,
        stateTaxes: dc2025,
      }),
    ).toMatch(
      /^District of Columbia has a progressive income tax \(4% to 10\.75%\) in 2025\./,
    );
  });
});

describe("calculatorCityIntro", () => {
  it("puts the city tax on top of the state's", () => {
    expect(
      calculatorCityIntro({
        year: "2025",
        state: "ohio",
        city: COLUMBUS,
        federalTaxes: federal2025,
        stateTaxes: ohio2025,
      }),
    ).toBe(
      "Columbus, Ohio levies a city income tax of 2.5% in 2025, on top of Ohio's progressive income tax (2.75% to 3.125%) and federal taxes. Enter a salary to estimate take-home pay with every federal, state and local tax included.",
    );
  });

  it("says so when a city's only local tax falls on employers", () => {
    expect(
      calculatorCityIntro({
        year: "2025",
        state: "new_jersey",
        city: NEWARK,
        federalTaxes: federal2025,
        stateTaxes: newJersey2025,
      }),
    ).toMatch(
      /^Newark, New Jersey has no local income tax in 2025; New Jersey has a progressive income tax \(1\.4% to 10\.75%\)\./,
    );
  });
});

describe("taxTablesStateIntro", () => {
  it("adds the sales tax rates, averaging a local rate that changed", () => {
    expect(
      taxTablesStateIntro({
        year: "2025",
        state: "washington",
        stateTaxes: washington2025,
        salesTax: washingtonSales2025,
      }),
    ).toBe(
      "Washington has no state income tax in 2025, though wages there are subject to a state payroll tax. Washington's state sales tax rate is 6.5%, and local taxes add about 2.95% on average.",
    );
  });

  it("handles a state with only local sales taxes", () => {
    expect(
      taxTablesStateIntro({
        year: "2025",
        state: "alaska",
        stateTaxes: alaska2025,
        salesTax: alaskaSales2025,
      }),
    ).toBe(
      "Alaska has no state income tax in 2025. Alaska has no state sales tax, though local taxes add about 1.82% on average.",
    );
  });

  it("leaves sales tax out for a year without the data", () => {
    expect(
      taxTablesStateIntro({
        year: "2025",
        state: "florida",
        stateTaxes: florida2025,
        salesTax: null,
      }),
    ).toBe("Florida has no state income tax in 2025.");
  });
});

describe("taxTablesCityIntro", () => {
  it("describes a sales-tax-only city", () => {
    expect(
      taxTablesCityIntro({
        year: "2025",
        state: "washington",
        city: SEATTLE,
        stateTaxes: washington2025,
        salesTax: washingtonSales2025,
      }),
    ).toBe(
      "Seattle, Washington has no local income tax in 2025, and Washington has no state income tax. The combined sales tax rate in Seattle is 10.35%: Washington's 6.5% plus 3.85% in local taxes.",
    );
  });

  it("gives the range of a city rate that changed during the year", () => {
    expect(
      taxTablesCityIntro({
        year: "2025",
        state: "ohio",
        city: COLUMBUS,
        stateTaxes: ohio2025,
        salesTax: ohioSales2025,
      }),
    ).toBe(
      "Columbus, Ohio levies a city income tax of 2.5% in 2025, on top of Ohio's progressive income tax (2.75% to 3.125%) and federal taxes. The combined sales tax rate in Columbus ranges from 7.5% to 8% during 2025.",
    );
  });

  it("does not print a 0% local or state rate as a component", () => {
    const juneau = taxTablesCityIntro({
      year: "2025",
      state: "alaska",
      city: JUNEAU,
      stateTaxes: alaska2025,
      salesTax: alaskaSales2025,
    });
    expect(juneau).toContain(
      "The sales tax rate in Juneau is 5%, all of it local.",
    );

    const anchorage = taxTablesCityIntro({
      year: "2025",
      state: "alaska",
      city: ANCHORAGE,
      stateTaxes: alaska2025,
      salesTax: alaskaSales2025,
    });
    expect(anchorage).toContain("There is no sales tax in Anchorage.");

    const newark = taxTablesCityIntro({
      year: "2025",
      state: "new_jersey",
      city: NEWARK,
      stateTaxes: newJersey2025,
      salesTax: newJerseySales2025,
    });
    expect(newark).toContain(
      "The sales tax rate in Newark is 6.625%, with no local sales tax.",
    );
  });
});

describe("comparePairIntro", () => {
  it("contrasts a progressive state with a flat one", () => {
    expect(
      comparePairIntro({
        year: "2026",
        stateA: "alabama",
        stateB: "arizona",
        federalTaxes: federal2025,
        stateTaxesA: alabama2026,
        stateTaxesB: arizona2026,
      }),
    ).toMatch(
      /^In 2026, Alabama has a progressive income tax \(2% to 5%\), while Arizona has a flat 2\.5% income tax\./,
    );
  });

  it("says neither when both states have no income tax", () => {
    expect(
      comparePairIntro({
        year: "2025",
        stateA: "texas",
        stateB: "florida",
        federalTaxes: federal2025,
        stateTaxesA: texas2025,
        stateTaxesB: florida2025,
      }),
    ).toBe(
      "In 2025, neither Texas nor Florida has a state income tax. Compare take-home pay in both at any salary, after federal income tax (10% to 37%), Social Security, Medicare and each state's own taxes.",
    );
  });
});

describe("headings", () => {
  it("words a place heading like its page title", () => {
    expect(placeHeading(INCOME_TAX_CALCULATOR.name)).toBe(
      "Income Tax Calculator",
    );
    expect(
      placeHeading(INCOME_TAX_CALCULATOR.name, "2025", "ohio", "columbus"),
    ).toBe("2025 Columbus, Ohio Income Tax Calculator");
    expect(placeHeading(TAX_TABLES.name, "2025", "new-york")).toBe(
      "2025 New York Income Tax Tables",
    );
  });

  it("names both states of a comparison", () => {
    expect(comparePairHeading("2026", "alabama", "new-mexico")).toBe(
      "Alabama vs New Mexico Income Tax (2026)",
    );
  });
});
