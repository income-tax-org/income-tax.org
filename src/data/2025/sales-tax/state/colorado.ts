import { INFINITY } from "@/constants";
import {
  CITIES,
  ARVADA,
  AURORA,
  BOULDER,
  BROOMFIELD,
  CASTLE_ROCK,
  CENTENNIAL,
  COLORADO_SPRINGS,
  COMMERCE_CITY,
  DENVER,
  FORT_COLLINS,
  GLENDALE,
  GRAND_JUNCTION,
  GREELEY,
  GREENWOOD_VILLAGE,
  LAKEWOOD,
  LITTLETON,
  LONGMONT,
  LOVELAND,
  PARKER,
  PUEBLO,
  SHERIDAN,
  THORNTON,
  WESTMINSTER,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Colorado Department of Revenue: DR 1002 'Colorado Sales/Use Tax Rates',
// July 2026 edition (the Data Studio publication linked from
// tax.colorado.gov/DR1002: Home Rule Cities, State-Collected County Sales Tax
// and Special Districts pages), and CDOR's 'Sales Tax Rate Changes' lists for
// 2025-01-01, 2025-07-01, 2026-01-01 (Wayback Machine copies of
// tax.colorado.gov/sales-tax-rate-changes) and 2026-07-01, used to carry
// rates back through 2025. Local = home-rule city rate (self-collected) +
// county rate + every areawide district: RTD 1% and Scientific & Cultural
// Facilities District 0.1% across the Denver metro district boundaries
// (Castle Rock is outside both), Pikes Peak RTA 1% in Colorado Springs, Mesa
// County Public Safety Improvements 0.37% in Grand Junction, South Adams
// County FPD 0.5% in Commerce City from 2026. Cities split across counties
// use the county holding most residents (Census 2025 place-by-county
// estimates): Arapahoe for Aurora and Littleton, Adams for Westminster and
// Thornton, Jefferson for Arvada, Boulder for Longmont. Excluded:
// food-for-home and restaurant/liquor rates, lodging taxes, site-specific
// Public Improvement Fees, local improvement districts (e.g. the Southeast
// Jefferson LID covering parts of Lakewood and Littleton) and metropolitan
// districts. Colorado Springs cross-checked against the city's own breakdown
// (8.2% combined); Centennial against the City of Centennial's breakdown
// (6.75% combined). State rate 2.9% throughout.
//
// Denver (4.81% to 5.15%) and Castle Rock (4.0% to 4.2%) raised their city
// rates on 2025-01-01, so the whole year is at the new rates. CDOR's July
// 2025 change list has no rate change for any listed city, county or
// district. Home-rule city rates for 2025 are the July 2026 DR 1002 rates
// carried back through CDOR's change lists, which record home-rule changes
// only as cities report them; Fort Collins (4.35% since 2024), Grand Junction
// (3.39% since July 2023), Littleton (3.75% since 2022) and Colorado Springs
// (3.07% since 2021) were confirmed separately from city sources.
export default {
  [STATE_SALES_TAX]: 2.9,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [4.957, 4.957, 4.96, 4.96],
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 2.9,
    bands: [
      { min: 0, max: 20000, amounts: [170, 197, 216, 232, 244, 261] },
      { min: 20000, max: 30000, amounts: [233, 271, 297, 317, 334, 357] },
      { min: 30000, max: 40000, amounts: [263, 307, 336, 358, 378, 405] },
      { min: 40000, max: 50000, amounts: [289, 336, 369, 394, 414, 445] },
      { min: 50000, max: 60000, amounts: [312, 363, 397, 425, 447, 478] },
      { min: 60000, max: 70000, amounts: [331, 386, 422, 451, 475, 509] },
      { min: 70000, max: 80000, amounts: [349, 406, 445, 475, 501, 536] },
      { min: 80000, max: 90000, amounts: [366, 426, 466, 498, 524, 562] },
      { min: 90000, max: 100000, amounts: [381, 443, 485, 519, 546, 585] },
      { min: 100000, max: 120000, amounts: [400, 466, 511, 545, 575, 615] },
      { min: 120000, max: 140000, amounts: [427, 496, 543, 581, 611, 655] },
      { min: 140000, max: 160000, amounts: [449, 523, 573, 612, 645, 691] },
      { min: 160000, max: 180000, amounts: [470, 547, 600, 641, 675, 723] },
      { min: 180000, max: 200000, amounts: [491, 571, 626, 668, 704, 754] },
      { min: 200000, max: 225000, amounts: [511, 594, 651, 696, 732, 785] },
      { min: 225000, max: 250000, amounts: [532, 619, 678, 725, 763, 818] },
      { min: 250000, max: 275000, amounts: [551, 642, 704, 752, 792, 848] },
      { min: 275000, max: 300000, amounts: [571, 664, 728, 778, 819, 877] },
      { min: 300000, max: INFINITY, amounts: [678, 790, 865, 924, 974, 1043] },
    ],
  },
  [CITIES]: {
    [DENVER]: { [LOCAL_SALES_TAX]: 6.25 }, // Denver 5.15 + RTD 1 + CD 0.1
    // City 3.07 + El Paso 1.23 + Pikes Peak RTA 1
    [COLORADO_SPRINGS]: { [LOCAL_SALES_TAX]: 5.3 },
    // City 3.75 + Arapahoe 0.25 + RTD 1 + CD 0.1
    [AURORA]: { [LOCAL_SALES_TAX]: 5.1 },
    // City 4.35 + Larimer 0.8 (1.05 from 2026)
    [FORT_COLLINS]: { [LOCAL_SALES_TAX]: 5.15 },
    // City 3 + Jefferson 0.5 + RTD 1 + CD 0.1
    [LAKEWOOD]: { [LOCAL_SALES_TAX]: 4.6 },
    // City 3.75 + Adams 0.75 + RTD 1 + CD 0.1
    [THORNTON]: { [LOCAL_SALES_TAX]: 5.6 },
    // City 3.46 + Jefferson 0.5 + RTD 1 + CD 0.1
    [ARVADA]: { [LOCAL_SALES_TAX]: 5.06 },
    // City 3.85 (4.25 from 2026) + Adams 0.75 + RTD + CD
    [WESTMINSTER]: { [LOCAL_SALES_TAX]: 5.7 },
    // City 4.11; Weld County levies no sales tax
    [GREELEY]: { [LOCAL_SALES_TAX]: 4.11 },
    [PUEBLO]: { [LOCAL_SALES_TAX]: 4.7 }, // City 3.7 + Pueblo County 1
    // City 2.5 + Arapahoe 0.25 + RTD 1 + CD 0.1
    [CENTENNIAL]: { [LOCAL_SALES_TAX]: 3.85 },
    // City 3.86 + Boulder Co 1.185 (1.335 2026) + RTD + CD
    [BOULDER]: { [LOCAL_SALES_TAX]: 6.145 },
    // City 3.53 + Boulder Co 1.185 (1.335 2026) + RTD + CD
    [LONGMONT]: { [LOCAL_SALES_TAX]: 5.815 },
    // Town 4.2 + Douglas 1 (no RTD/CD)
    [CASTLE_ROCK]: { [LOCAL_SALES_TAX]: 5.2 },
    // City 3 + Larimer 0.8 (1.05 from 2026)
    [LOVELAND]: { [LOCAL_SALES_TAX]: 3.8 },
    // City/county 4.15 + RTD 1 + CD 0.1
    [BROOMFIELD]: { [LOCAL_SALES_TAX]: 5.25 },
    // City 4.5 + Adams 0.75 + RTD + CD (+ SACFPD 0.5 2026)
    [COMMERCE_CITY]: { [LOCAL_SALES_TAX]: 6.35 },
    // City 3.39 + Mesa 2 + Mesa County PSI 0.37
    [GRAND_JUNCTION]: { [LOCAL_SALES_TAX]: 5.76 },
    [PARKER]: { [LOCAL_SALES_TAX]: 5.1 }, // Town 3 + Douglas 1 + RTD 1 + CD 0.1
    // City 3.75 + Arapahoe 0.25 + RTD 1 + CD 0.1
    [LITTLETON]: { [LOCAL_SALES_TAX]: 5.1 },
    // City 3.75 + Arapahoe 0.25 + RTD 1 + CD 0.1
    [GLENDALE]: { [LOCAL_SALES_TAX]: 5.1 },
    // City 3 + Arapahoe 0.25 + RTD 1 + CD 0.1
    [GREENWOOD_VILLAGE]: { [LOCAL_SALES_TAX]: 4.35 },
    // City 3.5 + Arapahoe 0.25 + RTD 1 + CD 0.1
    [SHERIDAN]: { [LOCAL_SALES_TAX]: 4.85 },
  },
} as SalesTaxData;
