import { describe, it, expect } from "vitest";
import type { Money } from "@/utils/money";
import { calculate, getPercent } from "@/utils/calculator";
import { getMarginalRate } from "@/utils/marginal-rate";
import { collectBracketSchedules } from "@/utils/bracket-schedules";
import federal2025 from "@/data/2025/federal";
import oregon2025 from "@/data/2025/state/oregon";
import federal2026 from "@/data/2026/federal";
import oregon2026 from "@/data/2026/state/oregon";
import oregon2023 from "@/data/2023/state/oregon";
import missouri2026 from "@/data/2026/state/missouri";
import newYork2025 from "@/data/2025/state/new_york";
import colorado2025 from "@/data/2025/state/colorado";
import alabama2025 from "@/data/2025/state/alabama";
import westVirginia2025 from "@/data/2025/state/west_virginia";
import texas2025 from "@/data/2025/state/texas";
import delaware2025 from "@/data/2025/state/delaware";
import ohio2023 from "@/data/2023/state/ohio";
import ohio2024 from "@/data/2024/state/ohio";
import ohio2025 from "@/data/2025/state/ohio";
import ohio2026 from "@/data/2026/state/ohio";
import illinois2025 from "@/data/2025/state/illinois";
import newJersey2025 from "@/data/2025/state/new_jersey";
import {
  SINGLE,
  MARRIED,
  MARRIED_SEPARATELY,
  HEAD_OF_HOUSEHOLD,
  ALL,
} from "@/constants/filing-status";
import type { FilingStatus } from "@/constants/filing-status";
import {
  FEDERAL_INCOME,
  SOCIAL_SECURITY,
  MEDICARE,
  STATE_INCOME,
  STANDARD_DEDUCTION,
  OREGON_TRANSIT_TAX,
  OREGON_PAID_FAMILY_AND_MEDICAL_LEAVE,
  ART_TAX,
  CITY_INCOME,
  OCCUPATIONAL_TAX,
  PERSONAL_EXEMPTION_CREDIT,
  PRESCHOOL_FOR_ALL,
  SUPPORTIVE_HOUSING_SERVICES,
} from "@/constants/tax-types";
import { BIRMINGHAM, PORTLAND } from "@/constants/cities";
import {
  CITIES,
  CITY_SCOPE,
  FEDERAL_SCOPE,
  INFINITY,
  STATE_SCOPE,
  TAXABLE_INCOME_BASIS,
} from "@/constants";
import type { TaxData, TaxResults } from "@/types";
import type { TaxOption } from "@/utils/get-tax-options";
import { EXEMPT } from "@/constants";
import {
  add,
  asCurrency,
  equal,
  lessThanOrEqual,
  percentage,
  subtract,
  toCents,
  toUnit,
} from "@/utils/money";

/**
 * Manually calculate tax for a progressive bracket system using Money
 * This is our independent verification logic
 */
function calculateProgressiveTax(taxableIncome: Money, brackets: any[]): Money {
  let totalTax = asCurrency(0);

  for (const bracket of brackets) {
    const min = asCurrency(bracket.min);
    const max =
      bracket.max === INFINITY
        ? taxableIncome
        : asCurrency(Math.min(bracket.max, toUnit(taxableIncome)));

    if (lessThanOrEqual(taxableIncome, min)) {
      break;
    }

    const bracketRange = subtract(max, min);
    if (lessThanOrEqual(bracketRange, asCurrency(0))) {
      continue;
    }

    let bracketTax = percentage(bracketRange, bracket.rate);

    // Handle percent_of_total for things like employer/employee split
    if (bracket.percent_of_total) {
      bracketTax = percentage(bracketTax, bracket.percent_of_total);
    }

    totalTax = add(totalTax, bracketTax);
  }

  return totalTax;
}

/**
 * Oregon's 2025 federal tax liability subtraction cap, from Table 4 of the 2025
 * Form OR-40 instructions. Written out from the published table rather than
 * read from the data file, so these tests also check the transcription.
 */
function oregon2025FederalSubtractionCap(
  agi: number,
  filingStatus: FilingStatus,
): number {
  const joint = filingStatus === MARRIED || filingStatus === HEAD_OF_HOUSEHOLD;
  const cap = filingStatus === MARRIED_SEPARATELY ? 4250 : 8500;
  const start = joint ? 250000 : 125000;
  const step = joint ? 10000 : 5000;
  if (agi < start) {
    return cap;
  }
  // Each step takes another fifth of the cap; the fifth step reaches zero.
  const steps = Math.min(5, Math.floor((agi - start) / step) + 1);
  return (cap * (5 - steps)) / 5;
}

/**
 * Calculate expected taxes independently
 */
function calculateExpectedTaxes(
  income: number,
  filingStatus: FilingStatus,
  ira: number,
  federalDeductions?: number,
  stateDeductions?: number,
) {
  // W-2 boxes 3 and 5. A pre-tax retirement contribution reduces box 1 only,
  // so it does not reduce the base for FICA or the state wage programs.
  const ficaWages = asCurrency(income);
  const incomeAfterIRA = subtract(ficaWages, asCurrency(ira));

  // Get standard deductions
  const federalStandardDeduction =
    (federal2025[STANDARD_DEDUCTION] as any)?.[filingStatus] || 0;
  const stateStandardDeduction =
    (oregon2025[STANDARD_DEDUCTION] as any)?.[filingStatus] || 0;

  // Use custom or standard deductions
  const fedDeductions = federalDeductions ?? federalStandardDeduction;
  const stateDeduct = stateDeductions ?? stateStandardDeduction;

  // Calculate taxable income
  const federalTaxableIncome = subtract(
    incomeAfterIRA,
    asCurrency(fedDeductions),
  );

  // Federal Income Tax
  const federalIncomeBrackets = (federal2025[FEDERAL_INCOME] as any)?.[
    filingStatus
  ] as any[];
  const federalIncomeTax = calculateProgressiveTax(
    federalTaxableIncome,
    federalIncomeBrackets,
  );

  // Oregon subtracts federal income tax, up to the AGI-phased cap, on top of
  // whatever deduction applies.
  const federalTaxSubtraction = Math.min(
    toUnit(federalIncomeTax),
    oregon2025FederalSubtractionCap(toUnit(incomeAfterIRA), filingStatus),
  );
  const stateTaxableIncome = subtract(
    incomeAfterIRA,
    asCurrency(stateDeduct + federalTaxSubtraction),
  );

  // Social Security (on gross wages, before the deferral and before deductions)
  const socialSecurityBrackets = (federal2025[SOCIAL_SECURITY] as any)?.[
    ALL
  ] as any[];
  const socialSecurityTax = calculateProgressiveTax(
    ficaWages,
    socialSecurityBrackets,
  );

  // Medicare (same base as Social Security)
  const medicareBrackets = (federal2025[MEDICARE] as any)?.[
    filingStatus
  ] as any[];
  const medicareTax = calculateProgressiveTax(ficaWages, medicareBrackets);

  // State Income Tax, less Oregon's 2025 exemption credit: $256 per
  // exemption (two filing jointly), but nothing once federal AGI is more than
  // $100,000 single or separately, $200,000 otherwise. Nonrefundable.
  const stateIncomeBrackets = (oregon2025[STATE_INCOME] as any)?.[
    filingStatus
  ] as any[];
  const stateIncomeTaxBeforeCredit = calculateProgressiveTax(
    stateTaxableIncome,
    stateIncomeBrackets,
  );
  const creditLimit =
    filingStatus === SINGLE || filingStatus === MARRIED_SEPARATELY
      ? 100000
      : 200000;
  const exemptionCredit =
    toUnit(incomeAfterIRA) > creditLimit
      ? 0
      : 256 * (filingStatus === MARRIED ? 2 : 1);
  const stateIncomeTax = asCurrency(
    Math.max(0, toUnit(stateIncomeTaxBeforeCredit) - exemptionCredit),
  );

  // Oregon Transit Tax (on gross wages, not income after deductions — Oregon
  // DOR computes it "before any exemptions or deductions")
  const transitBrackets = (oregon2025[OREGON_TRANSIT_TAX] as any)?.[
    ALL
  ] as any[];
  const transitTax = calculateProgressiveTax(ficaWages, transitBrackets);

  // Oregon Paid Family and Medical Leave (on gross wages)
  const paidLeaveBrackets = (
    oregon2025[OREGON_PAID_FAMILY_AND_MEDICAL_LEAVE] as any
  )?.[ALL] as any[];
  const paidLeaveTax = calculateProgressiveTax(ficaWages, paidLeaveBrackets);

  const totalFederal = add(
    add(federalIncomeTax, socialSecurityTax),
    medicareTax,
  );
  const totalState = add(add(stateIncomeTax, transitTax), paidLeaveTax);
  const totalTaxes = add(totalFederal, totalState);
  const takeHome = subtract(incomeAfterIRA, totalTaxes);

  return {
    federalTaxableIncome,
    stateTaxableIncome,
    federalIncomeTax,
    socialSecurityTax,
    medicareTax,
    totalFederal,
    stateIncomeTax,
    transitTax,
    paidLeaveTax,
    totalState,
    totalTaxes,
    takeHome,
  };
}

describe("Calculator Audit Tests", () => {
  describe("Standard Deduction Application", () => {
    it("should apply federal standard deduction when no custom deduction provided - Single filer", () => {
      const income = 100000;
      const filingStatus = SINGLE;
      const ira = 0;

      const results = calculate(
        federal2025,
        oregon2025,
        income,
        filingStatus,
        ira,
        undefined, // No custom federal deduction
        undefined, // No custom state deduction
        [],
        "oregon",
        "",
      );

      const expected = calculateExpectedTaxes(income, filingStatus, ira);

      // Verify taxable income includes standard deduction
      expect(
        equal(results.federalTaxableIncome, expected.federalTaxableIncome),
      ).toBe(true);
      expect(
        equal(results.stateTaxableIncome, expected.stateTaxableIncome),
      ).toBe(true);

      // Standard deduction for single filer in 2025 (OBBBA)
      const expectedFederalTaxableIncome = asCurrency(100000 - 15750);
      expect(
        equal(results.federalTaxableIncome, expectedFederalTaxableIncome),
      ).toBe(true);
    });

    it("should apply standard deduction - Married filer", () => {
      const income = 200000;
      const filingStatus = MARRIED;
      const ira = 0;

      const results = calculate(
        federal2025,
        oregon2025,
        income,
        filingStatus,
        ira,
        undefined,
        undefined,
        [],
        "oregon",
        "",
      );

      const expected = calculateExpectedTaxes(income, filingStatus, ira);

      // Standard deduction for married filer in 2025 (OBBBA)
      const expectedFederalTaxableIncome = asCurrency(200000 - 31500);
      expect(
        equal(results.federalTaxableIncome, expectedFederalTaxableIncome),
      ).toBe(true);
      expect(
        equal(results.federalTaxableIncome, expected.federalTaxableIncome),
      ).toBe(true);
    });

    it("should apply standard deduction - Head of Household", () => {
      const income = 80000;
      const filingStatus = HEAD_OF_HOUSEHOLD;
      const ira = 0;

      const results = calculate(
        federal2025,
        oregon2025,
        income,
        filingStatus,
        ira,
        undefined,
        undefined,
        [],
        "oregon",
        "",
      );

      const expected = calculateExpectedTaxes(income, filingStatus, ira);

      // Standard deduction for head of household in 2025 (OBBBA)
      const expectedFederalTaxableIncome = asCurrency(80000 - 23625);
      expect(
        equal(results.federalTaxableIncome, expectedFederalTaxableIncome),
      ).toBe(true);
      expect(
        equal(results.federalTaxableIncome, expected.federalTaxableIncome),
      ).toBe(true);
    });

    it("should use custom deductions when provided", () => {
      const income = 50000;
      const filingStatus = SINGLE;
      const ira = 5000;
      const customFederalDeduction = 2000;
      const customStateDeduction = 1000;

      const results = calculate(
        federal2025,
        oregon2025,
        income,
        filingStatus,
        ira,
        customFederalDeduction,
        customStateDeduction,
        [],
        "oregon",
        "",
      );

      const expected = calculateExpectedTaxes(
        income,
        filingStatus,
        ira,
        customFederalDeduction,
        customStateDeduction,
      );

      // Should use custom deductions, not standard. Oregon still subtracts the
      // federal tax on top of a custom deduction: 10% of 11,925 plus 12% of
      // the 31,075 above it is 4,921.50, under the $8,500 cap.
      const expectedFederalTaxableIncome = asCurrency(50000 - 5000 - 2000);
      const expectedStateTaxableIncome = asCurrency(
        50000 - 5000 - 1000 - 4921.5,
      );

      expect(
        equal(results.federalTaxableIncome, expectedFederalTaxableIncome),
      ).toBe(true);
      expect(
        equal(results.stateTaxableIncome, expectedStateTaxableIncome),
      ).toBe(true);
      expect(
        equal(results.federalTaxableIncome, expected.federalTaxableIncome),
      ).toBe(true);
      expect(
        equal(results.stateTaxableIncome, expected.stateTaxableIncome),
      ).toBe(true);
    });
  });

  describe("FICA Tax Base Verification", () => {
    it("should calculate FICA taxes on gross wages, not on taxable income and not after the 401k deferral", () => {
      const income = 50000;
      const filingStatus = SINGLE;
      const ira = 5000;
      const customFederalDeduction = 2000;

      const results = calculate(
        federal2025,
        oregon2025,
        income,
        filingStatus,
        ira,
        customFederalDeduction,
        undefined,
        [],
        "oregon",
        "",
      );

      const expected = calculateExpectedTaxes(
        income,
        filingStatus,
        ira,
        customFederalDeduction,
      );

      // FICA taxes are on the full $50,000 -- not on $45,000 after the 401k
      // deferral, and not on $43,000 after deductions. A pre-tax elective
      // deferral reduces W-2 box 1 only; boxes 3 and 5 are unchanged by it
      // (IRS Topic No. 424).
      const ficaWages = asCurrency(50000);

      // Social Security: 6.2% of $50,000
      const expectedSocialSecurity = percentage(ficaWages, 6.2);
      expect(
        equal(
          results.federalResults.social_security as any,
          expectedSocialSecurity,
        ),
      ).toBe(true);

      // Medicare: 1.45% of $50,000 (below threshold)
      const expectedMedicare = percentage(ficaWages, 1.45);
      expect(
        equal(results.federalResults.medicare as any, expectedMedicare),
      ).toBe(true);

      // Verify against independent calculation
      expect(
        equal(
          results.federalResults.social_security as any,
          expected.socialSecurityTax,
        ),
      ).toBe(true);
      expect(
        equal(results.federalResults.medicare as any, expected.medicareTax),
      ).toBe(true);
    });

    it("should calculate state payroll taxes on gross wages, not taxable income", () => {
      const income = 50000;
      const filingStatus = SINGLE;
      const ira = 5000;
      const customStateDeduction = 1000;

      const results = calculate(
        federal2025,
        oregon2025,
        income,
        filingStatus,
        ira,
        undefined,
        customStateDeduction,
        [],
        "oregon",
        "",
      );

      const expected = calculateExpectedTaxes(
        income,
        filingStatus,
        ira,
        undefined,
        customStateDeduction,
      );

      // Oregon Paid Leave is on gross wages, not on taxable income
      expect(
        equal(
          results.stateResults.oregon_paid_family_and_medical_leave as any,
          expected.paidLeaveTax,
        ),
      ).toBe(true);
      // 1% of wages, 60% of it the employee's share, on the full $50,000
      expect(
        equal(
          results.stateResults.oregon_paid_family_and_medical_leave as any,
          asCurrency(300),
        ),
      ).toBe(true);
    });
  });

  describe("Complete Tax Calculation Verification", () => {
    it("should correctly calculate all taxes - Single filer, $100k, no IRA", () => {
      const income = 100000;
      const filingStatus = SINGLE;
      const ira = 0;

      const results = calculate(
        federal2025,
        oregon2025,
        income,
        filingStatus,
        ira,
        undefined,
        undefined,
        [],
        "oregon",
        "",
      );

      const expected = calculateExpectedTaxes(income, filingStatus, ira);

      // Verify all tax components match
      expect(
        equal(
          results.federalResults.federal_income as any,
          expected.federalIncomeTax,
        ),
      ).toBe(true);
      expect(
        equal(
          results.federalResults.social_security as any,
          expected.socialSecurityTax,
        ),
      ).toBe(true);
      expect(
        equal(results.federalResults.medicare as any, expected.medicareTax),
      ).toBe(true);
      expect(equal(results.totalFederal.amount, expected.totalFederal)).toBe(
        true,
      );

      expect(
        equal(
          results.stateResults.state_income as any,
          expected.stateIncomeTax,
        ),
      ).toBe(true);
      expect(
        equal(
          results.stateResults.oregon_transit_tax as any,
          expected.transitTax,
        ),
      ).toBe(true);
      expect(
        equal(
          results.stateResults.oregon_paid_family_and_medical_leave as any,
          expected.paidLeaveTax,
        ),
      ).toBe(true);
      expect(equal(results.totalState.amount, expected.totalState)).toBe(true);

      expect(equal(results.totalTaxes, expected.totalTaxes)).toBe(true);
      expect(equal(results.takeHome.amount, expected.takeHome)).toBe(true);
    });

    it("should correctly calculate all taxes - Single filer, $100k, $10k IRA", () => {
      const income = 100000;
      const filingStatus = SINGLE;
      const ira = 10000;

      const results = calculate(
        federal2025,
        oregon2025,
        income,
        filingStatus,
        ira,
        undefined,
        undefined,
        [],
        "oregon",
        "",
      );

      const expected = calculateExpectedTaxes(income, filingStatus, ira);

      expect(
        equal(
          results.federalResults.federal_income as any,
          expected.federalIncomeTax,
        ),
      ).toBe(true);
      expect(
        equal(
          results.federalResults.social_security as any,
          expected.socialSecurityTax,
        ),
      ).toBe(true);
      expect(
        equal(results.federalResults.medicare as any, expected.medicareTax),
      ).toBe(true);
      expect(equal(results.totalFederal.amount, expected.totalFederal)).toBe(
        true,
      );
      expect(equal(results.totalState.amount, expected.totalState)).toBe(true);
      expect(equal(results.totalTaxes, expected.totalTaxes)).toBe(true);
      expect(equal(results.takeHome.amount, expected.takeHome)).toBe(true);
    });

    it("should correctly calculate all taxes - Married filer, $200k", () => {
      const income = 200000;
      const filingStatus = MARRIED;
      const ira = 0;

      const results = calculate(
        federal2025,
        oregon2025,
        income,
        filingStatus,
        ira,
        undefined,
        undefined,
        [],
        "oregon",
        "",
      );

      const expected = calculateExpectedTaxes(income, filingStatus, ira);

      expect(
        equal(
          results.federalResults.federal_income as any,
          expected.federalIncomeTax,
        ),
      ).toBe(true);
      expect(
        equal(
          results.federalResults.social_security as any,
          expected.socialSecurityTax,
        ),
      ).toBe(true);
      expect(
        equal(results.federalResults.medicare as any, expected.medicareTax),
      ).toBe(true);
      expect(equal(results.totalFederal.amount, expected.totalFederal)).toBe(
        true,
      );
      expect(equal(results.totalState.amount, expected.totalState)).toBe(true);
      expect(equal(results.totalTaxes, expected.totalTaxes)).toBe(true);
      expect(equal(results.takeHome.amount, expected.takeHome)).toBe(true);
    });

    it("should correctly calculate all taxes - Head of Household, $80k", () => {
      const income = 80000;
      const filingStatus = HEAD_OF_HOUSEHOLD;
      const ira = 0;

      const results = calculate(
        federal2025,
        oregon2025,
        income,
        filingStatus,
        ira,
        undefined,
        undefined,
        [],
        "oregon",
        "",
      );

      const expected = calculateExpectedTaxes(income, filingStatus, ira);

      expect(
        equal(
          results.federalResults.federal_income as any,
          expected.federalIncomeTax,
        ),
      ).toBe(true);
      expect(
        equal(
          results.federalResults.social_security as any,
          expected.socialSecurityTax,
        ),
      ).toBe(true);
      expect(
        equal(results.federalResults.medicare as any, expected.medicareTax),
      ).toBe(true);
      expect(equal(results.totalFederal.amount, expected.totalFederal)).toBe(
        true,
      );
      expect(equal(results.totalState.amount, expected.totalState)).toBe(true);
      expect(equal(results.totalTaxes, expected.totalTaxes)).toBe(true);
      expect(equal(results.takeHome.amount, expected.takeHome)).toBe(true);
    });

    it("should correctly calculate all taxes - High earner, $250k (tests additional Medicare tax)", () => {
      const income = 250000;
      const filingStatus = SINGLE;
      const ira = 0;

      const results = calculate(
        federal2025,
        oregon2025,
        income,
        filingStatus,
        ira,
        undefined,
        undefined,
        [],
        "oregon",
        "",
      );

      const expected = calculateExpectedTaxes(income, filingStatus, ira);

      // This should trigger the additional 0.9% Medicare tax above $200k
      expect(
        equal(results.federalResults.medicare as any, expected.medicareTax),
      ).toBe(true);
      expect(equal(results.totalFederal.amount, expected.totalFederal)).toBe(
        true,
      );
      expect(equal(results.totalState.amount, expected.totalState)).toBe(true);
      expect(equal(results.totalTaxes, expected.totalTaxes)).toBe(true);
      expect(equal(results.takeHome.amount, expected.takeHome)).toBe(true);
    });

    it("should correctly calculate with custom deductions", () => {
      const income = 50000;
      const filingStatus = SINGLE;
      const ira = 5000;
      const federalDeductions = 2000;
      const stateDeductions = 1000;

      const results = calculate(
        federal2025,
        oregon2025,
        income,
        filingStatus,
        ira,
        federalDeductions,
        stateDeductions,
        [],
        "oregon",
        "",
      );

      const expected = calculateExpectedTaxes(
        income,
        filingStatus,
        ira,
        federalDeductions,
        stateDeductions,
      );

      expect(
        equal(
          results.federalResults.federal_income as any,
          expected.federalIncomeTax,
        ),
      ).toBe(true);
      expect(
        equal(
          results.federalResults.social_security as any,
          expected.socialSecurityTax,
        ),
      ).toBe(true);
      expect(
        equal(results.federalResults.medicare as any, expected.medicareTax),
      ).toBe(true);
      expect(equal(results.totalFederal.amount, expected.totalFederal)).toBe(
        true,
      );
      expect(equal(results.totalState.amount, expected.totalState)).toBe(true);
      expect(equal(results.totalTaxes, expected.totalTaxes)).toBe(true);
      expect(equal(results.takeHome.amount, expected.takeHome)).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero income", () => {
      const income = 0;
      const filingStatus = SINGLE;
      const ira = 0;

      const results = calculate(
        federal2025,
        oregon2025,
        income,
        filingStatus,
        ira,
        undefined,
        undefined,
        [],
        "oregon",
        "",
      );

      const expected = calculateExpectedTaxes(income, filingStatus, ira);

      expect(equal(results.totalTaxes, expected.totalTaxes)).toBe(true);
      expect(equal(results.takeHome.amount, expected.takeHome)).toBe(true);
    });

    it("should handle Social Security wage base limit correctly", () => {
      // Income above Social Security wage base ($176,100 in 2025)
      const income = 200000;
      const filingStatus = SINGLE;
      const ira = 0;

      const results = calculate(
        federal2025,
        oregon2025,
        income,
        filingStatus,
        ira,
        undefined,
        undefined,
        [],
        "oregon",
        "",
      );

      const expected = calculateExpectedTaxes(income, filingStatus, ira);

      // Social Security should cap at $176,100 * 6.2%
      const maxSocialSecurity = percentage(asCurrency(176100), 6.2);
      expect(
        equal(results.federalResults.social_security as any, maxSocialSecurity),
      ).toBe(true);
      expect(
        equal(
          results.federalResults.social_security as any,
          expected.socialSecurityTax,
        ),
      ).toBe(true);
    });

    it("should handle IRA contributions reducing taxable income but not FICA base", () => {
      const income = 100000;
      const filingStatus = SINGLE;
      const ira = 23500; // Max 401k contribution for 2025

      const results = calculate(
        federal2025,
        oregon2025,
        income,
        filingStatus,
        ira,
        undefined,
        undefined,
        [],
        "oregon",
        "",
      );

      const expected = calculateExpectedTaxes(income, filingStatus, ira);

      // Federal income tax should be on reduced amount
      const expectedFederalTaxableIncome = asCurrency(100000 - 23500 - 15750);
      expect(
        equal(results.federalTaxableIncome, expectedFederalTaxableIncome),
      ).toBe(true);

      // But FICA stays on the full wage figure: the deferral reduces neither
      // the Social Security nor the Medicare wage base.
      const ficaWages = asCurrency(100000);
      const expectedSocialSecurity = percentage(ficaWages, 6.2);
      const expectedMedicare = percentage(ficaWages, 1.45);

      expect(
        equal(
          results.federalResults.social_security as any,
          expectedSocialSecurity,
        ),
      ).toBe(true);
      expect(
        equal(results.federalResults.medicare as any, expectedMedicare),
      ).toBe(true);

      expect(equal(results.totalTaxes, expected.totalTaxes)).toBe(true);
    });
  });

  describe("Percentages with a zero income base", () => {
    it("returns 0 rather than NaN when there is no income at all", () => {
      const results = calculate(
        federal2025,
        oregon2025,
        0,
        SINGLE,
        0,
        undefined,
        undefined,
        [],
        "oregon",
        "portland",
      );

      expect(Number.isNaN(results.takeHome.percent)).toBe(false);
      expect(results.takeHome.percent).toBe(0);
      expect(results.totalFederal.percent).toBe(0);
      expect(results.totalState.percent).toBe(0);
    });

    it("still charges FICA when the whole salary is deferred", () => {
      // Reachable from the UI: the 401k field has a "set to max" button, and
      // the 2025 cap equals this income. Deferring all of it leaves nothing to
      // take home, but the FICA on the full $23,500 is still owed -- the
      // deferral reduces W-2 box 1, not boxes 3 and 5.
      const results = calculate(
        federal2025,
        oregon2025,
        23500,
        SINGLE,
        23500,
        undefined,
        undefined,
        [],
        "oregon",
        "portland",
      );

      expect(Number.isNaN(results.takeHome.percent)).toBe(false);
      expect(
        equal(results.totalFica.amount, percentage(asCurrency(23500), 7.65)),
      ).toBe(true);
      // Nothing left to pay it from, so take-home goes negative.
      expect(toUnit(results.takeHome.amount)).toBeLessThan(0);
    });

    it("guards getPercent directly", () => {
      expect(getPercent(asCurrency(0), asCurrency(0))).toBe(0);
      expect(getPercent(asCurrency(100), asCurrency(0))).toBe(0);
    });
  });

  describe("Flat fee thresholds", () => {
    // A fee written without a `min` -- Sheridan's, and six of West Virginia's,
    // because those cities publish no threshold -- passed its threshold test
    // at $0 and was charged to someone earning nothing. Compare renders income
    // 0 on first load, where it showed as a negative take-home.
    it("charges nothing at all on no income", () => {
      for (const [state, city, data] of [
        ["colorado", "sheridan", colorado2025],
        ["west_virginia", "charleston", westVirginia2025],
      ] as const) {
        const results = calculate(
          federal2025,
          data as TaxData,
          0,
          SINGLE,
          0,
          undefined,
          undefined,
          [],
          state,
          city,
        );
        expect(toUnit(results.totalCity.amount)).toBe(0);
        expect(toUnit(results.takeHome.amount)).toBe(0);
      }
    });

    it("applies Portland's Arts Tax at exactly $1,000 of gross income", () => {
      // The $1,000 test is against gross income, not income after Oregon's
      // standard deduction, and the rule is "$1,000 or more".
      const below = calculate(
        federal2025,
        oregon2025,
        999,
        SINGLE,
        0,
        undefined,
        undefined,
        [],
        "oregon",
        "portland",
      );
      const atThreshold = calculate(
        federal2025,
        oregon2025,
        1000,
        SINGLE,
        0,
        undefined,
        undefined,
        [],
        "oregon",
        "portland",
      );

      expect(equal(below.totalCity.amount, asCurrency(0))).toBe(true);
      expect(equal(atThreshold.totalCity.amount, asCurrency(35))).toBe(true);
    });

    it("does not let the state standard deduction suppress the Arts Tax", () => {
      // $3,500 gross is above $1,000 even though it is below it after
      // Oregon's $2,835 standard deduction.
      const results = calculate(
        federal2025,
        oregon2025,
        3500,
        SINGLE,
        0,
        undefined,
        undefined,
        [],
        "oregon",
        "portland",
      );
      expect(equal(results.totalCity.amount, asCurrency(35))).toBe(true);
    });

    it("applies Denver's occupational privilege tax at exactly $6,000", () => {
      const below = calculate(
        federal2025,
        colorado2025,
        5999,
        SINGLE,
        0,
        undefined,
        undefined,
        [],
        "colorado",
        "denver",
      );
      const atThreshold = calculate(
        federal2025,
        colorado2025,
        6000,
        SINGLE,
        0,
        undefined,
        undefined,
        [],
        "colorado",
        "denver",
      );

      expect(equal(below.totalCity.amount, asCurrency(0))).toBe(true);
      // $5.75 a month, annualized
      expect(equal(atThreshold.totalCity.amount, asCurrency(69))).toBe(true);
    });

    it("annualizes a weekly flat fee", () => {
      // Charleston charges $3 a week.
      const results = calculate(
        federal2025,
        westVirginia2025,
        50000,
        SINGLE,
        0,
        undefined,
        undefined,
        [],
        "west_virginia",
        "charleston",
      );
      expect(equal(results.totalCity.amount, asCurrency(3 * 52))).toBe(true);
    });
  });

  describe("Portland Arts Tax, tax year 2026", () => {
    // Ordinance 192185: $50 single / $100 filing jointly, on Oregon taxable
    // income above $20,000 / $40,000.
    it("charges $50 to a single filer above the taxable income threshold", () => {
      const results = calculate(
        federal2026,
        oregon2026,
        40000,
        SINGLE,
        0,
        undefined,
        undefined,
        [],
        "oregon",
        "portland",
      );
      expect(equal(results.totalCity.amount, asCurrency(50))).toBe(true);
    });

    it("charges $100 to joint filers above their higher threshold", () => {
      const results = calculate(
        federal2026,
        oregon2026,
        80000,
        MARRIED,
        0,
        undefined,
        undefined,
        [],
        "oregon",
        "portland",
      );
      expect(equal(results.totalCity.amount, asCurrency(100))).toBe(true);
    });

    it("charges nothing below the threshold", () => {
      const results = calculate(
        federal2026,
        oregon2026,
        15000,
        SINGLE,
        0,
        undefined,
        undefined,
        [],
        "oregon",
        "portland",
      );
      expect(equal(results.totalCity.amount, asCurrency(0))).toBe(true);
    });
  });

  describe("asCurrency", () => {
    it("rounds to whole cents instead of throwing", () => {
      expect(() => asCurrency(1000.005)).not.toThrow();
      expect(toCents(asCurrency(2.5))).toBe(250);
      expect(toCents(asCurrency(5.75))).toBe(575);
    });
  });

  describe("Wage-based taxes ignore the state standard deduction", () => {
    it("charges Birmingham's occupational tax on gross wages", () => {
      // Alabama municipal occupational taxes are withheld from gross wages, so
      // Alabama's standard deduction must not shrink the base.
      const income = 100000;
      const results = calculate(
        federal2025,
        alabama2025,
        income,
        SINGLE,
        0,
        undefined,
        undefined,
        [],
        "alabama",
        "birmingham",
      );

      // 1% of the full $100,000, not of income after the state deduction
      expect(equal(results.totalCity.amount, asCurrency(1000))).toBe(true);
    });

    it("does not let a 401k contribution shrink its base either", () => {
      // Gross wages, the same base FICA uses: the occupational tax is withheld
      // from gross salaries and wages, and a pre-tax deferral does not reduce
      // them. Still 1% of the full $100,000, not $900 on $90,000.
      const results = calculate(
        federal2025,
        alabama2025,
        100000,
        SINGLE,
        10000,
        undefined,
        undefined,
        [],
        "alabama",
        "birmingham",
      );
      expect(equal(results.totalCity.amount, asCurrency(1000))).toBe(true);
    });

    it("charges Oregon's transit tax on gross wages", () => {
      // 0.1% of $100,000, not of income after Oregon's standard deduction
      const results = calculate(
        federal2025,
        oregon2025,
        100000,
        SINGLE,
        0,
        undefined,
        undefined,
        [],
        "oregon",
        "",
      );
      expect(
        equal(results.stateResults.oregon_transit_tax as any, asCurrency(100)),
      ).toBe(true);
    });
  });
  describe("Eugene's payroll tax is a rate lookup, not a marginal schedule", () => {
    // The City's rate chart says its purpose is "to obtain the rate to be
    // applied to all subject wages paid in a pay period". Charging it
    // marginally understated it at every income above the exempt threshold.
    const eugene = (
      stateData: typeof oregon2026,
      income: number,
      totalIRA = 0,
    ) =>
      calculate(
        federal2026,
        stateData,
        income,
        SINGLE,
        totalIRA,
        undefined,
        undefined,
        [],
        "oregon",
        "eugene",
      ).totalCity.amount;

    it("charges 0.44% of all wages once the threshold is cleared", () => {
      // $440, not the $302.26 a marginal reading of { min: 32344 } produces
      expect(equal(eugene(oregon2026, 100000), asCurrency(440))).toBe(true);
    });

    it("charges nothing below the exempt threshold", () => {
      expect(equal(eugene(oregon2026, 32343), asCurrency(0))).toBe(true);
    });

    it("charges the full rate at exactly the threshold", () => {
      // The chart reads "equal to or more than $32,344", so the band is
      // inclusive at its floor.
      expect(equal(eugene(oregon2026, 32344), asCurrency(32344 * 0.0044))).toBe(
        true,
      );
    });

    it("uses the reduced 0.30% band in years that still had one", () => {
      // 2023 chart: at least $29,557 but less than $31,221 pays 0.30% on all
      // wages. $30,000 x 0.003 = $90.
      expect(
        equal(
          calculate(
            federal2025,
            oregon2023,
            30000,
            SINGLE,
            0,
            undefined,
            undefined,
            [],
            "oregon",
            "eugene",
          ).totalCity.amount,
          asCurrency(90),
        ),
      ).toBe(true);
    });

    it("looks the rate up against gross wages, not against wages after a 401k contribution", () => {
      // The rate is picked off the same gross-wage figure the tax is charged
      // on, so a deferral cannot drop the employee below the exempt threshold:
      // $40,000 stays above $32,344 and pays 0.44% of $40,000.
      expect(equal(eugene(oregon2026, 40000, 8000), asCurrency(176))).toBe(
        true,
      );
    });
  });

  describe("A 401k deferral does not reduce the FICA wage base", () => {
    // A pre-tax elective deferral reduces W-2 box 1 only. Boxes 3 and 5 -- the
    // Social Security and Medicare wage figures -- are untouched by it: the IRS
    // states outright that elective deferrals "are included as wages subject to
    // Social Security (FICA), Medicare, and federal unemployment taxes" (Topic
    // No. 424). A deductible traditional IRA contribution is the same thing:
    // a deduction on the 1040, taken out of wages already taxed for FICA.
    //
    // Charging FICA on income after the deferral understated it by the full
    // 7.65% of the contribution at every income below the Social Security wage
    // base, and by 1.45% (or 2.35%) above it.
    const ficaOn = (income: number, ira: number) =>
      toUnit(
        calculate(
          federal2025,
          texas2025,
          income,
          SINGLE,
          ira,
          undefined,
          undefined,
          [],
          "texas",
          "",
        ).totalFica.amount,
      );

    it.each([
      { income: 80_000, ira: 10_000, owed: 6_120.0 },
      { income: 100_000, ira: 23_500, owed: 7_650.0 },
      { income: 200_000, ira: 23_500, owed: 13_818.2 },
      { income: 500_000, ira: 23_500, owed: 20_868.2 },
    ])(
      "charges $$owed of FICA on $$income with a $$ira contribution",
      ({ income, ira, owed }) => {
        expect(ficaOn(income, ira)).toBe(owed);
      },
    );

    it("charges the same FICA with and without a contribution", () => {
      expect(ficaOn(100_000, 23_500)).toBe(ficaOn(100_000, 0));
    });

    it("still takes the deferral off taxable income", () => {
      const results = calculate(
        federal2025,
        texas2025,
        100_000,
        SINGLE,
        23_500,
        undefined,
        undefined,
        [],
        "texas",
        "",
      );
      expect(
        equal(
          results.federalTaxableIncome,
          asCurrency(100_000 - 23_500 - 15_750),
        ),
      ).toBe(true);
    });
  });

  describe("A city's own standard deduction", () => {
    // The city branch is handed the state's already-resolved deduction, so
    // without this a city could declare a `standard_deduction` and never see
    // it used. No city in the data declares one today; this pins both branches.
    const deductionMap = (amount: number) => ({
      [SINGLE]: amount,
      [MARRIED]: amount,
      married_separately: amount,
      [HEAD_OF_HOUSEHOLD]: amount,
    });

    const stateWithCity = (cityDeduction?: number) =>
      ({
        [STANDARD_DEDUCTION]: deductionMap(10_000),
        [CITIES]: {
          [BIRMINGHAM]: {
            ...(cityDeduction === undefined
              ? {}
              : { [STANDARD_DEDUCTION]: deductionMap(cityDeduction) }),
            [CITY_INCOME]: { [ALL]: [{ min: 0, max: INFINITY, rate: 1 }] },
          },
        },
      }) as unknown as TaxData;

    const cityTaxOn = (state: TaxData) =>
      toUnit(
        calculate(
          {} as TaxData,
          state,
          100_000,
          SINGLE,
          0,
          undefined,
          undefined,
          [],
          "alabama",
          BIRMINGHAM,
        ).totalCity.amount,
      );

    it("inherits the state's deduction when the city declares none", () => {
      // 1% of $100,000 less the state's $10,000
      expect(cityTaxOn(stateWithCity())).toBe(900);
    });

    it("uses the city's own deduction when it declares one", () => {
      // 1% of $100,000 less the city's $40,000, not the state's $10,000
      expect(cityTaxOn(stateWithCity(40_000))).toBe(600);
    });
  });

  describe("Exempting a city tax does not exempt a state tax of the same key", () => {
    // `occupational_tax` and `city_income` are generic enough that a state and
    // one of its cities could both use one. Exemptions are matched by bare tax
    // type, so without a scope on the option the two would exempt together.
    const state = {
      [OCCUPATIONAL_TAX]: { [ALL]: [{ min: 0, max: INFINITY, rate: 1 }] },
      [CITIES]: {
        [BIRMINGHAM]: {
          [OCCUPATIONAL_TAX]: { [ALL]: [{ min: 0, max: INFINITY, rate: 2 }] },
        },
      },
    } as unknown as TaxData;

    const option = (scope: TaxOption["scope"]): TaxOption => ({
      title: OCCUPATIONAL_TAX,
      value: OCCUPATIONAL_TAX,
      scope,
      disabled: false,
    });

    const totals = (exempt: TaxOption[]) => {
      const results = calculate(
        {} as TaxData,
        state,
        100_000,
        SINGLE,
        0,
        undefined,
        undefined,
        exempt,
        "alabama",
        BIRMINGHAM,
      );
      return {
        state:
          toUnit(results.totalState.amount) - toUnit(results.totalCity.amount),
        city: toUnit(results.totalCity.amount),
      };
    };

    it("charges both when neither is exempt", () => {
      expect(totals([])).toEqual({ state: 1_000, city: 2_000 });
    });

    it("drops only the city tax when the city option is exempt", () => {
      expect(totals([option(CITY_SCOPE)])).toEqual({ state: 1_000, city: 0 });
    });

    it("drops only the state tax when the state option is exempt", () => {
      expect(totals([option(STATE_SCOPE)])).toEqual({ state: 0, city: 2_000 });
    });
  });

  describe("Flat fee tiers are picked by threshold, not by array order", () => {
    // Every flat-fee schedule in the data has a single tier today, so nothing
    // depends on this yet -- but the loop used to keep whichever qualifying
    // tier came last, which is only right for an ascending list.
    const withTiers = (tiers: object[]) =>
      ({
        [CITIES]: {
          [BIRMINGHAM]: { [ART_TAX]: { [ALL]: tiers } },
        },
      }) as unknown as TaxData;

    const feeOn = (state: TaxData, income: number) =>
      toUnit(
        calculate(
          {} as TaxData,
          state,
          income,
          SINGLE,
          0,
          undefined,
          undefined,
          [],
          "alabama",
          BIRMINGHAM,
        ).totalCity.amount,
      );

    const ascending = withTiers([
      { min: 1_000, amount: 35 },
      { min: 50_000, amount: 100 },
    ]);
    const descending = withTiers([
      { min: 50_000, amount: 100 },
      { min: 1_000, amount: 35 },
    ]);

    it("charges the highest qualifying tier however the tiers are ordered", () => {
      expect(feeOn(ascending, 60_000)).toBe(100);
      expect(feeOn(descending, 60_000)).toBe(100);
    });

    it("falls back to the lower tier below the higher threshold", () => {
      expect(feeOn(ascending, 10_000)).toBe(35);
      expect(feeOn(descending, 10_000)).toBe(35);
    });

    it("charges nothing below every threshold", () => {
      expect(feeOn(ascending, 999)).toBe(0);
      expect(feeOn(descending, 999)).toBe(0);
    });

    it("measures a taxable-basis threshold after deductions", () => {
      // The one schedule that opts out of the gross-wage default.
      const state = {
        [STANDARD_DEDUCTION]: {
          [SINGLE]: 20_000,
          [MARRIED]: 20_000,
          married_separately: 20_000,
          [HEAD_OF_HOUSEHOLD]: 20_000,
        },
        [CITIES]: {
          [BIRMINGHAM]: {
            [ART_TAX]: {
              [ALL]: [{ min: 50_000, amount: 50, basis: TAXABLE_INCOME_BASIS }],
            },
          },
        },
      } as unknown as TaxData;

      expect(feeOn(state, 60_000)).toBe(0);
      expect(feeOn(state, 70_000)).toBe(50);
    });
  });

  describe("Personal exemptions", () => {
    // Three states subtract a personal exemption rather than a standard
    // deduction. It does the same job -- taken off income before the rate --
    // so it lives in the same slot. All three are modelled for a filer with no
    // dependants, which is all the calculator knows about.
    const stateTaxableOn = (
      data: TaxData,
      income: number,
      filingStatus: FilingStatus = SINGLE,
    ) =>
      toUnit(
        calculate(
          federal2025,
          data,
          income,
          filingStatus,
          0,
          undefined,
          undefined,
          [],
          "x",
          "",
        ).stateTaxableIncome,
      );

    describe("Illinois, which disallows it above a threshold", () => {
      it("subtracts the allowance before the flat rate", () => {
        expect(stateTaxableOn(illinois2025 as TaxData, 50_000)).toBe(
          50_000 - 2_850,
        );
      });

      it("gives a joint return two allowances", () => {
        expect(stateTaxableOn(illinois2025 as TaxData, 50_000, MARRIED)).toBe(
          50_000 - 5_700,
        );
      });

      it("groups married-filing-separately with single, as the chart does", () => {
        // "*Single filing status includes Single, Head of Household, Widowed,
        // and Married filing separately."
        expect(
          stateTaxableOn(illinois2025 as TaxData, 50_000, MARRIED_SEPARATELY),
        ).toBe(50_000 - 2_850);
        expect(
          stateTaxableOn(illinois2025 as TaxData, 50_000, HEAD_OF_HOUSEHOLD),
        ).toBe(50_000 - 2_850);
      });

      it("is a cliff, not a taper", () => {
        // "you are not entitled to an exemption allowance on Line 10. Enter
        // 'zero' on Line 10." Still allowed at exactly $250,000.
        expect(stateTaxableOn(illinois2025 as TaxData, 250_000)).toBe(
          250_000 - 2_850,
        );
        expect(stateTaxableOn(illinois2025 as TaxData, 250_001)).toBe(250_001);
      });

      it("gives joint filers the higher threshold", () => {
        expect(stateTaxableOn(illinois2025 as TaxData, 500_000, MARRIED)).toBe(
          500_000 - 5_700,
        );
        expect(stateTaxableOn(illinois2025 as TaxData, 500_001, MARRIED)).toBe(
          500_001,
        );
      });
    });

    describe("New Jersey, which does not phase it out at all", () => {
      it("subtracts $1,000, or $2,000 on a joint return", () => {
        expect(stateTaxableOn(newJersey2025 as TaxData, 60_000)).toBe(59_000);
        expect(stateTaxableOn(newJersey2025 as TaxData, 60_000, MARRIED)).toBe(
          58_000,
        );
      });

      it("still allows it at an income that would end Illinois'", () => {
        expect(stateTaxableOn(newJersey2025 as TaxData, 400_000)).toBe(399_000);
      });
    });

    describe("Ohio, which tiers it by modified AGI", () => {
      const ohioTaxable = (income: number, status: FilingStatus = SINGLE) =>
        stateTaxableOn(ohio2025 as TaxData, income, status);

      it("steps down at each published tier boundary", () => {
        // $40,000 or less: $2,400. $40,001-$80,000: $2,150. Above: $1,900.
        expect(ohioTaxable(40_000)).toBe(40_000 - 2_400);
        expect(ohioTaxable(40_001)).toBe(40_001 - 2_150);
        expect(ohioTaxable(80_000)).toBe(80_000 - 2_150);
        expect(ohioTaxable(80_001)).toBe(80_001 - 1_900);
      });

      it("allows nothing at all above the statutory cap", () => {
        // ORC 5747.025(A), from tax year 2025: $750,000 or greater, $0.
        expect(ohioTaxable(749_999)).toBe(749_999 - 1_900);
        expect(ohioTaxable(750_000)).toBe(750_000);
      });

      it("gives a joint return two exemptions at the same tiers", () => {
        expect(ohioTaxable(40_000, MARRIED)).toBe(40_000 - 4_800);
        expect(ohioTaxable(80_001, MARRIED)).toBe(80_001 - 3_800);
      });

      it("drops the cap to $500,000 for 2026, per the statute", () => {
        expect(stateTaxableOn(ohio2026 as TaxData, 499_999)).toBe(
          499_999 - 1_900,
        );
        expect(stateTaxableOn(ohio2026 as TaxData, 500_000)).toBe(500_000);
      });

      // The interaction with the base amount: Ohio's $26,050 threshold is
      // measured against income *after* the exemption, so taking it moves who
      // sits above the cliff.
      it("can drop a filer under the base-amount threshold entirely", () => {
        const tax = (income: number) =>
          toUnit(
            calculate(
              federal2025,
              ohio2025 as TaxData,
              income,
              SINGLE,
              0,
              undefined,
              undefined,
              [],
              "ohio",
              "",
            ).stateResults.state_income as Money,
          );
        // $28,000 of wages is $25,600 after the exemption, under $26,050.
        expect(ohioTaxable(28_000)).toBe(25_600);
        expect(tax(28_000)).toBe(0);
        // Just above, the base is charged on the reduced figure.
        expect(tax(30_000)).toBe(384.62);
      });
    });
  });

  describe("Ohio's base amount is a step, not a marginal rate", () => {
    // ORC 5747.02(A)(3) does not tax the first $26,050 marginally. It charges
    // a flat base the instant taxable nonbusiness income clears the threshold,
    // plus a rate on the excess -- "$342.00 plus 2.750% of the amount in
    // excess of $26,050". Read marginally the base vanished, undercharging
    // every Ohio filer above the threshold and worst proportionally at the
    // bottom.
    // Ohio's schedule is defined on taxable nonbusiness income, and the
    // published figures below are quoted against that. The state deduction is
    // passed explicitly as 0 so these exercise the base amount alone; the
    // personal exemption that really sits between wages and taxable income is
    // covered under "Personal exemptions" above, including the case where it
    // drops a filer under the threshold.
    const ohioTax = (
      data: TaxData,
      taxableIncome: number,
      ira = 0,
      stateDeduction: number | undefined = 0,
    ) =>
      toUnit(
        calculate(
          federal2025,
          data,
          taxableIncome,
          SINGLE,
          ira,
          undefined,
          stateDeduction,
          [],
          "ohio",
          "",
        ).stateResults.state_income as Money,
      );

    it("charges nothing at the threshold and the full base one dollar above", () => {
      // The IT 1040 booklet states it outright: zero at $26,050.
      expect(ohioTax(ohio2025 as TaxData, 26_050)).toBe(0);
      expect(ohioTax(ohio2025 as TaxData, 26_051)).toBe(342.03);
    });

    it("matches the booklet's own worked example", () => {
      // "For taxable nonbusiness income of $68,050 he owes $342 on the first
      // $26,050 of income" -- $342 + 2.75% of $42,000 = $1,497.00 exactly.
      expect(ohioTax(ohio2025 as TaxData, 68_050)).toBe(1_497);
    });

    it("is worst proportionally at the bottom of the range", () => {
      // The defect this fixes: a filer at $30,000 owes $450.62 and was
      // charged the $108.63 a marginal reading produces.
      expect(ohioTax(ohio2025 as TaxData, 30_000)).toBe(450.62);
      // The rate alone accounts for $108.63 of that, so the base is four
      // fifths of the bill at this income.
      const rateOnly = (30_000 - 26_050) * 0.0275;
      expect(rateOnly).toBeCloseTo(108.63, 2);
      expect(ohioTax(ohio2025 as TaxData, 30_000)).toBeCloseTo(
        342 + rateOnly,
        1,
      );
    });

    it("carries each year's own base", () => {
      // 2023 and 2024 share $360.69; HB 96 cut it to $342.00 then $332.00.
      expect(ohioTax(ohio2023 as TaxData, 26_051)).toBe(360.72);
      expect(ohioTax(ohio2024 as TaxData, 26_051)).toBe(360.72);
      expect(ohioTax(ohio2025 as TaxData, 26_051)).toBe(342.03);
      expect(ohioTax(ohio2026 as TaxData, 26_051)).toBe(332.03);
    });

    it("keeps 2025's second step at $100,000, which is the enacted text", () => {
      // $342.00 + 2.75% x $73,950 is $2,375.63, but the statute keeps the
      // older $2,394.32 base above $100,000 -- a further $18.69 step that
      // looks like a drafting artifact and is the law.
      const below = ohioTax(ohio2025 as TaxData, 100_000);
      const above = ohioTax(ohio2025 as TaxData, 100_001);
      expect(below).toBe(2_375.62);
      // The rate on the extra dollar is three cents; the rest is the step.
      expect(above - below).toBeCloseTo(18.69, 1);
    });

    it("has no second step in the years whose bases are continuous", () => {
      // 2023: $360.69 + 2.75% x $73,950 = the $2,394.32 stated at $100,000,
      // and $2,394.32 + 3.688% x $15,300 = the $2,958.58 stated at $115,300.
      // So those boundaries are ordinary rate changes, not cliffs.
      expect(ohioTax(ohio2023 as TaxData, 115_300)).toBe(2_958.58);
      const step = (income: number) =>
        ohioTax(ohio2023 as TaxData, income + 1) -
        ohioTax(ohio2023 as TaxData, income);
      expect(step(100_000)).toBeLessThan(0.1);
      expect(step(115_300)).toBeLessThan(0.1);
      // Against the one boundary that is a cliff.
      expect(step(26_050)).toBeGreaterThan(360);
    });

    it("measures the threshold against taxable income, not gross wages", () => {
      // Ohio's threshold is Ohio taxable nonbusiness income, after
      // exemptions -- which is why the schedule declares
      // basis: TAXABLE_INCOME_BASIS rather than taking the gross default the
      // occupational taxes rely on. A deferral drops this filer under it.
      expect(ohioTax(ohio2025 as TaxData, 30_000)).toBe(450.62);
      expect(ohioTax(ohio2025 as TaxData, 30_000, 5_000)).toBe(0);
      // The state's own exemption does the same thing, and is covered under
      // "Personal exemptions" above -- it cannot be exercised through this
      // helper, whose `stateDeduction` default swallows an explicit undefined.
    });

    it("shows up as a rate change rather than a silent jump", () => {
      // getMarginalRate differentiates the real calculation, so the step
      // reads as a large averaged rate with the "spans a rate change" flag --
      // the same treatment Portland's art tax and Eugene's payroll tax get.
      const taxAt = (income: number) =>
        toUnit(
          calculate(
            federal2025,
            ohio2025 as TaxData,
            income,
            SINGLE,
            0,
            undefined,
            0,
            [],
            "ohio",
            "",
          ).totalTaxes,
        );
      const atCliff = getMarginalRate(taxAt, 26_000);
      expect(atCliff.spansRateChange).toBe(true);
      expect(atCliff.percent).toBeGreaterThan(100);

      // Well clear of it, the rate is ordinary again.
      const wellAbove = getMarginalRate(taxAt, 60_000);
      expect(wellAbove.spansRateChange).toBe(false);
      expect(wellAbove.percent).toBeLessThan(50);
    });
  });

  // Three cities, three different bases, in one place. This trio exists
  // because the same class of bug has now hit three times: a city tax charged
  // on state taxable income when its statute says gross wages.
  describe("City taxes levied on wages rather than state taxable income", () => {
    it("charges the Kansas City earnings tax on gross wages", () => {
      // RSMo 92.111(2)(1) levies it on "salaries, wages, commissions and other
      // compensation". Missouri's standard deduction tracks the federal one, so
      // charging it on taxable income understated this by $161 at any income.
      const results = calculate(
        federal2026,
        missouri2026,
        100000,
        SINGLE,
        0,
        undefined,
        undefined,
        [],
        "missouri",
        "kansas_city",
      );
      expect(equal(results.totalCity.amount, asCurrency(1000))).toBe(true);
    });

    it("charges the Wilmington wage tax on gross wages", () => {
      // 22 Del. C. 903 defines the base as "the total income from whatever
      // source earned by any resident of such city". Delaware's $3,250
      // standard deduction is a Title 30 personal-income-tax figure and does
      // not reach this tax, so 1.25% is charged on the full $100,000.
      const results = calculate(
        federal2025,
        delaware2025,
        100_000,
        SINGLE,
        0,
        undefined,
        undefined,
        [],
        "delaware",
        "wilmington",
      );
      expect(equal(results.totalCity.amount, asCurrency(1250))).toBe(true);
    });

    it("does not let Delaware's standard deduction shrink Wilmington's base", () => {
      // The defect this pins: charging it on income after the deduction cost
      // $40.63 a year single, $81.25 married. Delaware is the only state in
      // its group that carries a standard deduction at all, which is why the
      // bug surfaced here and not in Michigan or New Jersey -- those two are
      // accidentally correct, not deliberately so.
      const withDeduction = calculate(
        federal2025,
        delaware2025,
        100_000,
        SINGLE,
        0,
        undefined,
        undefined,
        [],
        "delaware",
        "wilmington",
      );
      const deduction = (delaware2025[STANDARD_DEDUCTION] as any)[SINGLE];
      expect(
        equal(
          withDeduction.totalCity.amount,
          asCurrency((100_000 - deduction) * 0.0125),
        ),
      ).toBe(false);

      // And a custom deduction must not move it either.
      const customDeduction = calculate(
        federal2025,
        delaware2025,
        100_000,
        SINGLE,
        0,
        undefined,
        40_000,
        [],
        "delaware",
        "wilmington",
      );
      expect(
        equal(customDeduction.totalCity.amount, withDeduction.totalCity.amount),
      ).toBe(true);
    });

    it("charges Ohio's municipal taxes on qualifying wages", () => {
      // ORC 718.01(R): "wages, as defined in section 3121(a) of the Internal
      // Revenue Code, without regard to any wage limitations" -- W-2 box 5.
      // Ohio's personal exemption is a state figure under ORC 5747.025 and
      // does not reach a municipal tax, so Columbus charges 2.5% of the full
      // $100,000 rather than of the $98,100 the state taxes.
      const results = calculate(
        federal2025,
        ohio2025 as TaxData,
        100_000,
        SINGLE,
        0,
        undefined,
        undefined,
        [],
        "ohio",
        "columbus",
      );
      expect(equal(results.totalCity.amount, asCurrency(2500))).toBe(true);
    });

    it("does not let a 401k deferral shrink an Ohio city's base either", () => {
      // Box 5 is not reduced by an elective deferral, so neither is this.
      // Charging it on income after the deferral undercharged a Columbus
      // resident contributing the 2025 maximum by $587.50 a year.
      const deferred = calculate(
        federal2025,
        ohio2025 as TaxData,
        100_000,
        SINGLE,
        23_500,
        undefined,
        undefined,
        [],
        "ohio",
        "columbus",
      );
      expect(equal(deferred.totalCity.amount, asCurrency(2500))).toBe(true);
    });

    describe("Yonkers, which is charged on the state's tax rather than income", () => {
      // The third base, and the reason `city_income` needs a per-schedule
      // one: Kansas City and Wilmington are on gross wages, Ohio's cities on
      // qualifying wages, and Yonkers on neither -- IT-201 line 55 is a
      // 16.75% surcharge on the New York State tax itself.
      const yonkers = (income: number, ira = 0) =>
        calculate(
          federal2025,
          newYork2025 as TaxData,
          income,
          SINGLE,
          ira,
          undefined,
          undefined,
          [],
          "new_york",
          "yonkers",
        );

      it("charges 16.75% of the state income tax, at every income", () => {
        for (const income of [50_000, 100_000, 200_000]) {
          const results = yonkers(income);
          const stateTax = results.stateResults.state_income as Money;
          expect(
            equal(
              (results.stateResults.cities as TaxResults).city_income as Money,
              percentage(stateTax, 16.75),
            ),
          ).toBe(true);
        }
      });

      it("tracks the state tax rather than the income", () => {
        // The point of deriving it: whatever moves New York's tax moves this,
        // with no second copy of the state's brackets to go stale. A 401k
        // deferral cuts the state tax, so it cuts the surcharge too.
        const plain = yonkers(100_000);
        const deferred = yonkers(100_000, 23_500);
        const ratio = (r: ReturnType<typeof yonkers>) =>
          toUnit((r.stateResults.cities as TaxResults).city_income as Money) /
          toUnit(r.stateResults.state_income as Money);
        expect(ratio(plain)).toBeCloseTo(0.1675, 5);
        expect(ratio(deferred)).toBeCloseTo(0.1675, 5);
        expect(
          toUnit(
            (deferred.stateResults.cities as TaxResults).city_income as Money,
          ),
        ).toBeLessThan(
          toUnit(
            (plain.stateResults.cities as TaxResults).city_income as Money,
          ),
        );
      });

      it("is far more than the non-resident rate it replaced", () => {
        // The old model charged 0.5% of income after New York's standard
        // deduction, which understated a resident by about 45%.
        const results = yonkers(100_000);
        const charged = toUnit(
          (results.stateResults.cities as TaxResults).city_income as Money,
        );
        const oldModel = (100_000 - 8_000) * 0.005;
        expect(charged).toBeCloseTo(829.42, 2);
        expect(oldModel).toBeCloseTo(460, 2);
        expect((charged - oldModel) / charged).toBeGreaterThan(0.4);
      });

      it("charges nothing when the state tax it is levied on is exempt", () => {
        // `taxesPerBracket` holds either money or the EXEMPT sentinel, which
        // is a string. Passing it to a Dinero operation threw
        // "dineroObject.toJSON is not a function" -- and `calculate` runs in a
        // render-time useMemo, so it took the whole results section down.
        //
        // Zero is the right answer as well as a safe one: nothing is owed on
        // 16.75% of a tax the filer does not pay.
        const exemptStateIncome: TaxOption[] = [
          {
            title: "New York State Income",
            value: STATE_INCOME,
            scope: STATE_SCOPE,
            disabled: false,
          },
        ];
        const results = calculate(
          federal2025,
          newYork2025 as TaxData,
          100_000,
          SINGLE,
          0,
          undefined,
          undefined,
          exemptStateIncome,
          "new_york",
          "yonkers",
        );
        expect(results.stateResults.state_income).toBe(EXEMPT);
        expect(toUnit(results.totalCity.amount)).toBe(0);
        expect(Number.isFinite(toUnit(results.totalTaxes))).toBe(true);
      });

      it("is not drawn as an income ladder", () => {
        // It has one band covering every income; there is nothing to slice.
        const keys = collectBracketSchedules({
          federalTaxes: federal2025 as TaxData,
          stateTaxes: newYork2025 as TaxData,
          USAState: "new_york",
          USACity: "yonkers",
          filingStatus: SINGLE,
          grossIncome: 100_000,
          federalTaxableIncome: 84_250,
          stateTaxableIncome: 92_000,
        }).map((schedule) => schedule.key);
        expect(keys).not.toContain("city:city_income");
        expect(keys).toContain("state:state_income");
      });
    });
  });

  describe("Oregon's federal tax liability subtraction", () => {
    const oregon = (
      income: number,
      filingStatus: FilingStatus = SINGLE,
      ira = 0,
      exemptTaxes: TaxOption[] = [],
    ) =>
      calculate(
        federal2025,
        oregon2025,
        income,
        filingStatus,
        ira,
        undefined,
        undefined,
        exemptTaxes,
        "oregon",
        "",
      );
    const federalIncomeTaxOf = (results: ReturnType<typeof calculate>) =>
      toUnit(results.federalResults[FEDERAL_INCOME] as Money);

    it("subtracts all of a federal tax smaller than the cap", () => {
      const results = oregon(40000);
      expect(federalIncomeTaxOf(results)).toBeLessThan(8500);
      expect(results.stateFederalTaxSubtraction).toBe(
        federalIncomeTaxOf(results),
      );
      expect(toUnit(results.stateTaxableIncome)).toBe(
        40000 - 2835 - federalIncomeTaxOf(results),
      );
    });

    it("caps it at $8,500 for a single filer in 2025", () => {
      expect(oregon(100000).stateFederalTaxSubtraction).toBe(8500);
    });

    // Table 4 rows are "at least / but less than", so each threshold belongs
    // to the band above it.
    it.each([
      [124999, 8500],
      [125000, 6800],
      [132000, 5100],
      [139999, 3400],
      [144999, 1700],
      [145000, 0],
    ])("phases out by AGI: single at %i allows %i", (income, cap) => {
      expect(oregon(income).stateFederalTaxSubtraction).toBe(cap);
    });

    it("measures the phase-out after the 401(k) contribution", () => {
      // AGI is 120,000, below the first step.
      expect(oregon(130000, SINGLE, 10000).stateFederalTaxSubtraction).toBe(
        8500,
      );
    });

    it("halves the cap for married filing separately", () => {
      expect(
        oregon(100000, MARRIED_SEPARATELY).stateFederalTaxSubtraction,
      ).toBe(4250);
      expect(
        oregon(126000, MARRIED_SEPARATELY).stateFederalTaxSubtraction,
      ).toBe(3400);
    });

    it("phases out joint and head-of-household filers from $250,000", () => {
      expect(oregon(249999, MARRIED).stateFederalTaxSubtraction).toBe(8500);
      expect(oregon(255000, MARRIED).stateFederalTaxSubtraction).toBe(6800);
      expect(oregon(285000, HEAD_OF_HOUSEHOLD).stateFederalTaxSubtraction).toBe(
        1700,
      );
    });

    it("subtracts nothing when the filer is exempt from federal income tax", () => {
      const results = oregon(100000, SINGLE, 0, [
        {
          title: "",
          value: FEDERAL_INCOME,
          scope: FEDERAL_SCOPE,
          disabled: false,
        },
      ]);
      expect(results.stateFederalTaxSubtraction).toBe(0);
    });

    // Metro's housing tax and Multnomah County's preschool tax start from
    // Oregon taxable income, which is after the subtraction. At $135,000 in
    // 2026 the cap has stepped down to $3,500, so Oregon taxable income is
    // 135,000 - 2,910 - 3,500 = 128,590.
    it("carries through to Portland's taxes on Oregon taxable income", () => {
      const results = calculate(
        federal2026,
        oregon2026,
        135000,
        SINGLE,
        0,
        undefined,
        undefined,
        [],
        "oregon",
        PORTLAND,
      );
      const local = results.stateResults[CITIES] as TaxResults;
      expect(results.stateFederalTaxSubtraction).toBe(3500);
      expect(toUnit(results.stateTaxableIncome)).toBe(128590);
      // 1% of the 590 over Metro's $128,000 threshold.
      expect(toUnit(local[SUPPORTIVE_HOUSING_SERVICES] as Money)).toBe(5.9);
      // 1.5% of the 3,590 over the county's $125,000 threshold.
      expect(toUnit(local[PRESCHOOL_FOR_ALL] as Money)).toBe(53.85);
    });

    it("does not apply in states without one", () => {
      const results = calculate(
        federal2025,
        newYork2025,
        100000,
        SINGLE,
        0,
        undefined,
        undefined,
        [],
        "new_york",
        "",
      );
      expect(results.stateFederalTaxSubtraction).toBe(0);
    });
  });

  describe("Oregon's exemption credit", () => {
    const withoutCredit = {
      ...oregon2025,
      [PERSONAL_EXEMPTION_CREDIT]: undefined,
    } as TaxData;
    const run = (
      data: TaxData,
      income: number,
      filingStatus: FilingStatus = SINGLE,
      ira = 0,
      exemptTaxes: TaxOption[] = [],
      city = "",
    ) =>
      calculate(
        federal2025,
        data,
        income,
        filingStatus,
        ira,
        undefined,
        undefined,
        exemptTaxes,
        "oregon",
        city,
      );
    const stateIncomeTaxOf = (results: ReturnType<typeof calculate>) =>
      toUnit(results.stateResults[STATE_INCOME] as Money);

    it("takes $256 off Oregon income tax for a single filer in 2025", () => {
      const results = run(oregon2025, 50000);
      expect(results.statePersonalExemptionCredit).toBe(256);
      expect(stateIncomeTaxOf(results)).toBeCloseTo(
        stateIncomeTaxOf(run(withoutCredit, 50000)) - 256,
        2,
      );
    });

    it("counts two exemptions on a joint return", () => {
      expect(
        run(oregon2025, 150000, MARRIED).statePersonalExemptionCredit,
      ).toBe(512);
    });

    // "More than $100,000" ($200,000 for everyone else): the limit itself
    // still qualifies, and one dollar over loses the whole credit.
    it.each([
      [SINGLE, 100000, 256],
      [SINGLE, 100001, 0],
      [MARRIED_SEPARATELY, 100001, 0],
      [MARRIED, 200000, 512],
      [MARRIED, 200001, 0],
      [HEAD_OF_HOUSEHOLD, 200000, 256],
      [HEAD_OF_HOUSEHOLD, 200001, 0],
    ])("is a cliff: %s at %i gets %i", (filingStatus, income, credit) => {
      expect(
        run(oregon2025, income, filingStatus as FilingStatus)
          .statePersonalExemptionCredit,
      ).toBe(credit);
    });

    it("measures the limit after the 401(k) contribution", () => {
      // AGI is 95,000.
      expect(
        run(oregon2025, 105000, SINGLE, 10000).statePersonalExemptionCredit,
      ).toBe(256);
    });

    it("is nonrefundable: never takes the tax below zero", () => {
      const results = run(oregon2025, 3000);
      expect(stateIncomeTaxOf(results)).toBe(0);
      expect(results.statePersonalExemptionCredit).toBeLessThan(256);
      expect(results.statePersonalExemptionCredit).toBe(
        stateIncomeTaxOf(run(withoutCredit, 3000)),
      );
    });

    it("does nothing when the filer is exempt from Oregon income tax", () => {
      const results = run(oregon2025, 50000, SINGLE, 0, [
        { title: "", value: STATE_INCOME, scope: STATE_SCOPE, disabled: false },
      ]);
      expect(results.stateResults[STATE_INCOME]).toBe(EXEMPT);
      expect(results.statePersonalExemptionCredit).toBe(0);
    });

    it("leaves payroll and Portland's taxes alone", () => {
      const withIt = run(oregon2025, 60000, SINGLE, 0, [], PORTLAND);
      const without = run(withoutCredit, 60000, SINGLE, 0, [], PORTLAND);
      // Compared in dollars: equal Money values need not be equal objects.
      const dollars = (results: TaxResults) =>
        Object.fromEntries(
          Object.entries(results).map(([key, value]) => [
            key,
            value === EXEMPT ? value : toUnit(value as Money),
          ]),
        );
      expect(toUnit(withIt.stateResults[OREGON_TRANSIT_TAX] as Money)).toBe(
        toUnit(without.stateResults[OREGON_TRANSIT_TAX] as Money),
      );
      expect(dollars(withIt.stateResults[CITIES] as TaxResults)).toEqual(
        dollars(without.stateResults[CITIES] as TaxResults),
      );
      expect(
        toUnit(without.totalState.amount) - toUnit(withIt.totalState.amount),
      ).toBeCloseTo(256, 2);
    });
  });
});
