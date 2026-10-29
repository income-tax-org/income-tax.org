import { INFINITY } from "@/constants";
import {
  CITIES,
  ALEXANDRIA,
  BATON_ROUGE,
  BOSSIER_CITY,
  CENTRAL,
  HAMMOND,
  HOUMA,
  KENNER,
  LAFAYETTE,
  LAKE_CHARLES,
  MONROE,
  NATCHITOCHES,
  NEW_IBERIA,
  NEW_ORLEANS,
  RUSTON,
  SHREVEPORT,
  SLIDELL,
  SULPHUR,
  THIBODAUX,
  YOUNGSVILLE,
  ZACHARY,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Louisiana Department of Revenue Parish E-File rate lookup
// (parishe-file.revenue.louisiana.gov/lookup/lookup.aspx), which shows the
// local sales tax rate columns on each parish collector's return for every
// monthly filing period; each month from January 2025 through December 2026
// was read. Local = the 'Tax Rate' of the column for the city's own
// jurisdiction, which already combines every parish, city, school board, law
// enforcement and district levy collected by that parish's single collector.
// Economic development district (EDD), TIF, food/drug, parking and hotel
// columns are excluded. Cities spanning parishes use the parish where most
// residents live (Shreveport: Caddo; Kenner and Jefferson Parish use the
// parish-wide 'All Other Areas' column, cross-checked with the Jefferson
// Parish Sheriff's 1/1/2025 rate table). State rate per LDR. Slidell
// cross-checked against SalesTaxHandbook/Avalara (9.63% combined). Cities are
// the ~20 most populous Louisiana incorporated places by Census Vintage 2024
// estimates (Census-designated places such as Metairie and Prairieville are
// not incorporated and are omitted).
//
// New Iberia's rate (Iberia Parish column A) rose from 5.25% to 5.5% with the
// July 2025 filing period. Slidell's 4.63% is printed that way on the St.
// Tammany return (school 2% + city 2.38% + law enforcement 0.25%, per LATA),
// not 4.625%. Kenner has no city levy of its own beyond the parish-wide 4.75%
// (JPSO rate table: parish council 2.5% + school board 2% + law enforcement
// 0.25%); the Kenner airport and North 1300 Veterans districts are excluded
// as small special districts.
export default {
  // Louisiana's state rate rose from 4.45% to 5% on January 1, 2025,
  // scheduled to run until December 31, 2029 (LDR FAQ 'What is the state
  // sales tax rate?', revenue.louisiana.gov; Act 11 of the 2024 Third
  // Extraordinary Session). It is 5% for all of 2025 and 2026.
  [STATE_SALES_TAX]: 5,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [5.116, 5.116, 5.11, 5.11],
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 5,
    bands: [
      { min: 0, max: 20000, amounts: [313, 356, 386, 409, 427, 453] },
      { min: 20000, max: 30000, amounts: [434, 494, 535, 567, 592, 629] },
      { min: 30000, max: 40000, amounts: [493, 563, 609, 645, 674, 715] },
      { min: 40000, max: 50000, amounts: [543, 620, 671, 711, 743, 788] },
      { min: 50000, max: 60000, amounts: [587, 670, 726, 768, 803, 852] },
      { min: 60000, max: 70000, amounts: [625, 714, 774, 818, 856, 908] },
      { min: 70000, max: 80000, amounts: [661, 754, 817, 865, 905, 960] },
      { min: 80000, max: 90000, amounts: [693, 791, 857, 907, 948, 1006] },
      { min: 90000, max: 100000, amounts: [722, 825, 893, 946, 989, 1050] },
      { min: 100000, max: 120000, amounts: [762, 871, 943, 997, 1044, 1107] },
      { min: 120000, max: 140000, amounts: [812, 928, 1005, 1063, 1113, 1181] },
      { min: 140000, max: 160000, amounts: [858, 980, 1062, 1124, 1176, 1248] },
      {
        min: 160000,
        max: 180000,
        amounts: [900, 1028, 1114, 1180, 1234, 1309],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [939, 1074, 1163, 1231, 1287, 1367],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [980, 1119, 1213, 1284, 1343, 1425],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1022, 1168, 1265, 1341, 1402, 1488],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1062, 1214, 1315, 1393, 1457, 1546],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1100, 1257, 1361, 1442, 1509, 1601],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1317, 1505, 1631, 1728, 1806, 1918],
      },
    ],
  },
  [CITIES]: {
    // Orleans Parish return col A Sales Tax
    [NEW_ORLEANS]: { [LOCAL_SALES_TAX]: 5 },
    // East Baton Rouge return col A Baton Rouge
    [BATON_ROUGE]: { [LOCAL_SALES_TAX]: 5.5 },
    // Caddo Parish return col A Shreveport
    [SHREVEPORT]: { [LOCAL_SALES_TAX]: 4.6 },
    // Lafayette Parish return col 1 City of Lafayette
    [LAFAYETTE]: { [LOCAL_SALES_TAX]: 4 },
    // Calcasieu Parish return col B Lake Charles
    [LAKE_CHARLES]: { [LOCAL_SALES_TAX]: 5.75 },
    // Jefferson Parish General Sales col B All Other Areas
    [KENNER]: { [LOCAL_SALES_TAX]: 4.75 },
    // Bossier Parish return col A Bossier City
    [BOSSIER_CITY]: { [LOCAL_SALES_TAX]: 5 },
    // Ouachita Parish return col 2 City of Monroe
    [MONROE]: { [LOCAL_SALES_TAX]: 5.99 },
    // Rapides Parish return col A Alexandria
    [ALEXANDRIA]: { [LOCAL_SALES_TAX]: 5.5 },
    // Terrebonne Parish return col A Parish of Terrebonne
    [HOUMA]: { [LOCAL_SALES_TAX]: 5.5 },
    // Iberia Parish return col A New Iberia
    [NEW_IBERIA]: { [LOCAL_SALES_TAX]: [5.25, 5.25, 5.5, 5.5] },
    // East Baton Rouge return col G City of Central
    [CENTRAL]: { [LOCAL_SALES_TAX]: 6 },
    [SLIDELL]: { [LOCAL_SALES_TAX]: 4.63 }, // St. Tammany return col B Slidell
    // Lincoln Parish return col B City of Ruston
    [RUSTON]: { [LOCAL_SALES_TAX]: 6 },
    // Tangipahoa Parish return col 13 City of Hammond
    [HAMMOND]: { [LOCAL_SALES_TAX]: 5.5 },
    // Calcasieu Parish return col C Sulphur
    [SULPHUR]: { [LOCAL_SALES_TAX]: 5.75 },
    // East Baton Rouge return col F City of Zachary
    [ZACHARY]: { [LOCAL_SALES_TAX]: 5.5 },
    // Lafayette Parish return col 13 Youngsville
    [YOUNGSVILLE]: { [LOCAL_SALES_TAX]: 5.5 },
    // Natchitoches Parish return col B Natchitoches
    [NATCHITOCHES]: { [LOCAL_SALES_TAX]: 5.5 },
    // Lafourche Parish return col B Thibodaux
    [THIBODAUX]: { [LOCAL_SALES_TAX]: 5.35 },
  },
} as SalesTaxData;
