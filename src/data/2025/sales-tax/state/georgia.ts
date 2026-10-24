import { INFINITY } from "@/constants";
import {
  CITIES,
  ALBANY,
  ALPHARETTA,
  ATHENS,
  ATLANTA,
  AUGUSTA,
  BROOKHAVEN,
  COLUMBUS,
  DUNWOODY,
  JOHNS_CREEK,
  MABLETON,
  MACON,
  MARIETTA,
  ROSWELL,
  SANDY_SPRINGS,
  SAVANNAH,
  SMYRNA,
  SOUTH_FULTON,
  STONECREST,
  VALDOSTA,
  WARNER_ROBINS,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// Georgia Department of Revenue, "Georgia Sales and Use Tax Rate Chart", the
// eight quarterly general rate charts effective January 1, 2025 through
// October 1, 2026 (dor.georgia.gov/sales-tax-rates-general). Each chart lists
// combined rates (4% state included) by DOR jurisdiction code; local = chart
// rate minus 4. Cross-checked against the Streamlined Sales Tax rate file
// GAR2026Q4OCT01.csv (streamlinedsalestax.org/ratesandboundry/Rates/), whose
// effective-dated county, city (Atlanta, College Park, East Point, Hapeville)
// and special-district (MARTA, Fulton TSPLOST) rows sum to the same figures.
// Georgia cities other than Atlanta, East Point, College Park and Hapeville
// take their county's rate; consolidated governments (Columbus-Muscogee,
// Augusta-Richmond, Macon-Bibb, Athens-Clarke) take their county's line.
// Atlanta uses the Fulton portion (060A; about 92% of residents), which
// equals the DeKalb portion (044A) at 8.9%. South Fulton, Sandy Springs,
// Roswell, Johns Creek and Alpharetta use 060 Fulton (outside Atlanta,
// Hapeville, College Park and East Point). Cities are the 20 most populous
// incorporated places in the Census Bureau's Vintage 2025 city estimates
// (SUB-EST2025).
//
// Macon-Bibb's rate fell from 8% to 7% on October 1, 2025 (the chart drops
// the E/educational levy) and returned to 8% on April 1, 2026.
export default {
  [STATE_SALES_TAX]: 4,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [3.418, 3.418, 3.44, 3.44],
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 4,
    bands: [
      { min: 0, max: 20000, amounts: [235, 270, 295, 313, 328, 350] },
      { min: 20000, max: 30000, amounts: [324, 373, 406, 432, 453, 483] },
      { min: 30000, max: 40000, amounts: [368, 423, 461, 491, 515, 548] },
      { min: 40000, max: 50000, amounts: [404, 466, 507, 539, 566, 603] },
      { min: 50000, max: 60000, amounts: [436, 503, 547, 582, 610, 651] },
      { min: 60000, max: 70000, amounts: [464, 535, 583, 619, 650, 694] },
      { min: 70000, max: 80000, amounts: [490, 565, 614, 654, 687, 731] },
      { min: 80000, max: 90000, amounts: [513, 591, 644, 686, 719, 767] },
      { min: 90000, max: 100000, amounts: [535, 616, 671, 714, 749, 799] },
      { min: 100000, max: 120000, amounts: [564, 649, 708, 753, 790, 842] },
      { min: 120000, max: 140000, amounts: [600, 692, 754, 801, 841, 897] },
      { min: 140000, max: 160000, amounts: [633, 730, 795, 846, 888, 947] },
      { min: 160000, max: 180000, amounts: [663, 765, 834, 887, 930, 992] },
      { min: 180000, max: 200000, amounts: [692, 798, 869, 924, 970, 1035] },
      { min: 200000, max: 225000, amounts: [721, 832, 906, 964, 1012, 1079] },
      { min: 225000, max: 250000, amounts: [752, 867, 944, 1004, 1054, 1124] },
      { min: 250000, max: 275000, amounts: [781, 901, 981, 1043, 1095, 1168] },
      { min: 275000, max: 300000, amounts: [808, 931, 1015, 1080, 1133, 1209] },
      {
        min: 300000,
        max: INFINITY,
        amounts: [964, 1112, 1212, 1289, 1353, 1442],
      },
    ],
  },
  [CITIES]: {
    // DOR rate chart 060A Fulton (Atlanta)
    [ATLANTA]: { [LOCAL_SALES_TAX]: 4.9 },
    [COLUMBUS]: { [LOCAL_SALES_TAX]: 5 }, // DOR rate chart 106 Muscogee
    [AUGUSTA]: { [LOCAL_SALES_TAX]: 4.5 }, // DOR rate chart 121 Richmond
    [MACON]: { [LOCAL_SALES_TAX]: [4, 4, 4, 3] }, // DOR rate chart 011 Bibb
    [SAVANNAH]: { [LOCAL_SALES_TAX]: 3 }, // DOR rate chart 025 Chatham
    [ATHENS]: { [LOCAL_SALES_TAX]: 4 }, // DOR rate chart 029 Clarke
    [SOUTH_FULTON]: { [LOCAL_SALES_TAX]: 3.75 }, // DOR rate chart 060 Fulton*
    [SANDY_SPRINGS]: { [LOCAL_SALES_TAX]: 3.75 }, // DOR rate chart 060 Fulton*
    [ROSWELL]: { [LOCAL_SALES_TAX]: 3.75 }, // DOR rate chart 060 Fulton*
    [WARNER_ROBINS]: { [LOCAL_SALES_TAX]: 3 }, // DOR rate chart 076 Houston
    [JOHNS_CREEK]: { [LOCAL_SALES_TAX]: 3.75 }, // DOR rate chart 060 Fulton*
    [MABLETON]: { [LOCAL_SALES_TAX]: 2 }, // DOR rate chart 033 Cobb
    [ALPHARETTA]: { [LOCAL_SALES_TAX]: 3.75 }, // DOR rate chart 060 Fulton*
    [ALBANY]: { [LOCAL_SALES_TAX]: 4 }, // DOR rate chart 047 Dougherty
    [MARIETTA]: { [LOCAL_SALES_TAX]: 2 }, // DOR rate chart 033 Cobb
    // DOR rate chart 044 Dekalb (Not Atlanta)
    [STONECREST]: { [LOCAL_SALES_TAX]: 4 },
    // DOR rate chart 044 Dekalb (Not Atlanta)
    [BROOKHAVEN]: { [LOCAL_SALES_TAX]: 4 },
    [SMYRNA]: { [LOCAL_SALES_TAX]: 2 }, // DOR rate chart 033 Cobb
    [VALDOSTA]: { [LOCAL_SALES_TAX]: 4 }, // DOR rate chart 092 Lowndes
    // DOR rate chart 044 Dekalb (Not Atlanta)
    [DUNWOODY]: { [LOCAL_SALES_TAX]: 4 },
  },
} as SalesTaxData;
