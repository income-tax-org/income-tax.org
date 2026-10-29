import { INFINITY } from "@/constants";
import { CITIES, NEWARK } from "@/constants/cities";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  EMPLOYER_PAYROLL_TAX,
  NJ_DISABILITY_INSURANCE,
  NJ_FAMILY_LEAVE_INSURANCE,
  NJ_UNEMPLOYMENT_INSURANCE,
  NJ_WORKFORCE_DEVELOPMENT,
  STATE_INCOME,
  STANDARD_DEDUCTION,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // New Jersey has no standard deduction. It allows a personal exemption
  // instead -- NJ-1040 line 6, carried to line 30 and subtracted from gross
  // income to reach taxable income -- so it does what this slot models. See
  // "What the slot actually holds" in src/data/README.md.
  //
  // "You can claim a $1,000 exemption for yourself and your spouse/CU partner
  // (if filing a joint return)", so a joint return claims two. Flat: unlike
  // Illinois' and Ohio's, it does not phase out with income.
  //
  // MODELLED: the no-dependants case, and no additional exemptions. Lines 7
  // to 12 add $1,000 for being 65 or over, $1,000 for blind or disabled,
  // $6,000 for a veteran, $1,500 per dependent child and $1,000 per dependent
  // attending college; the calculator collects none of those.
  //
  // Source: 2026 NJ-1040 Instructions, "Line 6 - Regular Exemptions".
  // https://www.nj.gov/treasury/taxation/pdf/current/1040i.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 1000,
    [MARRIED]: 2000,
    [MARRIED_SEPARATELY]: 1000,
    [HEAD_OF_HOUSEHOLD]: 1000,
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 20000, rate: 1.4 },
      { min: 20000, max: 35000, rate: 1.75 },
      { min: 35000, max: 40000, rate: 3.5 },
      { min: 40000, max: 75000, rate: 5.53 },
      { min: 75000, max: 500000, rate: 6.37 },
      { min: 500000, max: 1000000, rate: 8.97 },
      { min: 1000000, max: INFINITY, rate: 10.75 },
    ],
    [MARRIED]: [
      { min: 0, max: 20000, rate: 1.4 },
      { min: 20000, max: 50000, rate: 1.75 },
      { min: 50000, max: 70000, rate: 2.45 },
      { min: 70000, max: 80000, rate: 3.5 },
      { min: 80000, max: 150000, rate: 5.53 },
      { min: 150000, max: 500000, rate: 6.37 },
      { min: 500000, max: 1000000, rate: 8.97 },
      { min: 1000000, max: INFINITY, rate: 10.75 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 20000, rate: 1.4 },
      { min: 20000, max: 35000, rate: 1.75 },
      { min: 35000, max: 40000, rate: 3.5 },
      { min: 40000, max: 75000, rate: 5.53 },
      { min: 75000, max: 500000, rate: 6.37 },
      { min: 500000, max: 1000000, rate: 8.97 },
      { min: 1000000, max: INFINITY, rate: 10.75 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 20000, rate: 1.4 },
      { min: 20000, max: 50000, rate: 1.75 },
      { min: 50000, max: 70000, rate: 2.45 },
      { min: 70000, max: 80000, rate: 3.5 },
      { min: 80000, max: 150000, rate: 5.53 },
      { min: 150000, max: 500000, rate: 6.37 },
      { min: 500000, max: 1000000, rate: 8.97 },
      { min: 1000000, max: INFINITY, rate: 10.75 },
    ],
  },
  [NJ_UNEMPLOYMENT_INSURANCE]: {
    [SINGLE]: [{ min: 0, max: 44800, rate: 0.3825 }],
    [MARRIED]: [{ min: 0, max: 44800, rate: 0.3825 }],
    [MARRIED_SEPARATELY]: [{ min: 0, max: 44800, rate: 0.3825 }],
    [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: 44800, rate: 0.3825 }],
  },
  [NJ_DISABILITY_INSURANCE]: {
    [SINGLE]: [{ min: 0, max: 171100, rate: 0.19 }],
    [MARRIED]: [{ min: 0, max: 171100, rate: 0.19 }],
    [MARRIED_SEPARATELY]: [{ min: 0, max: 171100, rate: 0.19 }],
    [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: 171100, rate: 0.19 }],
  },
  [NJ_FAMILY_LEAVE_INSURANCE]: {
    [SINGLE]: [{ min: 0, max: 171100, rate: 0.23 }],
    [MARRIED]: [{ min: 0, max: 171100, rate: 0.23 }],
    [MARRIED_SEPARATELY]: [{ min: 0, max: 171100, rate: 0.23 }],
    [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: 171100, rate: 0.23 }],
  },
  [NJ_WORKFORCE_DEVELOPMENT]: {
    [SINGLE]: [{ min: 0, max: 44800, rate: 0.0425 }],
    [MARRIED]: [{ min: 0, max: 44800, rate: 0.0425 }],
    [MARRIED_SEPARATELY]: [{ min: 0, max: 44800, rate: 0.0425 }],
    [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: 44800, rate: 0.0425 }],
  },
  [CITIES]: {
    // Newark's 1% payroll tax is real and is documented here for the tax
    // tables, but it is levied on the EMPLOYER and is deliberately never
    // charged against a salary. See NON_WAGE_TAX_TYPES in constants/tax-types
    // for why a tax lives in the data without being calculated.
    //
    // N.J.S.A. 40:48C-15, as amended by P.L.2018, c.68, is titled "Collection
    // of employer payroll tax by municipality" and authorises a tax "of up to
    // one percent of the employer's payroll". Newark's own Payroll Tax Booklet
    // is addressed "TO ALL EMPLOYERS" and states: "The Employer is responsible
    // for the Payroll Tax." The return is filed quarterly against the
    // business's FEIN with a $2,500/quarter de minimis on the employer's
    // payroll; there is no employee return, no employee withholding line and
    // no employee liability. Under subsection (c) an employer whose workforce
    // is more than 50% Newark residents "shall incur no payroll tax relative
    // to those Newark-resident employees" -- being a resident reduces the
    // employer's bill rather than creating one of your own.
    //
    // New Jersey authorises no municipal wage or income tax on employees at
    // all, so this is the only shape a NJ city tax can take. It was previously
    // keyed as `city_income`, alongside Yonkers, Kansas City, St. Louis and
    // Wilmington -- taxes genuinely borne by the employee -- and charged a
    // Newark resident about $1,000/yr at $100,000 that they do not owe.
    // Verified 2026-09-07 against the statute and the 2026 booklet.
    // https://pub.njleg.state.nj.us/Bills/2018/PL18/68_.PDF
    // https://www.newarknj.gov/DocumentCenter/View/3058/Payroll-Tax-Booklet--2026-PDF
    [NEWARK]: {
      [EMPLOYER_PAYROLL_TAX]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 1.0 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 1.0 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 1.0 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 1.0 }],
      },
    },
  },
} as TaxData;
