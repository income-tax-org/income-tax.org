import { INFINITY } from "@/constants";
import {
  CITIES,
  BLUE_SPRINGS,
  CAPE_GIRARDEAU,
  CHESTERFIELD,
  COLUMBIA,
  FLORISSANT,
  INDEPENDENCE,
  JEFFERSON_CITY,
  JOPLIN,
  KANSAS_CITY,
  LEES_SUMMIT,
  LIBERTY,
  O_FALLON,
  SPRINGFIELD,
  ST_CHARLES,
  ST_JOSEPH,
  ST_LOUIS,
  ST_PETERS,
  UNIVERSITY_CITY,
  WENTZVILLE,
  WILDWOOD,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Missouri Department of Revenue 'Sales and Use Tax Rate Tables' quarterly
// spreadsheets (dor.mo.gov/pdf/rates/2025/jan2025.xlsx, apr2025, july2025,
// oct2025; dor.mo.gov/pdf/rates/2026/jan2026.xlsx, apr2026, may2026,
// july2026, october2026), Sales Tax Rate column (the full combined rate,
// state included); local = that rate minus the 4.225% state rate. Each city's
// source is its DOR jurisdiction code (city-county-district). The '-000' city
// row is used, i.e. without Community Improvement, Transportation Development
// and similar site-specific districts. Cities split across counties use the
// county holding most residents (Census 2025 place-by-county estimates):
// Kansas City, Independence and Lee's Summit use Jackson County (Kansas
// City's row includes the Kansas City Zoological District), Joplin uses
// Jasper, Jefferson City uses Cole, Cape Girardeau uses Cape Girardeau
// County. Blue Springs uses its Central Jackson County Fire Protection
// District row (06652-095-001), the district that serves most of the city,
// per the City of Blue Springs and CJCFPD. Florissant uses its base row
// through Q3 2026 and the Florissant Valley FPD row from Q4 2026, when the
// FPD sales taxes approved in April 2026 first appear. The May 2026
// mid-quarter table matches April 2026 for every city listed. State rate
// 4.225% throughout.
//
// Florissant Q4 2026 adds the Florissant Valley Fire Protection District's 1%
// sales tax (Prop F, passed 2026-04-07); the Black Jack FPD portion of
// Florissant has the same 9.988% combined rate and the small remainder
// outside both stays 8.988%. Blue Springs Q4 2026 reflects the Central
// Jackson County FPD increase, confirmed by the City of Blue Springs' 'Sales
// and Property Tax Rates' page (9.225% for CJCFPD residents, 8.725% for
// Southern Jackson County FPD residents).
export default {
  [STATE_SALES_TAX]: 4.225,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: 4.22,
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 4.23,
    bands: [
      { min: 0, max: 20000, amounts: [263, 307, 337, 361, 381, 408] },
      { min: 20000, max: 30000, amounts: [363, 423, 465, 498, 525, 563] },
      { min: 30000, max: 40000, amounts: [411, 480, 528, 565, 596, 639] },
      { min: 40000, max: 50000, amounts: [452, 528, 580, 621, 655, 703] },
      { min: 50000, max: 60000, amounts: [487, 570, 626, 670, 707, 759] },
      { min: 60000, max: 70000, amounts: [519, 606, 666, 713, 753, 807] },
      { min: 70000, max: 80000, amounts: [547, 640, 703, 753, 793, 852] },
      { min: 80000, max: 90000, amounts: [574, 670, 736, 788, 832, 893] },
      { min: 90000, max: 100000, amounts: [598, 699, 768, 822, 866, 930] },
      { min: 100000, max: 120000, amounts: [630, 736, 808, 865, 913, 980] },
      { min: 120000, max: 140000, amounts: [670, 784, 861, 922, 972, 1044] },
      { min: 140000, max: 160000, amounts: [708, 828, 909, 973, 1027, 1102] },
      { min: 160000, max: 180000, amounts: [741, 867, 953, 1020, 1075, 1155] },
      { min: 180000, max: 200000, amounts: [773, 904, 993, 1063, 1121, 1203] },
      { min: 200000, max: 225000, amounts: [805, 942, 1035, 1108, 1169, 1254] },
      { min: 225000, max: 250000, amounts: [840, 982, 1080, 1156, 1219, 1308] },
      {
        min: 250000,
        max: 275000,
        amounts: [872, 1020, 1121, 1199, 1265, 1359],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [903, 1055, 1160, 1242, 1310, 1406],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1077, 1259, 1384, 1482, 1563, 1678],
      },
    ],
  },
  [CITIES]: {
    [KANSAS_CITY]: { [LOCAL_SALES_TAX]: 4.75 }, // DOR rate table 38000-095-000
    [ST_LOUIS]: { [LOCAL_SALES_TAX]: 5.454 }, // DOR rate table 65000-510-000
    [SPRINGFIELD]: { [LOCAL_SALES_TAX]: 3.875 }, // DOR rate table 70000-077-000
    [COLUMBIA]: { [LOCAL_SALES_TAX]: 3.75 }, // DOR rate table 15670-019-000
    // DOR rate table 35000-095-000
    [INDEPENDENCE]: { [LOCAL_SALES_TAX]: 4.375 },
    [LEES_SUMMIT]: { [LOCAL_SALES_TAX]: 4.25 }, // DOR rate table 41330-095-000
    [O_FALLON]: { [LOCAL_SALES_TAX]: 3.725 }, // DOR rate table 54074-183-000
    [ST_CHARLES]: { [LOCAL_SALES_TAX]: 3.725 }, // DOR rate table 64082-183-000
    [ST_JOSEPH]: { [LOCAL_SALES_TAX]: 5.475 }, // DOR rate table 64550-021-000
    // DOR rate table 06652-095-001
    [BLUE_SPRINGS]: { [LOCAL_SALES_TAX]: [4.5, 4.5, 4.5, 5] },
    [ST_PETERS]: { [LOCAL_SALES_TAX]: 3.725 }, // DOR rate table 65126-183-000
    [JOPLIN]: { [LOCAL_SALES_TAX]: 4.5 }, // DOR rate table 37592-097-000
    // DOR table 24778-189-000; Q4 2026 24778-189-004
    [FLORISSANT]: { [LOCAL_SALES_TAX]: [4.763, 4.763, 4.763, 5.763] },
    [WENTZVILLE]: { [LOCAL_SALES_TAX]: 4.225 }, // DOR rate table 78442-183-000
    // DOR rate table 13600-189-000
    [CHESTERFIELD]: { [LOCAL_SALES_TAX]: 4.513 },
    // DOR rate table 37000-051-000
    [JEFFERSON_CITY]: { [LOCAL_SALES_TAX]: 3.625 },
    // DOR rate table 11242-031-000
    [CAPE_GIRARDEAU]: { [LOCAL_SALES_TAX]: 4.25 },
    [WILDWOOD]: { [LOCAL_SALES_TAX]: 4.013 }, // DOR rate table 79820-189-000
    // DOR rate table 75220-189-000
    [UNIVERSITY_CITY]: { [LOCAL_SALES_TAX]: 5.013 },
    [LIBERTY]: { [LOCAL_SALES_TAX]: 5.625 }, // DOR rate table 42032-047-000
  },
} as SalesTaxData;
