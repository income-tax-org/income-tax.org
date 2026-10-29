import { INFINITY } from "@/constants";
import {
  CITIES,
  APEX,
  ASHEVILLE,
  BURLINGTON,
  CARY,
  CHAPEL_HILL,
  CHARLOTTE,
  CONCORD,
  DURHAM,
  FAYETTEVILLE,
  GASTONIA,
  GREENSBORO,
  GREENVILLE,
  HIGH_POINT,
  HUNTERSVILLE,
  JACKSONVILLE,
  KANNAPOLIS,
  MOORESVILLE,
  RALEIGH,
  WAKE_FOREST,
  WILMINGTON,
  WINSTON_SALEM,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// North Carolina Department of Revenue, "Historical Total General State,
// Local, and Transit Sales and Use Tax Rates" (columns 7/1/2024 - 6/30/2026
// and 7/1/2026 - Current) and "Current Sales and Use Tax Rates (Effective
// July 1, 2026)", both under
// www.ncdor.gov/taxes-forms/sales-and-use-tax/sales-and-use-tax-rates,
// cross-checked with the "Effective Dates of Local and Transit Sales and Use
// Tax Rates" chart. Rates are set by county; each city takes its county's
// total rate minus the 4.75% state rate, which includes the 0.5% transit tax
// in Durham, Mecklenburg, Orange and Wake. The only change in 2025-2026 is
// Mecklenburg County's additional 1% local tax effective July 1, 2026 (NCDOR
// Important Notice of 3-2-2026), taking Charlotte and Huntersville from 7.25%
// to 8.25%. Cities spanning counties use the county where most residents
// live: Durham (Durham County), Cary (Wake), High Point (Guilford), Chapel
// Hill (Orange), Burlington (Alamance), Wake Forest (Wake); Kannapolis's
// Cabarrus and Rowan portions are both 7%. Local prepared-meal taxes are
// excluded.
//
// Mecklenburg County's additional 1% local sales tax took effect July 1, 2026
// (Charlotte, Huntersville).
export default {
  [STATE_SALES_TAX]: 4.75,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [2.25, 2.25, 2.35, 2.35],
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 4.75,
    bands: [
      { min: 0, max: 20000, amounts: [345, 413, 460, 497, 528, 573] },
      { min: 20000, max: 30000, amounts: [465, 555, 617, 667, 709, 768] },
      { min: 30000, max: 40000, amounts: [522, 624, 694, 748, 795, 862] },
      { min: 40000, max: 50000, amounts: [570, 680, 757, 817, 867, 939] },
      { min: 50000, max: 60000, amounts: [611, 729, 810, 875, 929, 1007] },
      { min: 60000, max: 70000, amounts: [648, 772, 859, 927, 984, 1066] },
      { min: 70000, max: 80000, amounts: [680, 811, 902, 974, 1034, 1120] },
      { min: 80000, max: 90000, amounts: [711, 847, 941, 1017, 1080, 1169] },
      { min: 90000, max: 100000, amounts: [738, 879, 978, 1055, 1121, 1214] },
      { min: 100000, max: 120000, amounts: [774, 923, 1026, 1107, 1175, 1273] },
      { min: 120000, max: 140000, amounts: [821, 977, 1087, 1172, 1245, 1348] },
      {
        min: 140000,
        max: 160000,
        amounts: [862, 1028, 1142, 1232, 1308, 1417],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [901, 1072, 1192, 1286, 1365, 1479],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [936, 1115, 1238, 1336, 1419, 1536],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [973, 1158, 1287, 1388, 1474, 1594],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1010, 1203, 1336, 1442, 1530, 1657],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1046, 1245, 1383, 1493, 1584, 1715],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1080, 1286, 1428, 1541, 1635, 1769],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1271, 1512, 1679, 1811, 1921, 2079],
      },
    ],
  },
  [CITIES]: {
    // NCDOR county rates: Mecklenburg County
    [CHARLOTTE]: { [LOCAL_SALES_TAX]: [2.5, 2.5, 3.5, 3.5] },
    [RALEIGH]: { [LOCAL_SALES_TAX]: 2.5 }, // NCDOR county rates: Wake County
    // NCDOR county rates: Guilford County
    [GREENSBORO]: { [LOCAL_SALES_TAX]: 2 },
    [DURHAM]: { [LOCAL_SALES_TAX]: 2.75 }, // NCDOR county rates: Durham County
    // NCDOR county rates: Forsyth County
    [WINSTON_SALEM]: { [LOCAL_SALES_TAX]: 2.25 },
    // NCDOR county rates: Cumberland County
    [FAYETTEVILLE]: { [LOCAL_SALES_TAX]: 2.25 },
    [CARY]: { [LOCAL_SALES_TAX]: 2.5 }, // NCDOR county rates: Wake County
    // NCDOR county rates: New Hanover County
    [WILMINGTON]: { [LOCAL_SALES_TAX]: 2.25 },
    // NCDOR county rates: Guilford County
    [HIGH_POINT]: { [LOCAL_SALES_TAX]: 2 },
    // NCDOR county rates: Cabarrus County
    [CONCORD]: { [LOCAL_SALES_TAX]: 2.25 },
    // NCDOR county rates: Buncombe County
    [ASHEVILLE]: { [LOCAL_SALES_TAX]: 2.25 },
    // NCDOR county rates: Pitt County
    [GREENVILLE]: { [LOCAL_SALES_TAX]: 2.25 },
    // NCDOR county rates: Gaston County
    [GASTONIA]: { [LOCAL_SALES_TAX]: 2.25 },
    // NCDOR county rates: Onslow County
    [JACKSONVILLE]: { [LOCAL_SALES_TAX]: 2.25 },
    [APEX]: { [LOCAL_SALES_TAX]: 2.5 }, // NCDOR county rates: Wake County
    // NCDOR county rates: Mecklenburg County
    [HUNTERSVILLE]: { [LOCAL_SALES_TAX]: [2.5, 2.5, 3.5, 3.5] },
    // NCDOR county rates: Orange County
    [CHAPEL_HILL]: { [LOCAL_SALES_TAX]: 2.75 },
    // NCDOR county rates: Alamance County
    [BURLINGTON]: { [LOCAL_SALES_TAX]: 2 },
    // NCDOR county rates: Cabarrus County
    [KANNAPOLIS]: { [LOCAL_SALES_TAX]: 2.25 },
    // NCDOR county rates: Iredell County
    [MOORESVILLE]: { [LOCAL_SALES_TAX]: 2 },
    // NCDOR county rates: Wake County
    [WAKE_FOREST]: { [LOCAL_SALES_TAX]: 2.5 },
  },
} as SalesTaxData;
