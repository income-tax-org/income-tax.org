import { INFINITY } from "@/constants";
import {
  CITIES,
  AMMON,
  BOISE,
  CALDWELL,
  CHUBBUCK,
  COEUR_D_ALENE,
  EAGLE,
  HAYDEN,
  IDAHO_FALLS,
  JEROME,
  KUNA,
  LEWISTON,
  MERIDIAN,
  MOSCOW,
  MOUNTAIN_HOME,
  NAMPA,
  POCATELLO,
  POST_FALLS,
  REXBURG,
  STAR,
  TWIN_FALLS,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Idaho State Tax Commission. The state rate is 6% sales and use tax ("Sales
// and Use Taxes: Basics Guide", tax.idaho.gov/taxes/sales-use/online-guide/).
// Idaho counties levy no sales tax, and only resort cities may levy a local
// option sales tax; the Commission's "City Sales Taxes" page
// (tax.idaho.gov/taxes/sales-use/sales-tax/local-sales-tax/city-sales-tax/)
// lists every city that does: Bellevue, Bonners Ferry, Cascade, Crouch,
// Donnelly, Driggs, Hailey, Harrison, Irwin, Kellogg, Ketchum, Lava Hot
// Springs, Mackay, McCall, Ponderay, Riggins, Salmon, Sandpoint, Stanley, Sun
// Valley, Swan Valley, Tetonia and Victor. None of the 20 largest cities is
// on that list, so each local rate is 0. Auditorium district taxes (Boise,
// Coeur d'Alene, Idaho Falls, Pocatello and others) apply only to hotel and
// motel rooms and are excluded. Cities: the 20 largest by Census Vintage 2025
// place estimates (Boise is the Census place "Boise City").
export default {
  [STATE_SALES_TAX]: 6,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: 0.03,
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 6,
    bands: [
      { min: 0, max: 20000, amounts: [504, 611, 688, 747, 798, 871] },
      { min: 20000, max: 30000, amounts: [671, 813, 914, 994, 1061, 1158] },
      { min: 30000, max: 40000, amounts: [752, 911, 1023, 1112, 1187, 1295] },
      { min: 40000, max: 50000, amounts: [818, 991, 1113, 1210, 1292, 1409] },
      { min: 50000, max: 60000, amounts: [875, 1060, 1190, 1294, 1381, 1506] },
      { min: 60000, max: 70000, amounts: [926, 1121, 1258, 1368, 1460, 1591] },
      { min: 70000, max: 80000, amounts: [971, 1176, 1320, 1434, 1530, 1669] },
      { min: 80000, max: 90000, amounts: [1013, 1226, 1376, 1495, 1595, 1740] },
      {
        min: 90000,
        max: 100000,
        amounts: [1051, 1273, 1428, 1551, 1655, 1805],
      },
      {
        min: 100000,
        max: 120000,
        amounts: [1101, 1332, 1495, 1624, 1734, 1889],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [1165, 1410, 1581, 1717, 1832, 1998],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1223, 1480, 1658, 1802, 1922, 2095],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1276, 1543, 1730, 1879, 2005, 2184],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1324, 1601, 1796, 1950, 2080, 2267],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1374, 1661, 1863, 2022, 2157, 2351],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1426, 1724, 1933, 2099, 2239, 2439],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1475, 1783, 1999, 2170, 2315, 2523],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1521, 1838, 2061, 2237, 2387, 2600],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1782, 2152, 2411, 2617, 2791, 3040],
      },
    ],
  },
  [CITIES]: {
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [BOISE]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [MERIDIAN]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [NAMPA]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [CALDWELL]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [IDAHO_FALLS]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [POCATELLO]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [COEUR_D_ALENE]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [TWIN_FALLS]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [POST_FALLS]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [REXBURG]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [LEWISTON]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [EAGLE]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [KUNA]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [MOSCOW]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [STAR]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [AMMON]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [HAYDEN]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [CHUBBUCK]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [MOUNTAIN_HOME]: { [LOCAL_SALES_TAX]: 0 },
    // ISTC city sales tax list: not a resort-city taxing jurisdiction
    [JEROME]: { [LOCAL_SALES_TAX]: 0 },
  },
} as SalesTaxData;
