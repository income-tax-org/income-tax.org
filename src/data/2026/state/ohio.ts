import {
  GROSS_INCOME_BASIS,
  INFINITY,
  TAXABLE_INCOME_BASIS,
} from "@/constants";
import {
  AKRON,
  CINCINNATI,
  CITIES,
  CLEVELAND,
  COLUMBUS,
  DAYTON,
  TOLEDO,
} from "@/constants/cities";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  CITY_INCOME,
  STANDARD_DEDUCTION,
  STATE_INCOME,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Verified 2026-09-07: rates and boundaries correct. HB 96 finished the
  // flattening -- one rate above the $26,050 exemption, no $100,000 step.
  // Source: ORC 5747.02(A)(3)(c), "For taxable years beginning in 2026 and
  // thereafter, $332.00 plus 2.75% of the amount in excess of $26,050".
  // https://codes.ohio.gov/ohio-revised-code/section-5747.02
  //
  // The $332.00 base amount IS modelled, via `base_amount` on each bracket.
  // Ohio does not tax the first $26,050 marginally: the statute charges a flat
  // $332 (the 1.27448% estate rate applied to $26,050) the moment taxable
  // nonbusiness income clears the threshold, so the tax function genuinely
  // steps -- nothing at $26,050, $332.03 at $26,051. Reading the schedule
  // marginally undercharged every Ohio filer above $26,050 by the full base.
  // See isBaseAmountSchedule in utils/calculator.
  //
  // The $26,050 threshold is indexed annually by the tax commissioner under
  // ORC 5747.02(A)(5), each August, to the nearest $50. It has held at $26,050
  // since 2022; re-check once the 2026 IT 1040 instructions are posted.
  // Ohio's personal exemption, ORC 5747.025 -- IT 1040 line 4, subtracted from
  // Ohio AGI to reach the income tax base the rate schedule above is charged
  // on. See "What the slot actually holds" in src/data/README.md.
  //
  // Tiered by modified adjusted gross income, and indexed annually, so it is
  // a schedule rather than a number. A joint return claims two exemptions
  // (the filer and the spouse), which is why MARRIED is double at every tier;
  // the tiers themselves are the same on an individual or a joint return.
  // Ohio has no head-of-household status, so that filer claims one.
  //
  // The top band is new: ORC 5747.025(A) allows no exemption at all once
  // modified AGI reaches $500,000, a cliff rather than a taper.
  //
  // MODELLED: the no-dependants case. The exemption is also claimed for each
  // dependent on the federal return, and the calculator has no dependants
  // input. Same treatment as Michigan's $600 exemption.
  //
  // This interacts with the base amount above: the $26,050 threshold is
  // measured against income *after* this exemption, so it moves who sits over
  // the cliff. A filer on $28,000 of wages is under it once the exemption is
  // taken, and owes nothing.
  //
  // Source: 2026 Ohio IT 1040 instruction booklet, "Line 4 - Personal and
  // Dependent Exemptions". https://codes.ohio.gov/ohio-revised-code/section-5747.025
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 40001, amount: 2400 },
      { min: 40001, max: 80001, amount: 2150 },
      { min: 80001, max: 500000, amount: 1900 },
      { min: 500000, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 40001, amount: 4800 },
      { min: 40001, max: 80001, amount: 4300 },
      { min: 80001, max: 500000, amount: 3800 },
      { min: 500000, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 40001, amount: 2400 },
      { min: 40001, max: 80001, amount: 2150 },
      { min: 80001, max: 500000, amount: 1900 },
      { min: 500000, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 40001, amount: 2400 },
      { min: 40001, max: 80001, amount: 2150 },
      { min: 80001, max: 500000, amount: 1900 },
      { min: 500000, max: INFINITY, amount: 0 },
    ],
  },
  [STATE_INCOME]: {
    [ALL]: [
      {
        min: 0,
        max: 26050,
        rate: 0,
        base_amount: 0,
        basis: TAXABLE_INCOME_BASIS,
      },
      {
        min: 26050,
        max: INFINITY,
        rate: 2.75,
        base_amount: 332,
        basis: TAXABLE_INCOME_BASIS,
      },
    ],
  },
  [CITIES]: {
    // Ohio's municipal income taxes are levied on "qualifying wages", which ORC
    // 718.01(R) defines as "wages, as defined in section 3121(a) of the Internal
    // Revenue Code, without regard to any wage limitations" -- W-2 box 5, the
    // Medicare wage figure. That is the gross-wage base, and every schedule
    // below declares it.
    //
    // Two things follow, and both were wrong before. Ohio's personal exemption
    // is a state figure (ORC 5747.025) and does not reach a municipal tax, so
    // adding it above must not shrink these; the two changes belong together.
    // And a 401(k) elective deferral does not reduce box 5 either, so charging
    // these on income after the deferral undercharged a Columbus resident
    // contributing the maximum by roughly $590 a year.
    // Verified 2026-09-07. Columbus 2.5%: City of Columbus, General Income Tax
    // Information ("multiplied by the rate of 2.5%").
    // https://www.columbus.gov/Government/City-Auditor/Income-Tax-Division/General-Income-Tax-Information
    [COLUMBUS]: {
      [CITY_INCOME]: {
        [ALL]: [
          {
            min: 0,
            max: INFINITY,
            rate: 2.5,
            basis: GROSS_INCOME_BASIS,
          },
        ],
      },
    },
    // Verified 2026-09-07. Cleveland 2.5%: CCA Division of Taxation rate
    // table, tax year 2026 tab. https://ccatax.ci.cleveland.oh.us/?p=taxrates
    [CLEVELAND]: {
      [CITY_INCOME]: {
        [ALL]: [
          {
            min: 0,
            max: INFINITY,
            rate: 2.5,
            basis: GROSS_INCOME_BASIS,
          },
        ],
      },
    },
    // Verified 2026-09-07. Cincinnati 1.8% effective 2020-10-02: City of
    // Cincinnati, Income Taxes.
    // https://www.cincinnati-oh.gov/finance/income-taxes/
    [CINCINNATI]: {
      [CITY_INCOME]: {
        [ALL]: [
          {
            min: 0,
            max: INFINITY,
            rate: 1.8,
            basis: GROSS_INCOME_BASIS,
          },
        ],
      },
    },
    // Corrected 2026-09-07: 2.25% -> 2.5%. Source: City of Toledo, Pay Your
    // Income Taxes -- "In accordance with Toledo Municipal Code 1905.011,
    // effective January 1, 2021, the city of Toledo income tax rate is two and
    // one-half percent (2.5%)." https://toledo.oh.gov/pay-taxes
    [TOLEDO]: {
      [CITY_INCOME]: {
        [ALL]: [
          {
            min: 0,
            max: INFINITY,
            rate: 2.5,
            basis: GROSS_INCOME_BASIS,
          },
        ],
      },
    },
    // Verified 2026-09-07. Akron 2.5% effective 2018-01-01: City of Akron,
    // Individual/Joint Filers.
    // https://www.akronohio.gov/departments/finance/individual_joint_filers.php
    [AKRON]: {
      [CITY_INCOME]: {
        [ALL]: [
          {
            min: 0,
            max: INFINITY,
            rate: 2.5,
            basis: GROSS_INCOME_BASIS,
          },
        ],
      },
    },
    // Verified 2026-09-07. Dayton 2.5% (2.25% base plus 0.25%) for tax years
    // 2017 and beyond: City of Dayton, Tax Information & Forms.
    // https://www.daytonohio.gov/429/Tax-Forms-Information
    [DAYTON]: {
      [CITY_INCOME]: {
        [ALL]: [
          {
            min: 0,
            max: INFINITY,
            rate: 2.5,
            basis: GROSS_INCOME_BASIS,
          },
        ],
      },
    },
  },
} as TaxData;
