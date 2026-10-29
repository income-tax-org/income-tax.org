import { INFINITY } from "@/constants";
import {
  CITIES,
  ALEXANDRIA,
  BLACKSBURG,
  CHARLOTTESVILLE,
  CHESAPEAKE,
  DANVILLE,
  FREDERICKSBURG,
  HAMPTON,
  HARRISONBURG,
  LEESBURG,
  LYNCHBURG,
  MANASSAS,
  NEWPORT_NEWS,
  NORFOLK,
  PETERSBURG,
  PORTSMOUTH,
  RICHMOND,
  ROANOKE,
  SUFFOLK,
  VIRGINIA_BEACH,
  WINCHESTER,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Virginia Tax, "Sales and Use Tax Rates by Locality by Date" workbook
// (www.tax.virginia.gov/sites/default/files/inline-files/sales-and-use-tax-rates-by-locality-by-date.xlsx),
// sheets "July 1, 2023 - December 31, 2025" and "January 1, 2026 - Present",
// General Sales column, cross-checked with the rate table on
// www.tax.virginia.gov/retail-sales-and-use-tax. The general rate is 4.3%
// state plus the 1% local option tax levied in every locality (5.3%
// statewide), plus 0.7% in the Central Virginia, Hampton Roads and Northern
// Virginia regions (6%), 1% more in the Historic Triangle (7%), or a 1% local
// school-construction tax in a few localities including Danville (6.3%). The
// 1% local option tax is levied in every locality, so it is counted with the
// 4.3% state rate as a 5.3% statewide rate (matching the Tax Foundation
// figures used for unlisted cities); each city's local figure is the
// locality's general rate minus 5.3%; no locality's general rate differs
// between the two sheets, so 2025 and 2026 match. Independent cities are
// their own localities; the towns Leesburg and Blacksburg take Loudoun and
// Montgomery County's rates. Arlington is excluded because it is a county
// (Census CDP), not an incorporated place. The reduced 1% state grocery rate
// is excluded.
export default {
  // Virginia's 4.3% state rate plus the 1% local option tax that every
  // locality levies (Code of Virginia 58.1-605), treated together as the 5.3%
  // statewide rate, as the Tax Foundation does; locals are the extra regional
  // (0.7%), Historic Triangle or school-construction (1%) taxes on top.
  [STATE_SALES_TAX]: 5.3,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [0.471, 0.471, 0.47, 0.47],
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 4.3,
    bands: [
      { min: 0, max: 20000, amounts: [241, 276, 301, 319, 334, 356] },
      { min: 20000, max: 30000, amounts: [332, 381, 414, 440, 461, 491] },
      { min: 30000, max: 40000, amounts: [377, 433, 470, 499, 523, 557] },
      { min: 40000, max: 50000, amounts: [414, 475, 516, 548, 575, 611] },
      { min: 50000, max: 60000, amounts: [447, 513, 557, 591, 619, 660] },
      { min: 60000, max: 70000, amounts: [475, 545, 592, 630, 659, 702] },
      { min: 70000, max: 80000, amounts: [502, 575, 625, 663, 696, 740] },
      { min: 80000, max: 90000, amounts: [525, 602, 655, 696, 729, 776] },
      { min: 90000, max: 100000, amounts: [547, 628, 682, 724, 760, 808] },
      { min: 100000, max: 120000, amounts: [577, 661, 719, 763, 800, 851] },
      { min: 120000, max: 140000, amounts: [613, 704, 765, 812, 851, 907] },
      { min: 140000, max: 160000, amounts: [648, 743, 807, 857, 899, 957] },
      { min: 160000, max: 180000, amounts: [678, 779, 846, 899, 941, 1002] },
      { min: 180000, max: 200000, amounts: [708, 811, 883, 936, 982, 1045] },
      { min: 200000, max: 225000, amounts: [737, 846, 919, 976, 1023, 1089] },
      { min: 225000, max: 250000, amounts: [769, 883, 959, 1018, 1066, 1135] },
      { min: 250000, max: 275000, amounts: [798, 916, 995, 1056, 1107, 1179] },
      { min: 275000, max: 300000, amounts: [826, 948, 1030, 1093, 1146, 1220] },
      {
        min: 300000,
        max: INFINITY,
        amounts: [985, 1129, 1227, 1303, 1366, 1453],
      },
    ],
  },
  [CITIES]: {
    // VA Tax locality workbook: Virginia Beach 51810, 6.0%
    [VIRGINIA_BEACH]: { [LOCAL_SALES_TAX]: 0.7 },
    // VA Tax locality workbook: Chesapeake 51550, 6.0%
    [CHESAPEAKE]: { [LOCAL_SALES_TAX]: 0.7 },
    // VA Tax locality workbook: Norfolk 51710, 6.0%
    [NORFOLK]: { [LOCAL_SALES_TAX]: 0.7 },
    // VA Tax locality workbook: Richmond City 51760, 6.0%
    [RICHMOND]: { [LOCAL_SALES_TAX]: 0.7 },
    // VA Tax locality workbook: Newport News 51700, 6.0%
    [NEWPORT_NEWS]: { [LOCAL_SALES_TAX]: 0.7 },
    // VA Tax locality workbook: Alexandria 51510, 6.0%
    [ALEXANDRIA]: { [LOCAL_SALES_TAX]: 0.7 },
    // VA Tax locality workbook: Hampton 51650, 6.0%
    [HAMPTON]: { [LOCAL_SALES_TAX]: 0.7 },
    // VA Tax locality workbook: Roanoke City 51770, 5.3%
    [ROANOKE]: { [LOCAL_SALES_TAX]: 0 },
    // VA Tax locality workbook: Suffolk 51800, 6.0%
    [SUFFOLK]: { [LOCAL_SALES_TAX]: 0.7 },
    // VA Tax locality workbook: Portsmouth 51740, 6.0%
    [PORTSMOUTH]: { [LOCAL_SALES_TAX]: 0.7 },
    // VA Tax locality workbook: Lynchburg 51680, 5.3%
    [LYNCHBURG]: { [LOCAL_SALES_TAX]: 0 },
    // VA Tax locality workbook: Harrisonburg 51660, 5.3%
    [HARRISONBURG]: { [LOCAL_SALES_TAX]: 0 },
    // VA Tax locality workbook: Loudoun 51107, 6.0%
    [LEESBURG]: { [LOCAL_SALES_TAX]: 0.7 },
    // VA Tax locality workbook: Charlottesville 51540, 5.3%
    [CHARLOTTESVILLE]: { [LOCAL_SALES_TAX]: 0 },
    // VA Tax locality workbook: Montgomery 51121, 5.3%
    [BLACKSBURG]: { [LOCAL_SALES_TAX]: 0 },
    // VA Tax locality workbook: Danville 51590, 6.3%
    [DANVILLE]: { [LOCAL_SALES_TAX]: 1 },
    // VA Tax locality workbook: Manassas 51683, 6.0%
    [MANASSAS]: { [LOCAL_SALES_TAX]: 0.7 },
    // VA Tax locality workbook: Petersburg 51730, 5.3%
    [PETERSBURG]: { [LOCAL_SALES_TAX]: 0 },
    // VA Tax locality workbook: Fredericksburg 51630, 5.3%
    [FREDERICKSBURG]: { [LOCAL_SALES_TAX]: 0 },
    // VA Tax locality workbook: Winchester 51840, 5.3%
    [WINCHESTER]: { [LOCAL_SALES_TAX]: 0 },
  },
} as SalesTaxData;
