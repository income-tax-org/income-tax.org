import { describe, it, expect } from "vitest";
import {
  exemptionCreditCliffWithin,
  isBandedDeduction,
  personalExemptionCreditFor,
  resolveStandardDeduction,
  standardDeductionFor,
  resolveStandardDeductionMap,
  withExemptionCreditPinned,
} from "@/utils/standard-deduction";
import { calculate } from "@/utils/calculator";
import { INFINITY, CITIES } from "@/constants";
import {
  SINGLE,
  MARRIED,
  MARRIED_SEPARATELY,
  HEAD_OF_HOUSEHOLD,
  ALL,
} from "@/constants/filing-status";
import type { FilingStatus } from "@/constants/filing-status";
import {
  STANDARD_DEDUCTION,
  STATE_INCOME,
  CITY_INCOME,
} from "@/constants/tax-types";
import { BIRMINGHAM } from "@/constants/cities";
import type { DeductionBand, TaxData } from "@/types";
import { toUnit } from "@/utils/money";
import wisconsin2025 from "@/data/2025/state/wisconsin";
import oregon2026 from "@/data/2026/state/oregon";
import california2025 from "@/data/2025/state/california";
import wisconsin2023 from "@/data/2023/state/wisconsin";
import oregon2025 from "@/data/2025/state/oregon";
import federal2025 from "@/data/2025/federal";

/**
 * Wisconsin's own published schedule, 2025 Form 1-ES:
 *   single    13,560, less 12% of income over 19,550, zero over 132,549
 *   joint     25,110, less 19.778% over 28,210, zero over 155,169
 *   separate  11,930, less 19.778% over 13,390, zero over 73,709
 *   head      17,520, less 22.515% over 19,550 until it meets the single
 *             schedule at 57,211, then 13,560 less 12% over 19,550
 */
const wisconsinDeduction = (status: FilingStatus, income: number) =>
  standardDeductionFor(wisconsin2025 as TaxData, status, income);

describe("resolveStandardDeduction", () => {
  describe("a flat deduction is untouched", () => {
    // Roughly forty states publish one number. None of the banding may reach
    // them.
    it("returns the number whatever the income", () => {
      for (const income of [0, 25_000, 250_000]) {
        expect(resolveStandardDeduction(2835, income)).toBe(2835);
      }
    });

    it("still resolves Oregon's flat figure through the state data", () => {
      expect(standardDeductionFor(oregon2025 as TaxData, SINGLE, 250_000)).toBe(
        2835,
      );
    });

    it("passes undefined through for a state with no deduction", () => {
      expect(resolveStandardDeduction(undefined, 50_000)).toBeUndefined();
    });

    it("tells a flat deduction from a banded one", () => {
      expect(isBandedDeduction(2835)).toBe(false);
      expect(isBandedDeduction(undefined)).toBe(false);
      expect(isBandedDeduction([{ min: 0, max: INFINITY, amount: 1 }])).toBe(
        true,
      );
    });
  });

  describe("Wisconsin, 2025", () => {
    it("allows the full amount at the top band", () => {
      expect(wisconsinDeduction(SINGLE, 19_549)).toBe(13_560);
      expect(wisconsinDeduction(MARRIED, 28_209)).toBe(25_110);
      expect(wisconsinDeduction(MARRIED_SEPARATELY, 13_389)).toBe(11_930);
      expect(wisconsinDeduction(HEAD_OF_HOUSEHOLD, 19_549)).toBe(17_520);
    });

    it("starts phasing down at the first dollar past the threshold", () => {
      // 13,560 less 12% of $450
      expect(wisconsinDeduction(SINGLE, 20_000)).toBe(13_506);
      // 25,110 less 19.778% of $1,790
      expect(wisconsinDeduction(MARRIED, 30_000)).toBe(24_756);
    });

    it("reaches the floor of zero, and stays there", () => {
      expect(wisconsinDeduction(SINGLE, 132_550)).toBe(0);
      expect(wisconsinDeduction(SINGLE, 500_000)).toBe(0);
      expect(wisconsinDeduction(MARRIED, 155_170)).toBe(0);
      expect(wisconsinDeduction(MARRIED_SEPARATELY, 73_710)).toBe(0);
    });

    // The case the schema's `reduce_from` exists for: past the crossover, head
    // of household switches to the single schedule but keeps measuring from
    // the *first* threshold, not from the band it has just entered.
    it("hands head of household to the single schedule at the crossover", () => {
      // Either formula gives about $9,041 here, which is why the DOR puts the
      // crossover at this income.
      expect(wisconsinDeduction(HEAD_OF_HOUSEHOLD, 57_210)).toBe(9_041);
      expect(wisconsinDeduction(HEAD_OF_HOUSEHOLD, 57_211)).toBe(9_041);

      // Above it, head of household tracks single exactly.
      for (const income of [60_000, 90_000, 120_000]) {
        expect(wisconsinDeduction(HEAD_OF_HOUSEHOLD, income)).toBe(
          wisconsinDeduction(SINGLE, income),
        );
      }
    });

    it("never allows more at a higher income", () => {
      const statuses: FilingStatus[] = [
        SINGLE,
        MARRIED,
        MARRIED_SEPARATELY,
        HEAD_OF_HOUSEHOLD,
      ];
      for (const status of statuses) {
        let previous = Infinity;
        for (let income = 0; income <= 200_000; income += 250) {
          const allowed = wisconsinDeduction(status, income) as number;
          expect(allowed).toBeLessThanOrEqual(previous);
          previous = allowed;
        }
      }
    });

    it("returns whole dollars, not a floating-point tail", () => {
      // 19.778% of an income is not a round number, and the deduction field
      // renders whatever it is handed.
      const allowed = wisconsinDeduction(MARRIED, 42_750) as number;
      expect(allowed).toBe(22_234);
      expect(Number.isInteger(allowed)).toBe(true);
    });
  });

  describe("Wisconsin, 2023", () => {
    // A different year to catch a schedule copied forward without reindexing.
    it("uses that year's own thresholds", () => {
      expect(
        standardDeductionFor(wisconsin2023 as TaxData, SINGLE, 18_399),
      ).toBe(12_760);
      expect(
        standardDeductionFor(wisconsin2023 as TaxData, SINGLE, 124_734),
      ).toBe(0);
    });
  });

  describe("a stepped phase-down", () => {
    // Alabama publishes a chart of increments rather than a rate: joint holds
    // $8,500 through $25,999 of AGI, then loses $175 for each $500, and
    // bottoms out at $5,000. This is the shape the schema has to carry, not
    // Alabama's data -- that is another agent's file, and exactly where its
    // ramp ends is for them to source from the ADOR chart.
    const steppedJoint: DeductionBand[] = [
      { min: 0, max: 26_000, amount: 8_500 },
      {
        min: 26_000,
        max: 36_000,
        amount: 8_500,
        reduce_per: 500,
        reduce_by: 175,
        floor: 5_000,
      },
      { min: 36_000, max: INFINITY, amount: 5_000 },
    ];

    it("holds the amount until a whole step has been crossed", () => {
      expect(resolveStandardDeduction(steppedJoint, 26_000)).toBe(8_500);
      expect(resolveStandardDeduction(steppedJoint, 26_499)).toBe(8_500);
      expect(resolveStandardDeduction(steppedJoint, 26_500)).toBe(8_325);
      expect(resolveStandardDeduction(steppedJoint, 26_999)).toBe(8_325);
      expect(resolveStandardDeduction(steppedJoint, 27_000)).toBe(8_150);
    });

    it("stops at the floor rather than running on to zero", () => {
      expect(resolveStandardDeduction(steppedJoint, 36_000)).toBe(5_000);
      // ADOR's own withholding example uses $5,000, not $8,500, on $44,200 of
      // joint wages.
      expect(resolveStandardDeduction(steppedJoint, 44_200)).toBe(5_000);
    });

    it("clamps at the floor even where the reduction would overshoot it", () => {
      // A floor is not just the band after the ramp: it has to hold inside
      // the ramp too, or one extra step takes the deduction below it.
      const overshooting: DeductionBand[] = [
        { min: 0, max: 10_000, amount: 1_000 },
        {
          min: 10_000,
          max: INFINITY,
          amount: 1_000,
          reduce_per: 100,
          reduce_by: 500,
          floor: 400,
        },
      ];
      expect(resolveStandardDeduction(overshooting, 10_100)).toBe(500);
      expect(resolveStandardDeduction(overshooting, 10_200)).toBe(400);
      expect(resolveStandardDeduction(overshooting, 90_000)).toBe(400);
    });
  });

  describe("a cliff rather than a taper", () => {
    // Not every one of these tapers. Illinois disallows its exemption
    // allowance outright above a threshold -- "you are not entitled to an
    // exemption allowance on Line 10. Enter 'zero'" -- so the deduction steps
    // from the full amount to nothing at one income. A band with no reduction
    // fields is how that is written. (Illinois' own data is another agent's
    // file; this is the shape, not the state.)
    const cliff: DeductionBand[] = [
      { min: 0, max: 250_000, amount: 2_850 },
      { min: 250_000, max: INFINITY, amount: 0 },
    ];

    it("allows the full amount right up to the threshold", () => {
      expect(resolveStandardDeduction(cliff, 0)).toBe(2_850);
      expect(resolveStandardDeduction(cliff, 249_999)).toBe(2_850);
    });

    it("allows nothing at the threshold and above", () => {
      expect(resolveStandardDeduction(cliff, 250_000)).toBe(0);
      expect(resolveStandardDeduction(cliff, 1_000_000)).toBe(0);
    });

    it("does not taper on the way there", () => {
      // The whole point of a cliff: no intermediate values exist.
      const values = new Set(
        [0, 50_000, 150_000, 249_999, 250_000, 400_000].map((income) =>
          resolveStandardDeduction(cliff, income),
        ),
      );
      expect([...values].sort((a, b) => (a as number) - (b as number))).toEqual(
        [0, 2_850],
      );
    });
  });

  describe("a schedule that rises with income", () => {
    // Not every one of these phases out. Montana's rule through tax year 2023
    // was "20% of Montana AGI", floored at $2,460 and capped at $5,540 for a
    // single filer -- so it climbs to a cap rather than falling from one.
    // (Montana's own data is another agent's file; from 2024 SB 399 moved the
    // state to federal taxable income and it has no deduction of its own.)
    const montanaSingle2023: DeductionBand[] = [
      {
        min: 0,
        max: 12_300,
        amount: 5_540,
        percent_of_income: 20,
        floor: 2_460,
      },
      {
        min: 12_300,
        max: 27_700,
        amount: 5_540,
        percent_of_income: 20,
        floor: 2_460,
      },
      { min: 27_700, max: INFINITY, amount: 5_540 },
    ];

    it("holds the floor while 20% of income is below it", () => {
      expect(resolveStandardDeduction(montanaSingle2023, 5_000)).toBe(2_460);
      expect(resolveStandardDeduction(montanaSingle2023, 12_300)).toBe(2_460);
    });

    it("takes the percentage between the floor and the cap", () => {
      expect(resolveStandardDeduction(montanaSingle2023, 20_000)).toBe(4_000);
      expect(resolveStandardDeduction(montanaSingle2023, 25_000)).toBe(5_000);
    });

    it("stops at the cap", () => {
      expect(resolveStandardDeduction(montanaSingle2023, 27_700)).toBe(5_540);
      expect(resolveStandardDeduction(montanaSingle2023, 200_000)).toBe(5_540);
    });
  });

  describe("resolveStandardDeductionMap", () => {
    it("resolves every filing status at one income", () => {
      const declared = (wisconsin2025 as TaxData)[STANDARD_DEDUCTION];

      // Below every threshold, so every status is at its maximum.
      expect(resolveStandardDeductionMap(declared, 13_389)).toEqual({
        single: 13_560,
        married: 25_110,
        married_separately: 11_930,
        head_of_household: 17_520,
      });

      // The statuses have different thresholds, so at one income they are at
      // different points on their own schedules. Separate has the lowest
      // threshold and is already phasing down here.
      expect(resolveStandardDeductionMap(declared, 19_549)).toEqual({
        single: 13_560,
        married: 25_110,
        married_separately: 10_712,
        head_of_household: 17_520,
      });

      expect(resolveStandardDeductionMap(declared, 200_000)).toEqual({
        single: 0,
        married: 0,
        married_separately: 0,
        head_of_household: 0,
      });
    });

    it("is empty when no deduction is declared", () => {
      expect(resolveStandardDeductionMap(undefined, 50_000)).toEqual({});
    });
  });
});

describe("a banded deduction through the calculator", () => {
  const wisconsinTaxOn = (income: number, totalIRA = 0) =>
    calculate(
      federal2025,
      wisconsin2025 as TaxData,
      income,
      SINGLE,
      totalIRA,
      undefined,
      undefined,
      [],
      "wisconsin",
      "",
    );

  it("uses the deduction at the filer's income, not the maximum", () => {
    // $100,000 is well into the phase-out: 13,560 less 12% of 80,450 is
    // $3,906, not the $13,560 the flat model used to allow.
    expect(toUnit(wisconsinTaxOn(100_000).stateTaxableIncome)).toBe(
      100_000 - 3_906,
    );
  });

  it("allows the maximum to a filer below the threshold", () => {
    expect(toUnit(wisconsinTaxOn(19_000).stateTaxableIncome)).toBe(
      19_000 - 13_560,
    );
  });

  it("measures the band against income after the retirement contribution", () => {
    // The AGI proxy: a $30,000 deferral moves a $100,000 earner down the
    // schedule, because a pre-tax contribution does reduce AGI. Using the
    // FICA wage figure here would ignore it.
    const deferred = wisconsinTaxOn(100_000, 30_000);
    // 13,560 less 12% of (70,000 - 19,550) = 13,560 - 6,054 = 7,506
    expect(toUnit(deferred.stateTaxableIncome)).toBe(70_000 - 7_506);
  });

  // Zero is a real answer here, not a missing one. Wisconsin allows a single
  // filer nothing at all above $132,549, and every layer that treats the
  // resolved figure as falsy -- "no value, keep the last one" -- hands back a
  // deduction the filer is not entitled to. It bit once already, in the
  // Calculator's income-change refresh, where the stale figure then fed the
  // calculation; tests/deductions.spec.ts pins the UI half.
  describe("a deduction that resolves to zero stays zero", () => {
    it("deducts nothing past the end of the schedule", () => {
      expect(toUnit(wisconsinTaxOn(200_000).stateTaxableIncome)).toBe(200_000);
    });

    it("does not fall back to the figure from a lower income", () => {
      // The specific failure: $3,906 is what the schedule allows at $100,000.
      // A filer at $200,000 must not keep it.
      const lower = toUnit(wisconsinTaxOn(100_000).stateTaxableIncome);
      expect(lower).toBe(100_000 - 3_906);
      expect(toUnit(wisconsinTaxOn(200_000).stateTaxableIncome)).not.toBe(
        200_000 - 3_906,
      );
    });

    it("charges the tax that a zero deduction implies", () => {
      // Same figure as an explicit zero deduction, which is the whole claim.
      const resolved = toUnit(wisconsinTaxOn(200_000).totalState.amount);
      const explicitZero = toUnit(
        calculate(
          federal2025,
          wisconsin2025 as TaxData,
          200_000,
          SINGLE,
          0,
          undefined,
          0,
          [],
          "wisconsin",
          "",
        ).totalState.amount,
      );
      expect(resolved).toBe(explicitZero);
    });
  });

  it("still lets a custom deduction override the schedule", () => {
    const results = calculate(
      federal2025,
      wisconsin2025 as TaxData,
      100_000,
      SINGLE,
      0,
      undefined,
      9_000,
      [],
      "wisconsin",
      "",
    );
    expect(toUnit(results.stateTaxableIncome)).toBe(100_000 - 9_000);
  });

  it("charges more tax than the old flat maximum did", () => {
    // The whole point: the flat model deducted $13,560 from every Wisconsin
    // filer, so anyone past the threshold was under-taxed.
    const banded = toUnit(wisconsinTaxOn(100_000).totalState.amount);
    const flat = toUnit(
      calculate(
        federal2025,
        wisconsin2025 as TaxData,
        100_000,
        SINGLE,
        0,
        undefined,
        13_560,
        [],
        "wisconsin",
        "",
      ).totalState.amount,
    );
    expect(banded).toBeGreaterThan(flat);
  });
});

describe("a city inheriting a banded state deduction", () => {
  // Cities start from state taxable income, so a phased-out state deduction
  // has to reach the city recursion resolved at the same income.
  const stateWithCity = {
    [STANDARD_DEDUCTION]: {
      [SINGLE]: [
        { min: 0, max: 20_000, amount: 10_000 },
        { min: 20_000, max: 30_000, amount: 10_000, reduce_rate: 50 },
        { min: 30_000, max: INFINITY, amount: 5_000 },
      ],
      [MARRIED]: 10_000,
      [MARRIED_SEPARATELY]: 10_000,
      [HEAD_OF_HOUSEHOLD]: 10_000,
    },
    [STATE_INCOME]: { [ALL]: [{ min: 0, max: INFINITY, rate: 1 }] },
    [CITIES]: {
      [BIRMINGHAM]: {
        [CITY_INCOME]: { [ALL]: [{ min: 0, max: INFINITY, rate: 1 }] },
      },
    },
  } as unknown as TaxData;

  const cityTaxOn = (income: number) =>
    toUnit(
      calculate(
        {} as TaxData,
        stateWithCity,
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

  it("inherits the full deduction below the phase-out", () => {
    // 1% of (15,000 - 10,000)
    expect(cityTaxOn(15_000)).toBe(50);
  });

  it("inherits the phased-down deduction, not the maximum", () => {
    // At $25,000 the state allows 10,000 - 50% of 5,000 = 7,500, so the city
    // is charged on 17,500 rather than on 15,000.
    expect(cityTaxOn(25_000)).toBe(175);
  });

  it("inherits the floor above the phase-out", () => {
    // 1% of (40,000 - 5,000)
    expect(cityTaxOn(40_000)).toBe(350);
  });
});

describe("Oregon's exemption credit cliff", () => {
  const oregon = oregon2026 as TaxData;

  it("pins the credit at this income, leaving other statuses alone", () => {
    const pinned = withExemptionCreditPinned(oregon, SINGLE, 100_000);
    expect(personalExemptionCreditFor(pinned, SINGLE, 100_500)).toBe(263);
    expect(personalExemptionCreditFor(pinned, MARRIED, 250_000)).toBe(0);
  });

  it("pins zero for an income already past the limit", () => {
    const pinned = withExemptionCreditPinned(oregon, SINGLE, 100_001);
    expect(personalExemptionCreditFor(pinned, SINGLE, 50_000)).toBe(0);
  });

  it("leaves a state without the credit untouched", () => {
    expect(withExemptionCreditPinned(wisconsin2025 as TaxData, SINGLE, 1)).toBe(
      wisconsin2025,
    );
  });

  it("reports the cliff only when the window reaches it", () => {
    expect(exemptionCreditCliffWithin(oregon, SINGLE, 99_950, 100)).toEqual({
      limit: 100_000,
      amount: 263,
    });
    expect(exemptionCreditCliffWithin(oregon, SINGLE, 100_000, 100)).toEqual({
      limit: 100_000,
      amount: 263,
    });
    expect(exemptionCreditCliffWithin(oregon, SINGLE, 99_000, 100)).toBeNull();
    expect(exemptionCreditCliffWithin(oregon, SINGLE, 100_001, 100)).toBeNull();
    expect(exemptionCreditCliffWithin(oregon, MARRIED, 199_950, 100)).toEqual({
      limit: 200_000,
      amount: 526,
    });
  });
});

describe("California's exemption credit phase-out", () => {
  const california = california2025 as TaxData;

  // Form 540 AGI Limitation Worksheet: $6 off each credit for each $2,500
  // ($1,250 separately), "or fraction thereof", of federal AGI over $252,203
  // ($504,411 joint, $378,310 head of household). Two credits on a joint
  // return, so $12 a step there.
  it.each([
    [SINGLE, 252_203, 153],
    [SINGLE, 252_204, 147],
    [SINGLE, 254_703, 147],
    [SINGLE, 254_704, 141],
    [SINGLE, 260_000, 129],
    [SINGLE, 314_703, 3],
    [SINGLE, 314_704, 0],
    [MARRIED, 530_000, 174],
    [MARRIED_SEPARATELY, 260_000, 111],
    [HEAD_OF_HOUSEHOLD, 400_000, 99],
  ])("%s at %i gets %i", (filingStatus, income, credit) => {
    expect(
      personalExemptionCreditFor(
        california,
        filingStatus as FilingStatus,
        income as number,
      ),
    ).toBe(credit);
  });

  it("is a taper, not a cliff, even where it runs out", () => {
    expect(
      exemptionCreditCliffWithin(california, SINGLE, 314_650, 100),
    ).toBeNull();
    expect(
      exemptionCreditCliffWithin(california, SINGLE, 252_150, 100),
    ).toBeNull();
  });
});
