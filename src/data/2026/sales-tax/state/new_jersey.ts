import { INFINITY } from "@/constants";
import {
  CITIES,
  BAYONNE,
  BRICK,
  CAMDEN,
  CHERRY_HILL,
  CLIFTON,
  EAST_ORANGE,
  EDISON,
  ELIZABETH,
  HAMILTON,
  JERSEY_CITY,
  LAKEWOOD,
  MIDDLETOWN,
  NEWARK,
  OLD_BRIDGE,
  PASSAIC,
  PATERSON,
  TOMS_RIVER,
  TRENTON,
  UNION_CITY,
  WOODBRIDGE,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// New Jersey Division of Taxation, "Sales and Use Tax" rate history
// (www.nj.gov/treasury/taxation/salestax.shtml, last updated 04/30/25):
// 6.625% from January 1, 2018. New Jersey has no general local sales tax, so
// every city's local rate is 0. Urban Enterprise Zone reduced rates (half the
// state rate, in Newark, Elizabeth, Paterson, Jersey City, Trenton, Camden,
// Bayonne, East Orange, Passaic, Union City and others) apply only to sales
// by certified UEZ sellers, and Salem County's reduced rate and Atlantic
// City's luxury and Cape May County tourism taxes are special-purpose, so all
// are excluded. City list: the 20 most populous New Jersey municipalities,
// which includes townships (Lakewood, Edison, Woodbridge, Toms River,
// Hamilton in Mercer County, Brick, Cherry Hill, Middletown, Old Bridge); the
// order near the bottom of the list is approximate and does not affect any
// rate.
//
// The Division's rate page (last updated 04/30/25) shows no change after
// 2018; no 2026 rate change was found.
export default {
  [STATE_SALES_TAX]: 6.625,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it. New Jersey's average is slightly below zero,
  // -0.02%, because its Urban Enterprise Zones halve the rate for some
  // sellers; a location here is charged the full state rate.
  [LOCAL_SALES_TAX]: 0,
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 6.63,
    bands: [
      { min: 0, max: 20000, amounts: [402, 451, 483, 508, 527, 556] },
      { min: 20000, max: 30000, amounts: [556, 624, 667, 702, 729, 768] },
      { min: 30000, max: 40000, amounts: [631, 708, 759, 797, 829, 872] },
      { min: 40000, max: 50000, amounts: [694, 779, 835, 877, 912, 960] },
      { min: 50000, max: 60000, amounts: [748, 841, 901, 947, 984, 1036] },
      { min: 60000, max: 70000, amounts: [797, 896, 960, 1008, 1048, 1104] },
      { min: 70000, max: 80000, amounts: [842, 944, 1013, 1064, 1106, 1165] },
      { min: 80000, max: 90000, amounts: [883, 990, 1061, 1115, 1160, 1221] },
      { min: 90000, max: 100000, amounts: [920, 1033, 1107, 1163, 1210, 1273] },
      {
        min: 100000,
        max: 120000,
        amounts: [969, 1088, 1166, 1226, 1274, 1342],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [1032, 1159, 1242, 1305, 1357, 1429],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1090, 1224, 1312, 1378, 1433, 1509],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1143, 1283, 1375, 1445, 1503, 1582],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1191, 1339, 1434, 1507, 1567, 1650],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1242, 1394, 1495, 1571, 1634, 1720],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1296, 1455, 1559, 1639, 1704, 1795],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1346, 1511, 1620, 1702, 1770, 1864],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1392, 1564, 1677, 1762, 1832, 1930],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1664, 1868, 2002, 2104, 2189, 2304],
      },
    ],
  },
  [CITIES]: {
    // No local sales tax; NJ Division of Taxation
    [NEWARK]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [JERSEY_CITY]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [PATERSON]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [ELIZABETH]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [LAKEWOOD]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [EDISON]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [WOODBRIDGE]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [TOMS_RIVER]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [HAMILTON]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [TRENTON]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [CLIFTON]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [CAMDEN]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [BRICK]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [CHERRY_HILL]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [PASSAIC]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [UNION_CITY]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [MIDDLETOWN]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [OLD_BRIDGE]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [BAYONNE]: { [LOCAL_SALES_TAX]: 0 },
    // No local sales tax; NJ Division of Taxation
    [EAST_ORANGE]: { [LOCAL_SALES_TAX]: 0 },
  },
} as SalesTaxData;
