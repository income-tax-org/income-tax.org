import { INFINITY } from "@/constants";
import {
  CITIES,
  BARRE,
  BARRE_TOWN,
  BENNINGTON,
  BRATTLEBORO,
  BURLINGTON,
  COLCHESTER,
  ESSEX,
  ESSEX_JUNCTION,
  HARTFORD,
  MIDDLEBURY,
  MILTON,
  MONTPELIER,
  RUTLAND,
  SHELBURNE,
  SOUTH_BURLINGTON,
  SPRINGFIELD,
  ST_ALBANS_TOWN,
  ST_JOHNSBURY,
  WILLISTON,
  WINOOSKI,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// Vermont Department of Taxes, 'Local Option Tax' page
// (tax.vermont.gov/business/local-option-tax), table 'Municipalities that
// have a 1% Local Option Sales Tax' with each municipality's effective date;
// a municipality not on that list levies no local sales tax. Cross-checked
// against the Streamlined Sales Tax rate file VTR2026Q4AUG20.csv
// (streamlinedsalestax.org/ratesandboundry/Rates/), whose effective-dated
// rows by Census county subdivision code agree. Vermont's municipalities are
// towns and cities (county subdivisions), so the cities are the 20 most
// populous county subdivisions in the Census Bureau's Vintage 2025 estimates
// (SUB-EST2025), not just incorporated 'places'. Rutland and Barre are the
// cities (Rutland Town also levies 1%; Barre Town does not); Essex is the
// town, separate from the City of Essex Junction since 2022; St. Albans is
// listed as the town (the city, slightly smaller, also levies 1%). The Town
// of Hartford includes White River Junction and Quechee. State rate 6%.
export default {
  [STATE_SALES_TAX]: 6,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [0.39, 0.39, 0.43, 0.43],
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 6,
    bands: [
      { min: 0, max: 20000, amounts: [270, 292, 306, 317, 325, 336] },
      { min: 20000, max: 30000, amounts: [373, 403, 421, 436, 448, 463] },
      { min: 30000, max: 40000, amounts: [422, 457, 478, 495, 508, 525] },
      { min: 40000, max: 50000, amounts: [465, 503, 526, 544, 558, 577] },
      { min: 50000, max: 60000, amounts: [502, 542, 568, 587, 602, 623] },
      { min: 60000, max: 70000, amounts: [533, 577, 604, 625, 641, 662] },
      { min: 70000, max: 80000, amounts: [563, 608, 638, 659, 675, 699] },
      { min: 80000, max: 90000, amounts: [590, 638, 667, 690, 708, 732] },
      { min: 90000, max: 100000, amounts: [614, 664, 696, 719, 738, 763] },
      { min: 100000, max: 120000, amounts: [647, 700, 733, 758, 777, 803] },
      { min: 120000, max: 140000, amounts: [690, 745, 780, 806, 828, 856] },
      { min: 140000, max: 160000, amounts: [727, 786, 824, 851, 873, 903] },
      { min: 160000, max: 180000, amounts: [763, 825, 863, 892, 915, 947] },
      { min: 180000, max: 200000, amounts: [795, 859, 900, 930, 954, 987] },
      { min: 200000, max: 225000, amounts: [829, 896, 937, 969, 994, 1028] },
      { min: 225000, max: 250000, amounts: [863, 933, 978, 1010, 1037, 1072] },
      { min: 250000, max: 275000, amounts: [897, 969, 1015, 1049, 1077, 1113] },
      {
        min: 275000,
        max: 300000,
        amounts: [928, 1003, 1050, 1086, 1113, 1152],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1106, 1196, 1252, 1294, 1327, 1373],
      },
    ],
  },
  [CITIES]: {
    [BURLINGTON]: { [LOCAL_SALES_TAX]: 1 }, // VT LOT list
    [SOUTH_BURLINGTON]: { [LOCAL_SALES_TAX]: 1 }, // VT LOT list
    [COLCHESTER]: { [LOCAL_SALES_TAX]: 1 }, // VT LOT list
    [RUTLAND]: { [LOCAL_SALES_TAX]: 1 }, // VT LOT list: Rutland City
    // VT LOT list (not listed: no local sales tax)
    [BENNINGTON]: { [LOCAL_SALES_TAX]: 0 },
    [BRATTLEBORO]: { [LOCAL_SALES_TAX]: 1 }, // VT LOT list
    // VT LOT list (not listed: no local sales tax): Essex (town)
    [ESSEX]: { [LOCAL_SALES_TAX]: 0 },
    // VT LOT list: City of Essex Junction
    [ESSEX_JUNCTION]: { [LOCAL_SALES_TAX]: 1 },
    [HARTFORD]: { [LOCAL_SALES_TAX]: 1 }, // VT LOT list
    // VT LOT list (not listed: no local sales tax)
    [MILTON]: { [LOCAL_SALES_TAX]: 0 },
    [WILLISTON]: { [LOCAL_SALES_TAX]: 1 }, // VT LOT list
    [MIDDLEBURY]: { [LOCAL_SALES_TAX]: 1 }, // VT LOT list
    // VT LOT list (not listed: no local sales tax)
    [SPRINGFIELD]: { [LOCAL_SALES_TAX]: 0 },
    [WINOOSKI]: { [LOCAL_SALES_TAX]: 1 }, // VT LOT list
    [BARRE]: { [LOCAL_SALES_TAX]: 1 }, // VT LOT list: Barre City
    [SHELBURNE]: { [LOCAL_SALES_TAX]: 1 }, // VT LOT list
    // VT LOT list (not listed: no local sales tax): Barre Town
    [BARRE_TOWN]: { [LOCAL_SALES_TAX]: 0 },
    [MONTPELIER]: { [LOCAL_SALES_TAX]: 1 }, // VT LOT list
    // VT LOT list (not listed: no local sales tax)
    [ST_JOHNSBURY]: { [LOCAL_SALES_TAX]: 0 },
    [ST_ALBANS_TOWN]: { [LOCAL_SALES_TAX]: 1 }, // VT LOT list: St. Albans Town
  },
} as SalesTaxData;
