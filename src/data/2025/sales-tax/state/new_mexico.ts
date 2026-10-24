import { INFINITY } from "@/constants";
import {
  CITIES,
  ALAMOGORDO,
  ALBUQUERQUE,
  ARTESIA,
  CARLSBAD,
  CLOVIS,
  DEMING,
  ESPANOLA,
  FARMINGTON,
  GALLUP,
  HOBBS,
  LAS_CRUCES,
  LAS_VEGAS,
  LOS_LUNAS,
  LOVINGTON,
  PORTALES,
  RIO_RANCHO,
  ROSWELL,
  SANTA_FE,
  SILVER_CITY,
  SUNLAND_PARK,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// New Mexico Taxation and Revenue Department (TRD), 'Gross Receipts and
// Compensating Tax Rate Schedule' for each half-year: 'January - June 2025
// rate schedule vF.pdf', 'July 1 2025 - June 30 2026 GRT_CMP Rate
// Schedule.pdf', 'January 1, 2026 - June 30 2026 GRT_CMP Rate Schedule
// Update.pdf' (TRD public file host
// klvg4oyd4j.execute-api.us-west-2.amazonaws.com/prod/PublicFiles/...), and
// the July 1, 2026 - June 30, 2027 schedule (Sierra County's posted copy).
// New Mexico levies a gross receipts tax on the seller, customarily passed on
// to buyers; state rate 4.875% all of 2025-2026. Local = the municipality's
// location-code rate minus 4.875%, so it includes the county GRT increments
// that apply inside the city. Cities in two counties use the portion where
// most residents live: Rio Rancho uses its Sandoval County code 29-524
// (7.4375%, vs 7.875% in Bernalillo), Espanola its Rio Arriba code 17-215
// (8.6875%, vs 8.8125% in Santa Fe County). TIF/TIDD sub-districts are
// ignored (they carry the city rate). Cities are the 20 most populous
// incorporated places in the Census Vintage 2025 subcounty estimates. The
// July 2026 rates were also checked against TRD's own copy of that schedule,
// 'July 1, 2026 - December 31, 2026 GRT_CMP Rate Schedule ADA accessible
// v20260526.xlsx' (realfile.tax.newmexico.gov), which matches for all 20
// cities.
//
// July 1 2025 increases: Las Cruces 8.065% -> 8.39%, Roswell 7.8958% ->
// 8.2708%, Portales 7.9375% -> 8.55% (TRD notice 'New tax and fee changes
// beginning July 1', June 4 2025). Rates like 7.8958 are TRD's 4-decimal
// roundings of 1/48-percent increments.
export default {
  [STATE_SALES_TAX]: 4.875,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [2.752, 2.752, 2.79, 2.79],
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 4.88,
    bands: [
      { min: 0, max: 20000, amounts: [366, 413, 444, 467, 486, 513] },
      { min: 20000, max: 30000, amounts: [509, 575, 617, 650, 676, 714] },
      { min: 30000, max: 40000, amounts: [580, 655, 704, 740, 771, 812] },
      { min: 40000, max: 50000, amounts: [639, 721, 775, 817, 849, 896] },
      { min: 50000, max: 60000, amounts: [691, 780, 838, 883, 918, 968] },
      { min: 60000, max: 70000, amounts: [737, 832, 894, 940, 979, 1033] },
      { min: 70000, max: 80000, amounts: [779, 878, 944, 994, 1035, 1091] },
      { min: 80000, max: 90000, amounts: [817, 922, 990, 1043, 1086, 1145] },
      { min: 90000, max: 100000, amounts: [852, 962, 1034, 1088, 1132, 1194] },
      {
        min: 100000,
        max: 120000,
        amounts: [899, 1015, 1090, 1148, 1194, 1259],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [959, 1083, 1163, 1224, 1274, 1344],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1015, 1145, 1229, 1294, 1347, 1420],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1064, 1200, 1290, 1358, 1414, 1490],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1111, 1253, 1347, 1418, 1476, 1555],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1159, 1307, 1405, 1479, 1539, 1623],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1210, 1365, 1466, 1544, 1607, 1694],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1257, 1419, 1524, 1605, 1670, 1760],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1302, 1470, 1578, 1661, 1730, 1823],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1561, 1761, 1892, 1992, 2073, 2186],
      },
    ],
  },
  [CITIES]: {
    // TRD GRT rate schedule, Albuquerque 02-100
    [ALBUQUERQUE]: { [LOCAL_SALES_TAX]: 2.75 },
    // TRD GRT rate schedule, Las Cruces 07-105
    [LAS_CRUCES]: { [LOCAL_SALES_TAX]: [3.19, 3.19, 3.515, 3.515] },
    // TRD GRT rate schedule, Rio Rancho (Sandoval) 29-524
    [RIO_RANCHO]: { [LOCAL_SALES_TAX]: 2.5625 },
    // TRD GRT rate schedule, Santa Fe (city) 01-123
    [SANTA_FE]: { [LOCAL_SALES_TAX]: 3.3125 },
    // TRD GRT rate schedule, Roswell 04-101
    [ROSWELL]: { [LOCAL_SALES_TAX]: [3.0208, 3.0208, 3.3958, 3.3958] },
    // TRD GRT rate schedule, Farmington 16-121
    [FARMINGTON]: { [LOCAL_SALES_TAX]: 3.3125 },
    // TRD GRT rate schedule, Hobbs 06-111
    [HOBBS]: { [LOCAL_SALES_TAX]: 1.6875 },
    // TRD GRT rate schedule, Clovis 05-103
    [CLOVIS]: { [LOCAL_SALES_TAX]: 3.0625 },
    // TRD GRT rate schedule, Carlsbad 03-106
    [CARLSBAD]: { [LOCAL_SALES_TAX]: 2.5208 },
    // TRD GRT rate schedule, Alamogordo 15-116
    [ALAMOGORDO]: { [LOCAL_SALES_TAX]: 3.3125 },
    // TRD GRT rate schedule, Los Lunas 14-316
    [LOS_LUNAS]: { [LOCAL_SALES_TAX]: 3.55 },
    // TRD GRT rate schedule, Gallup 13-114
    [GALLUP]: { [LOCAL_SALES_TAX]: 3.1875 },
    // TRD GRT rate schedule, Sunland Park 07-416
    [SUNLAND_PARK]: { [LOCAL_SALES_TAX]: 3.315 },
    // TRD GRT rate schedule, Deming 19-113
    [DEMING]: { [LOCAL_SALES_TAX]: 3.375 },
    // TRD GRT rate schedule, Artesia 03-205
    [ARTESIA]: { [LOCAL_SALES_TAX]: 2.7708 },
    // TRD GRT rate schedule, Las Vegas 12-122
    [LAS_VEGAS]: { [LOCAL_SALES_TAX]: 3.2708 },
    // TRD GRT rate schedule, Portales 11-119
    [PORTALES]: { [LOCAL_SALES_TAX]: [3.0625, 3.0625, 3.675, 3.675] },
    // TRD GRT rate schedule, Lovington 06-405
    [LOVINGTON]: { [LOCAL_SALES_TAX]: 2.125 },
    // TRD GRT rate schedule, Espanola (Rio Arriba) 17-215
    [ESPANOLA]: { [LOCAL_SALES_TAX]: 3.8125 },
    // TRD GRT rate schedule, Silver City 08-107
    [SILVER_CITY]: { [LOCAL_SALES_TAX]: 3.2375 },
  },
} as SalesTaxData;
