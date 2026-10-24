import { INFINITY } from "@/constants";
import {
  CITIES,
  AKRON,
  BEAVERCREEK,
  CANTON,
  CINCINNATI,
  CLEVELAND,
  COLUMBUS,
  CUYAHOGA_FALLS,
  DAYTON,
  DUBLIN,
  ELYRIA,
  HAMILTON,
  KETTERING,
  LAKEWOOD,
  LORAIN,
  MIDDLETOWN,
  NEWARK,
  PARMA,
  SPRINGFIELD,
  TOLEDO,
  YOUNGSTOWN,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// Ohio Department of Taxation rates as published in the Streamlined Sales Tax
// rate file OHR2026Q4SEP17.csv (effective-dated county permissive and transit
// authority rows, January 2025 through December 2026) and boundary file
// OHB2026Q4SEP17.zip (streamlinedsalestax.org/ratesandboundry/). Ohio has no
// municipal sales tax: the local rate is the county permissive rate plus any
// transit authority rate, and the boundary file was used to confirm which
// transit district covers each city's addresses. Cross-checked against the
// Department's 'Sales and Use Tax Rate Map, effective October 2026'
// (dam.assets.ohio.gov/image/upload/tax.ohio.gov/tax_analysis/tax_data_series/sales_and_use/Salestaxmap.pdf),
// whose county/transit/total columns agree. The Central Ohio Transit
// Authority rate rose from 0.5% to 1.0% on April 1, 2025 (LinkUS). Dublin
// uses its Franklin County portion (about 83% of residents; its Delaware and
// Union portions also carry the 1.0% COTA rate) and Middletown its Butler
// County portion (about 92%; the Warren County portion rose from 1.0% to 1.5%
// on October 1, 2026). Cities are the 20 most populous incorporated places in
// the Census Bureau's Vintage 2025 city estimates (SUB-EST2025).
//
// COTA (Columbus, Dublin) went from 0.5% to 1.0% on April 1, 2025.
export default {
  [STATE_SALES_TAX]: 5.75,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [1.483, 1.483, 1.55, 1.55],
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 5.75,
    bands: [
      { min: 0, max: 20000, amounts: [372, 420, 452, 476, 497, 525] },
      { min: 20000, max: 30000, amounts: [513, 580, 625, 658, 686, 724] },
      { min: 30000, max: 40000, amounts: [583, 659, 709, 747, 779, 823] },
      { min: 40000, max: 50000, amounts: [641, 724, 780, 822, 856, 905] },
      { min: 50000, max: 60000, amounts: [692, 782, 841, 887, 924, 976] },
      { min: 60000, max: 70000, amounts: [736, 832, 896, 944, 984, 1039] },
      { min: 70000, max: 80000, amounts: [777, 878, 945, 996, 1038, 1097] },
      { min: 80000, max: 90000, amounts: [814, 920, 990, 1044, 1088, 1150] },
      { min: 90000, max: 100000, amounts: [849, 960, 1033, 1089, 1134, 1198] },
      {
        min: 100000,
        max: 120000,
        amounts: [894, 1010, 1088, 1147, 1195, 1262],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [953, 1077, 1159, 1221, 1273, 1345],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1005, 1136, 1223, 1290, 1344, 1420],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1054, 1191, 1282, 1352, 1409, 1488],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1099, 1242, 1336, 1410, 1469, 1552],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1146, 1295, 1393, 1469, 1530, 1617],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1194, 1351, 1453, 1531, 1596, 1686],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1240, 1403, 1509, 1590, 1657, 1751],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1284, 1451, 1562, 1646, 1715, 1812],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1532, 1733, 1864, 1965, 2047, 2163],
      },
    ],
  },
  [CITIES]: {
    // SST OH Franklin 049 1.25 + COTA 25000
    [COLUMBUS]: { [LOCAL_SALES_TAX]: [1.75, 2.25, 2.25, 2.25] },
    // SST OH Cuyahoga 035 1.25 + GCRTA 18000 1.0
    [CLEVELAND]: { [LOCAL_SALES_TAX]: 2.25 },
    // SST OH Hamilton 061 1.25 + SORTA 31000 0.8
    [CINCINNATI]: { [LOCAL_SALES_TAX]: 2.05 },
    // SST OH Lucas 095 1.5 + TARTA 48000 0.5
    [TOLEDO]: { [LOCAL_SALES_TAX]: 2 },
    // SST OH Summit 153 0.5 + METRO 77000 0.5
    [AKRON]: { [LOCAL_SALES_TAX]: 1 },
    // SST OH Montgomery 113 1.25 + GDRTA 57000 0.5
    [DAYTON]: { [LOCAL_SALES_TAX]: 1.75 },
    // SST OH Cuyahoga 035 1.25 + GCRTA 18000 1.0
    [PARMA]: { [LOCAL_SALES_TAX]: 2.25 },
    // SST OH Stark 151 0.5 + SARTA 76000 0.25
    [CANTON]: { [LOCAL_SALES_TAX]: 0.75 },
    [LORAIN]: { [LOCAL_SALES_TAX]: 0.75 }, // SST OH Lorain 093 0.75
    [HAMILTON]: { [LOCAL_SALES_TAX]: 0.75 }, // SST OH Butler 017 0.75
    // SST OH Mahoning 099 1.5 + WRTA 50000 0.25
    [YOUNGSTOWN]: { [LOCAL_SALES_TAX]: 1.75 },
    [SPRINGFIELD]: { [LOCAL_SALES_TAX]: 1.5 }, // SST OH Clark 023 1.5
    // SST OH Montgomery 113 1.25 + GDRTA 57000 0.5
    [KETTERING]: { [LOCAL_SALES_TAX]: 1.75 },
    [ELYRIA]: { [LOCAL_SALES_TAX]: 0.75 }, // SST OH Lorain 093 0.75
    // SST OH Butler 017 0.75 (Butler portion)
    [MIDDLETOWN]: { [LOCAL_SALES_TAX]: 0.75 },
    [NEWARK]: { [LOCAL_SALES_TAX]: 1.5 }, // SST OH Licking 089 1.5
    // SST OH Summit 153 0.5 + METRO 77000 0.5
    [CUYAHOGA_FALLS]: { [LOCAL_SALES_TAX]: 1 },
    // SST OH Franklin 049 1.25 + COTA 25000 (Franklin portion)
    [DUBLIN]: { [LOCAL_SALES_TAX]: [1.75, 2.25, 2.25, 2.25] },
    // SST OH Cuyahoga 035 1.25 + GCRTA 18000 1.0
    [LAKEWOOD]: { [LOCAL_SALES_TAX]: 2.25 },
    [BEAVERCREEK]: { [LOCAL_SALES_TAX]: 1 }, // SST OH Greene 057 1.0
  },
} as SalesTaxData;
