import { INFINITY } from "@/constants";
import {
  CITIES,
  AIKEN,
  ANDERSON,
  BLUFFTON,
  CHARLESTON,
  COLUMBIA,
  CONWAY,
  FLORENCE,
  FORT_MILL,
  GOOSE_CREEK,
  GREENVILLE,
  GREER,
  HILTON_HEAD_ISLAND,
  MAULDIN,
  MOUNT_PLEASANT,
  MYRTLE_BEACH,
  NORTH_CHARLESTON,
  ROCK_HILL,
  SPARTANBURG,
  SUMMERVILLE,
  SUMTER,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// South Carolina Department of Revenue, ST-575 "South Carolina Sales Tax Rate
// by Municipality" (Rev. 8/13/25, via the Internet Archive, and Rev. 2/5/26,
// dor.sc.gov/sites/dor/files/forms/ST575.pdf), Total Tax Rate column; the two
// editions agree for every city here. Dates of changes come from SCDOR's
// Local Sales Taxes page (dor.sc.gov/sales-use-tax-index/local-sales-taxes),
// both the October 2025 version (Beaufort County's Green Space tax expired
// March 1, 2025, 7% to 6%; Sumter County added a Capital Projects tax May 1,
// 2025, 7% to 8%; Horry's Capital Projects tax expired and a Transportation
// tax replaced it May 1, 2025, rate stays 8%) and the current version (2026
// changes: Lexington School District tax extended March 1, 2026, and Aiken
// Capital Projects reimposed May 1, 2026, rates unchanged). Local = Total Tax
// Rate minus the 6% state rate. Myrtle Beach includes the city's 1% Tourism
// Development tax, which SCDOR collects on general retail sales. Cities in
// more than one county use the county with most residents: Charleston, North
// Charleston and Mount Pleasant (Charleston County), Columbia (Richland),
// Summerville (Dorchester), Goose Creek (Berkeley), Greer (Greenville).
// Reduced unprepared-food rates and accommodations taxes are excluded.
//
// Beaufort County (Hilton Head Island, Bluffton) fell from 7% to 6% on March
// 1, 2025 when its Green Space tax expired; Sumter rose from 7% to 8% on May
// 1, 2025 with a new Capital Projects tax. Greer is split between Greenville
// (6%) and Spartanburg (7%) counties; Census 2025 estimates put 35,669 of its
// 50,007 residents in Greenville County, so the Greenville rate is used.
export default {
  [STATE_SALES_TAX]: 6,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [1.499, 1.499, 1.49, 1.49],
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 6,
    bands: [
      { min: 0, max: 20000, amounts: [351, 402, 437, 462, 484, 514] },
      { min: 20000, max: 30000, amounts: [484, 555, 601, 637, 667, 708] },
      { min: 30000, max: 40000, amounts: [549, 629, 682, 723, 757, 803] },
      { min: 40000, max: 50000, amounts: [604, 692, 749, 794, 832, 883] },
      { min: 50000, max: 60000, amounts: [652, 745, 808, 857, 897, 952] },
      { min: 60000, max: 70000, amounts: [694, 794, 860, 912, 955, 1014] },
      { min: 70000, max: 80000, amounts: [732, 838, 908, 962, 1006, 1068] },
      { min: 80000, max: 90000, amounts: [767, 877, 951, 1007, 1054, 1119] },
      { min: 90000, max: 100000, amounts: [799, 914, 991, 1050, 1099, 1167] },
      { min: 100000, max: 120000, amounts: [842, 963, 1044, 1106, 1157, 1229] },
      {
        min: 120000,
        max: 140000,
        amounts: [897, 1026, 1111, 1177, 1232, 1308],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [947, 1083, 1173, 1242, 1300, 1380],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [991, 1134, 1229, 1302, 1362, 1446],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1034, 1182, 1281, 1357, 1420, 1508],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1078, 1232, 1334, 1415, 1480, 1571],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1123, 1285, 1392, 1475, 1543, 1638],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1166, 1333, 1445, 1530, 1602, 1700],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1206, 1380, 1495, 1584, 1657, 1759],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1439, 1645, 1782, 1888, 1975, 2097],
      },
    ],
  },
  [CITIES]: {
    // SCDOR ST-575: Charleston (Charleston County) 9%
    [CHARLESTON]: { [LOCAL_SALES_TAX]: 3 },
    // SCDOR ST-575: Columbia (Richland County) 8%
    [COLUMBIA]: { [LOCAL_SALES_TAX]: 2 },
    // SCDOR ST-575: North Charleston (Charleston County) 9%
    [NORTH_CHARLESTON]: { [LOCAL_SALES_TAX]: 3 },
    // SCDOR ST-575: Mount Pleasant (Charleston County) 9%
    [MOUNT_PLEASANT]: { [LOCAL_SALES_TAX]: 3 },
    // SCDOR ST-575: Rock Hill (York County) 7%
    [ROCK_HILL]: { [LOCAL_SALES_TAX]: 1 },
    // SCDOR ST-575: Greenville (Greenville County) 6%
    [GREENVILLE]: { [LOCAL_SALES_TAX]: 0 },
    // SCDOR ST-575: Summerville (Dorchester County) 7%
    [SUMMERVILLE]: { [LOCAL_SALES_TAX]: 1 },
    // SCDOR ST-575: Goose Creek (Berkeley County) 9%
    [GOOSE_CREEK]: { [LOCAL_SALES_TAX]: 3 },
    // SCDOR ST-575: Sumter (Sumter County) 8%
    [SUMTER]: { [LOCAL_SALES_TAX]: [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2] },
    // SCDOR ST-575: Myrtle Beach (Horry County) 9%
    [MYRTLE_BEACH]: { [LOCAL_SALES_TAX]: 3 },
    // SCDOR ST-575: Florence (Florence County) 8%
    [FLORENCE]: { [LOCAL_SALES_TAX]: 2 },
    // SCDOR ST-575: Greer (Greenville County) 6%
    [GREER]: { [LOCAL_SALES_TAX]: 0 },
    // SCDOR ST-575: Spartanburg (Spartanburg County) 7%
    [SPARTANBURG]: { [LOCAL_SALES_TAX]: 1 },
    // SCDOR ST-575: Hilton Head Island (Beaufort County) 6%
    [HILTON_HEAD_ISLAND]: {
      [LOCAL_SALES_TAX]: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    // SCDOR ST-575: Bluffton (Beaufort County) 6%
    [BLUFFTON]: { [LOCAL_SALES_TAX]: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    [AIKEN]: { [LOCAL_SALES_TAX]: 2 }, // SCDOR ST-575: Aiken (Aiken County) 8%
    // SCDOR ST-575: Anderson (Anderson County) 7%
    [ANDERSON]: { [LOCAL_SALES_TAX]: 1 },
    // SCDOR ST-575: Fort Mill (York County) 7%
    [FORT_MILL]: { [LOCAL_SALES_TAX]: 1 },
    // SCDOR ST-575: Conway (Horry County) 8%
    [CONWAY]: { [LOCAL_SALES_TAX]: 2 },
    // SCDOR ST-575: Mauldin (Greenville County) 6%
    [MAULDIN]: { [LOCAL_SALES_TAX]: 0 },
  },
} as SalesTaxData;
