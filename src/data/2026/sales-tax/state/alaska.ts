import { INFINITY } from "@/constants";
import {
  CITIES,
  ANCHORAGE,
  BETHEL,
  CORDOVA,
  DILLINGHAM,
  FAIRBANKS,
  HOMER,
  HOUSTON,
  JUNEAU,
  KENAI,
  KETCHIKAN,
  KODIAK,
  KOTZEBUE,
  NOME,
  NORTH_POLE,
  PALMER,
  SEWARD,
  SITKA,
  SOLDOTNA,
  UNALASKA,
  VALDEZ,
  WASILLA,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Alaska has no state sales tax. Local rates are from the Alaska Remote
// Seller Sales Tax Commission's monthly 'ARSSTC Sales Tax Rate Sheet'
// workbooks, January 1, 2025 through October 1, 2026
// (arsstc.org/business-sellers/tax-rates/), which list each member borough's
// and city's general rate, effective date and seasonal schedule; a city's
// local rate is its city rate plus its borough's (Kenai Peninsula Borough 3%,
// Ketchikan Gateway Borough 2.5%; Matanuska-Susitna, Fairbanks North Star and
// Kodiak Island boroughs levy none). Anchorage, Fairbanks and Valdez levy no
// general sales tax: the ARSSTC alcohol sheet marks Anchorage 'No general
// sales tax', and the Alaska Department of Commerce, Office of the State
// Assessor's 'Alaska Taxable 2024' Table 1B reports a 0 sales tax rate for
// Anchorage, Fairbanks, Fairbanks North Star Borough and Valdez (and 5.5% for
// North Pole). Sitka and the City of Ketchikan use seasonal rates (summer
// April-September), given as monthly values. Utqiagvik, the 12th-largest
// place, is left out: Alaska Taxable 2024 shows a 10% rate from 2022 data
// with no reported revenue and it is not an ARSSTC member, so its general
// rate could not be confirmed. Many Alaska jurisdictions cap tax on a single
// item or transaction (listed on the ARSSTC 'Tax Caps' sheet); caps are not
// modeled. Cities are the most populous incorporated places in the Census
// Bureau's Vintage 2025 city estimates (SUB-EST2025).
//
// Palmer's city rate rose from 3% to 4% on April 1, 2026; Nome's from 5% to
// 6% on January 1, 2026. The latest published sheet is October 1, 2026;
// November-December 2026 assume the October rates (and the published winter
// rates for Sitka and Ketchikan).
export default {
  [STATE_SALES_TAX]: 0,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: 1.82,
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional Local Sales Tax Table C,
  // which the Schedule A instructions assign to Alaska's localities. Alaska
  // has no state sales tax, so its table assumes a 1% local rate.
  [TAXABLE_SPENDING]: {
    rate: 1,
    bands: [
      { min: 0, max: 20000, amounts: [88, 107, 119, 129, 138, 150] },
      { min: 20000, max: 30000, amounts: [119, 142, 159, 173, 184, 200] },
      { min: 30000, max: 40000, amounts: [133, 159, 179, 193, 206, 223] },
      { min: 40000, max: 50000, amounts: [144, 174, 194, 210, 223, 243] },
      { min: 50000, max: 60000, amounts: [154, 186, 207, 224, 240, 260] },
      { min: 60000, max: 70000, amounts: [164, 196, 219, 238, 253, 275] },
      { min: 70000, max: 80000, amounts: [172, 206, 231, 249, 265, 288] },
      { min: 80000, max: 90000, amounts: [179, 214, 240, 260, 276, 301] },
      { min: 90000, max: 100000, amounts: [186, 223, 249, 270, 287, 312] },
      { min: 100000, max: 120000, amounts: [195, 234, 261, 283, 301, 327] },
      { min: 120000, max: 140000, amounts: [206, 248, 276, 299, 318, 345] },
      { min: 140000, max: 160000, amounts: [216, 260, 289, 314, 334, 363] },
      { min: 160000, max: 180000, amounts: [225, 271, 303, 327, 348, 378] },
      { min: 180000, max: 200000, amounts: [234, 281, 314, 339, 362, 393] },
      { min: 200000, max: 225000, amounts: [243, 291, 326, 352, 375, 407] },
      { min: 225000, max: 250000, amounts: [252, 303, 338, 366, 389, 422] },
      { min: 250000, max: 275000, amounts: [261, 313, 349, 379, 402, 437] },
      { min: 275000, max: 300000, amounts: [269, 323, 361, 390, 415, 451] },
      { min: 300000, max: INFINITY, amounts: [306, 368, 409, 444, 471, 512] },
    ],
  },
  [CITIES]: {
    // ARSSTC alcohol sheet: no general sales tax
    [ANCHORAGE]: { [LOCAL_SALES_TAX]: 0 },
    [JUNEAU]: { [LOCAL_SALES_TAX]: 5 }, // ARSSTC City and Borough of Juneau 5%
    // Alaska Taxable 2024 Table 1B: no general sales tax
    [FAIRBANKS]: { [LOCAL_SALES_TAX]: 0 },
    // ARSSTC Wasilla City 2.5% (Mat-Su Borough none)
    [WASILLA]: { [LOCAL_SALES_TAX]: 2.5 },
    // ARSSTC Sitka 6% Apr-Sep, 5% Oct-Mar
    [SITKA]: { [LOCAL_SALES_TAX]: [5, 6, 6, 5] },
    // ARSSTC KGB 2.5% + city 5.5% Apr-Sep / 3% Oct-Mar
    [KETCHIKAN]: { [LOCAL_SALES_TAX]: [5.5, 8, 8, 5.5] },
    // ARSSTC Kenai Pen. Borough 3% + Kenai City 3%
    [KENAI]: { [LOCAL_SALES_TAX]: 6 },
    // ARSSTC Palmer City (Mat-Su Borough none)
    [PALMER]: { [LOCAL_SALES_TAX]: [3, 4, 4, 4] },
    [BETHEL]: { [LOCAL_SALES_TAX]: 6 }, // ARSSTC Bethel City 6%
    // ARSSTC Kenai Pen. Borough 3% + Homer City 4.85%
    [HOMER]: { [LOCAL_SALES_TAX]: 7.85 },
    // ARSSTC Kodiak City 7% (Kodiak Island Borough none)
    [KODIAK]: { [LOCAL_SALES_TAX]: 7 },
    // ARSSTC Kenai Pen. Borough 3% + Soldotna City 3%
    [SOLDOTNA]: { [LOCAL_SALES_TAX]: 6 },
    [UNALASKA]: { [LOCAL_SALES_TAX]: 3 }, // ARSSTC Unalaska City 3%
    // Alaska Taxable 2024 Table 1B: no general sales tax
    [VALDEZ]: { [LOCAL_SALES_TAX]: 0 },
    [NOME]: { [LOCAL_SALES_TAX]: 6 }, // ARSSTC Nome City
    // ARSSTC Kenai Pen. Borough 3% + Seward City 4%
    [SEWARD]: { [LOCAL_SALES_TAX]: 7 },
    [KOTZEBUE]: { [LOCAL_SALES_TAX]: 6 }, // ARSSTC Kotzebue 6%
    // ARSSTC North Pole 5.5% (Fairbanks NS Borough none)
    [NORTH_POLE]: { [LOCAL_SALES_TAX]: 5.5 },
    [CORDOVA]: { [LOCAL_SALES_TAX]: 7 }, // ARSSTC Cordova City 7%
    // ARSSTC Houston City 2% (Mat-Su Borough none)
    [HOUSTON]: { [LOCAL_SALES_TAX]: 2 },
    [DILLINGHAM]: { [LOCAL_SALES_TAX]: 6 }, // ARSSTC Dillingham City 6%
  },
} as SalesTaxData;
