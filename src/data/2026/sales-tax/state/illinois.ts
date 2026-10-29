import { INFINITY } from "@/constants";
import {
  CITIES,
  ARLINGTON_HEIGHTS,
  AURORA,
  BLOOMINGTON,
  BOLINGBROOK,
  CHAMPAIGN,
  CHICAGO,
  CICERO,
  DECATUR,
  DES_PLAINES,
  ELGIN,
  EVANSTON,
  JOLIET,
  NAPERVILLE,
  PALATINE,
  PEORIA,
  ROCKFORD,
  SCHAUMBURG,
  SKOKIE,
  SPRINGFIELD,
  WAUKEGAN,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Illinois Department of Revenue, "Sales Tax Rate - Machine Readable Files"
// (tax.illinois.gov/research/taxrates/sales-tax-rate-machine-readable-files.html):
// the jurisdiction-wide ordinance files effective 01/01/2026
// (ordmache-prior-010126.txt), 07/01/2026 (ordmache-prior.txt) and 08/01/2026
// (ordmache-current.txt), each of which also carries the prior rate and its
// date range, so 2025 is read from the 01/01/2026 file's current and prior
// fields. The figure is the General Merchandise High-Rate (field 6) minus the
// 6.25% state rate, so the 1% qualifying food/drug rate is excluded. Where
// the ordinance file sets the address over-ride flag and a zero rate
// (Naperville DuPage, Joliet Will, Peoria, Skokie, Springfield), the
// location's base rate is the R00 row of the matching Addendum Address File
// (ordmacha-*.txt); R01+ rows are business districts and are ignored. Each
// city's comment is the IDOR location ID, name and county. Split cities use
// the county portion holding most residents: Aurora (Kane), Naperville
// (DuPage), Joliet (Will), Elgin (Kane), Bolingbrook (Will), Schaumburg,
// Arlington Heights and Palatine (Cook); for Aurora, Naperville, Bolingbrook,
// Schaumburg the other main portions carry the same rate. The Northern
// Illinois Transit Authority raised its rate 0.25 point in Cook, DuPage,
// Kane, Lake, McHenry and Will counties on August 1, 2026, so those cities'
// 2026 figures are monthly. Cities: the 20 largest by Census Vintage 2025
// place estimates.
//
// Champaign rose 0.25 point on January 1, 2026; Springfield rose 0.5 point on
// July 1, 2026; the NITA 0.25-point increase took effect August 1, 2026 in
// the six collar counties. Rockford, Peoria, Decatur, Champaign, Springfield
// and Bloomington are outside those counties.
export default {
  [STATE_SALES_TAX]: 6.25,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [2.71, 2.71, 2.73, 2.73],
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 6.25,
    bands: [
      { min: 0, max: 20000, amounts: [356, 421, 466, 503, 532, 576] },
      { min: 20000, max: 30000, amounts: [485, 573, 633, 681, 722, 780] },
      { min: 30000, max: 40000, amounts: [548, 646, 714, 769, 813, 878] },
      { min: 40000, max: 50000, amounts: [600, 707, 781, 841, 891, 961] },
      { min: 50000, max: 60000, amounts: [646, 760, 840, 903, 957, 1033] },
      { min: 60000, max: 70000, amounts: [686, 806, 892, 959, 1015, 1096] },
      { min: 70000, max: 80000, amounts: [722, 849, 938, 1008, 1067, 1153] },
      { min: 80000, max: 90000, amounts: [755, 888, 981, 1054, 1116, 1204] },
      { min: 90000, max: 100000, amounts: [785, 923, 1020, 1097, 1161, 1253] },
      { min: 100000, max: 120000, amounts: [826, 971, 1071, 1152, 1220, 1316] },
      {
        min: 120000,
        max: 140000,
        amounts: [876, 1031, 1137, 1223, 1294, 1396],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [924, 1086, 1198, 1288, 1363, 1470],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [966, 1135, 1252, 1346, 1425, 1537],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1005, 1181, 1303, 1400, 1482, 1599],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1047, 1229, 1356, 1456, 1542, 1662],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1090, 1279, 1411, 1515, 1604, 1730],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1129, 1325, 1462, 1570, 1661, 1792],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1168, 1370, 1510, 1623, 1716, 1851],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1383, 1621, 1787, 1918, 2030, 2188],
      },
    ],
  },
  [CITIES]: {
    // 016-0001-1 CHICAGO, COOK
    [CHICAGO]: {
      [LOCAL_SALES_TAX]: [4, 4, 4, 4, 4, 4, 4, 4.25, 4.25, 4.25, 4.25, 4.25],
    },
    // 045-0002-4 AURORA, KANE
    [AURORA]: {
      [LOCAL_SALES_TAX]: [2, 2, 2, 2, 2, 2, 2, 2.25, 2.25, 2.25, 2.25, 2.25],
    },
    // 022-0018-1 NAPERVILLE, DUPAGE (R00 base)
    [NAPERVILLE]: {
      [LOCAL_SALES_TAX]: [
        1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.75, 1.75, 1.75, 1.75, 1.75,
      ],
    },
    // 099-0001-2 JOLIET, WILL (R00 base)
    [JOLIET]: {
      [LOCAL_SALES_TAX]: [
        2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.75, 2.75, 2.75, 2.75, 2.75,
      ],
    },
    [ROCKFORD]: { [LOCAL_SALES_TAX]: 2.5 }, // 101-0001-6 ROCKFORD, WINNEBAGO
    // 045-0009-1 ELGIN, KANE
    [ELGIN]: {
      [LOCAL_SALES_TAX]: [
        2.25, 2.25, 2.25, 2.25, 2.25, 2.25, 2.25, 2.5, 2.5, 2.5, 2.5, 2.5,
      ],
    },
    // 084-0001-6 SPRINGFIELD, SANGAMON (R00 base)
    [SPRINGFIELD]: { [LOCAL_SALES_TAX]: [3.5, 3.5, 4, 4] },
    // 072-0001-3 PEORIA, PEORIA (R00 base)
    [PEORIA]: { [LOCAL_SALES_TAX]: 2.75 },
    [CHAMPAIGN]: { [LOCAL_SALES_TAX]: 3 }, // 010-0005-5 CHAMPAIGN, CHAMPAIGN
    // 049-0001-4 WAUKEGAN, LAKE
    [WAUKEGAN]: {
      [LOCAL_SALES_TAX]: [
        2.25, 2.25, 2.25, 2.25, 2.25, 2.25, 2.25, 2.5, 2.5, 2.5, 2.5, 2.5,
      ],
    },
    // 016-0013-3 CICERO, COOK
    [CICERO]: {
      [LOCAL_SALES_TAX]: [
        4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.75, 4.75, 4.75, 4.75, 4.75,
      ],
    },
    [BLOOMINGTON]: { [LOCAL_SALES_TAX]: 3.5 }, // 057-0001-9 BLOOMINGTON, MCLEAN
    // 016-0116-4 SCHAUMBURG, COOK
    [SCHAUMBURG]: {
      [LOCAL_SALES_TAX]: [
        3.75, 3.75, 3.75, 3.75, 3.75, 3.75, 3.75, 4, 4, 4, 4, 4,
      ],
    },
    // 016-0018-4 EVANSTON, COOK
    [EVANSTON]: {
      [LOCAL_SALES_TAX]: [4, 4, 4, 4, 4, 4, 4, 4.25, 4.25, 4.25, 4.25, 4.25],
    },
    // 016-0003-6 ARLINGTON HEIGHTS, COOK
    [ARLINGTON_HEIGHTS]: {
      [LOCAL_SALES_TAX]: [
        3.75, 3.75, 3.75, 3.75, 3.75, 3.75, 3.75, 4, 4, 4, 4, 4,
      ],
    },
    // 099-0059-4 BOLINGBROOK, WILL
    [BOLINGBROOK]: {
      [LOCAL_SALES_TAX]: [
        2.25, 2.25, 2.25, 2.25, 2.25, 2.25, 2.25, 2.5, 2.5, 2.5, 2.5, 2.5,
      ],
    },
    [DECATUR]: { [LOCAL_SALES_TAX]: 3 }, // 058-0001-3 DECATUR, MACON
    // 016-0045-1 SKOKIE, COOK (R00 base)
    [SKOKIE]: {
      [LOCAL_SALES_TAX]: [4, 4, 4, 4, 4, 4, 4, 4.25, 4.25, 4.25, 4.25, 4.25],
    },
    // 016-0054-0 PALATINE, COOK
    [PALATINE]: {
      [LOCAL_SALES_TAX]: [
        3.75, 3.75, 3.75, 3.75, 3.75, 3.75, 3.75, 4, 4, 4, 4, 4,
      ],
    },
    // 016-0015-1 DES PLAINES, COOK
    [DES_PLAINES]: {
      [LOCAL_SALES_TAX]: [
        3.75, 3.75, 3.75, 3.75, 3.75, 3.75, 3.75, 4, 4, 4, 4, 4,
      ],
    },
  },
} as SalesTaxData;
