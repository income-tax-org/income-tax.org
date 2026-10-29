import { INFINITY } from "@/constants";
import {
  CITIES,
  AMARILLO,
  ARLINGTON,
  AUSTIN,
  BROWNSVILLE,
  CORPUS_CHRISTI,
  DALLAS,
  DENTON,
  EL_PASO,
  FORT_WORTH,
  FRISCO,
  GARLAND,
  GRAND_PRAIRIE,
  HOUSTON,
  IRVING,
  KILLEEN,
  LAREDO,
  LUBBOCK,
  MCKINNEY,
  PLANO,
  SAN_ANTONIO,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Texas Comptroller of Public Accounts. Quarterly EDI sales tax rate files
// taxrates251.txt through taxrates263.txt and the current taxrates.txt (2026
// Q4) from comptroller.texas.gov/data/edi/sales-tax/ (state rate 0.0625 in
// every file header), cross-checked against the Comptroller's "Texas Sales
// and Use Tax Rates - October 2026" list
// (comptroller.texas.gov/taxes/sales/docs/city-rates.pdf) and the quarterly
// rate-change notices (comptroller.texas.gov/taxes/sales/quarterly-updates/).
// Local = city + county + special purpose district + transit rates for the
// city's own local code; every city listed sits at the 2% local cap (8.25%
// total) in every quarter of 2025 and 2026. Where a city spans counties
// (Houston, Dallas, Fort Worth, Plano, Frisco, Garland, Grand Prairie,
// Amarillo, Austin, Corpus Christi), the principal county portion is used
// (Harris, Dallas, Tarrant, Collin, Potter, Travis, Nueces); Fort Worth's
// small Parker and Wise County annex areas are handled by combined areas but
// are also capped at 8.25% total. Cities are the 20 most populous Texas
// incorporated places by Census Vintage 2024 estimates.
//
// San Antonio: city 1.25% + VIA MTA 0.5% + Advanced Transportation District
// 0.25% = 2%. The EDI taxrates file carries only one transit column and omits
// the ATD, so the San Antonio total was taken from the Comptroller's
// published total rate (8.25%), not summed from that file.
export default {
  [STATE_SALES_TAX]: 6.25,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [1.951, 1.951, 1.95, 1.95],
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 6.25,
    bands: [
      { min: 0, max: 20000, amounts: [388, 452, 496, 529, 557, 596] },
      { min: 20000, max: 30000, amounts: [535, 624, 682, 729, 768, 823] },
      { min: 30000, max: 40000, amounts: [607, 708, 775, 828, 871, 933] },
      { min: 40000, max: 50000, amounts: [668, 778, 852, 910, 958, 1026] },
      { min: 50000, max: 60000, amounts: [721, 839, 919, 981, 1033, 1106] },
      { min: 60000, max: 70000, amounts: [768, 893, 978, 1045, 1100, 1177] },
      { min: 70000, max: 80000, amounts: [809, 942, 1032, 1102, 1160, 1242] },
      { min: 80000, max: 90000, amounts: [849, 987, 1082, 1155, 1216, 1301] },
      { min: 90000, max: 100000, amounts: [885, 1029, 1127, 1203, 1266, 1356] },
      {
        min: 100000,
        max: 120000,
        amounts: [931, 1084, 1187, 1267, 1334, 1428],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [992, 1155, 1264, 1350, 1421, 1520],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1047, 1219, 1334, 1425, 1500, 1605],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1098, 1277, 1398, 1493, 1571, 1682],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1145, 1331, 1458, 1557, 1638, 1754],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1193, 1387, 1519, 1622, 1707, 1827],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1244, 1447, 1584, 1691, 1780, 1905],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1292, 1502, 1645, 1756, 1848, 1978],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1336, 1555, 1702, 1817, 1912, 2046],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1595, 1854, 2030, 2167, 2281, 2440],
      },
    ],
  },
  [CITIES]: {
    // Comptroller rate files, Houston 2101017
    [HOUSTON]: { [LOCAL_SALES_TAX]: 2 },
    // Comptroller rate files, San Antonio 2015012
    [SAN_ANTONIO]: { [LOCAL_SALES_TAX]: 2 },
    // Comptroller rate files, Dallas 2057011
    [DALLAS]: { [LOCAL_SALES_TAX]: 2 },
    // Comptroller rate files, Fort Worth 2220031
    [FORT_WORTH]: { [LOCAL_SALES_TAX]: 2 },
    // Comptroller rate files, Austin 2227016
    [AUSTIN]: { [LOCAL_SALES_TAX]: 2 },
    // Comptroller rate files, El Paso 2071013
    [EL_PASO]: { [LOCAL_SALES_TAX]: 2 },
    // Comptroller rate files, Arlington 2220095
    [ARLINGTON]: { [LOCAL_SALES_TAX]: 2 },
    // Comptroller rate files, Corpus Christi 2178015
    [CORPUS_CHRISTI]: { [LOCAL_SALES_TAX]: 2 },
    [PLANO]: { [LOCAL_SALES_TAX]: 2 }, // Comptroller rate files, Plano 2043018
    // Comptroller rate files, Lubbock 2152015
    [LUBBOCK]: { [LOCAL_SALES_TAX]: 2 },
    // Comptroller rate files, Laredo 2240019
    [LAREDO]: { [LOCAL_SALES_TAX]: 2 },
    // Comptroller rate files, Irving 2057066
    [IRVING]: { [LOCAL_SALES_TAX]: 2 },
    // Comptroller rate files, Garland 2057173
    [GARLAND]: { [LOCAL_SALES_TAX]: 2 },
    // Comptroller rate files, Frisco 2043036
    [FRISCO]: { [LOCAL_SALES_TAX]: 2 },
    // Comptroller rate files, McKinney 2043045
    [MCKINNEY]: { [LOCAL_SALES_TAX]: 2 },
    // Comptroller rate files, Grand Prairie 2220013
    [GRAND_PRAIRIE]: { [LOCAL_SALES_TAX]: 2 },
    // Comptroller rate files, Amarillo 2188013
    [AMARILLO]: { [LOCAL_SALES_TAX]: 2 },
    // Comptroller rate files, Brownsville 2031076
    [BROWNSVILLE]: { [LOCAL_SALES_TAX]: 2 },
    // Comptroller rate files, Killeen 2014022
    [KILLEEN]: { [LOCAL_SALES_TAX]: 2 },
    // Comptroller rate files, Denton 2061024
    [DENTON]: { [LOCAL_SALES_TAX]: 2 },
  },
} as SalesTaxData;
