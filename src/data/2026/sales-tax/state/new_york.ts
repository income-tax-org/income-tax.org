import { INFINITY } from "@/constants";
import {
  CITIES,
  ALBANY,
  BINGHAMTON,
  BUFFALO,
  FREEPORT,
  HEMPSTEAD,
  ITHACA,
  KIRYAS_JOEL,
  LONG_BEACH,
  MOUNT_VERNON,
  NEW_ROCHELLE,
  NEW_YORK_CITY,
  NIAGARA_FALLS,
  ROCHESTER,
  SCHENECTADY,
  SPRING_VALLEY,
  SYRACUSE,
  TROY,
  UTICA,
  VALLEY_STREAM,
  WHITE_PLAINS,
  YONKERS,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// New York State Department of Taxation and Finance, Publication 718, "New
// York State Sales and Use Tax Rates by Jurisdiction" (edition 2/25,
// effective March 1, 2025, still the current edition in October 2026;
// www.tax.ny.gov/pdf/publications/sales/pub718.pdf), cross-checked against
// Publication 718-A "Enactment and Effective Dates of Sales and Use Tax
// Rates" (12/25) and the Department's locality rate change notices
// (forms/locality_rate_changes.htm), whose only 2025-2026 notice is ST-25-1
// (Suffolk County, March 1, 2025), which affects none of these cities. Each
// city's local figure is its Pub 718 combined rate minus the 4% state rate;
// it includes the 3/8% Metropolitan Commuter Transportation District rate
// where it applies (New York City = 4.5% city + 0.375% MCTD; Westchester,
// Nassau, Rockland). Cities that do not impose their own tax take their
// county's rate. Hempstead, Freeport, Valley Stream, Spring Valley and Kiryas
// Joel are incorporated villages (Census incorporated places), not the larger
// towns of the same name. City list: the largest incorporated places by
// recent Census estimates; the order near the bottom of the list is
// approximate. Kiryas Joel (Census 2025 estimate 47,147) replaces Rome, which
// has fallen out of the top 20.
export default {
  [STATE_SALES_TAX]: 4,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: 4.54,
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 4,
    bands: [
      { min: 0, max: 20000, amounts: [246, 274, 292, 307, 318, 334] },
      { min: 20000, max: 30000, amounts: [339, 379, 404, 423, 440, 462] },
      { min: 30000, max: 40000, amounts: [386, 431, 460, 481, 500, 525] },
      { min: 40000, max: 50000, amounts: [425, 473, 506, 530, 549, 577] },
      { min: 50000, max: 60000, amounts: [458, 511, 545, 572, 593, 624] },
      { min: 60000, max: 70000, amounts: [487, 544, 581, 609, 633, 664] },
      { min: 70000, max: 80000, amounts: [515, 575, 613, 643, 667, 701] },
      { min: 80000, max: 90000, amounts: [539, 602, 643, 674, 700, 734] },
      { min: 90000, max: 100000, amounts: [563, 628, 670, 703, 729, 766] },
      { min: 100000, max: 120000, amounts: [592, 661, 707, 740, 769, 807] },
      { min: 120000, max: 140000, amounts: [631, 705, 753, 789, 819, 860] },
      { min: 140000, max: 160000, amounts: [666, 744, 795, 834, 865, 908] },
      { min: 160000, max: 180000, amounts: [699, 780, 834, 873, 907, 952] },
      { min: 180000, max: 200000, amounts: [729, 813, 869, 911, 945, 993] },
      { min: 200000, max: 225000, amounts: [760, 848, 906, 950, 986, 1035] },
      { min: 225000, max: 250000, amounts: [792, 885, 945, 991, 1029, 1080] },
      { min: 250000, max: 275000, amounts: [823, 919, 982, 1029, 1068, 1121] },
      { min: 275000, max: 300000, amounts: [852, 952, 1016, 1065, 1106, 1161] },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1018, 1136, 1214, 1273, 1321, 1387],
      },
    ],
  },
  [CITIES]: {
    // Pub 718: New York City 8 7/8%, code 8081
    [NEW_YORK_CITY]: { [LOCAL_SALES_TAX]: 4.875 },
    // Pub 718: Erie County 8 3/4%, code 1451
    [BUFFALO]: { [LOCAL_SALES_TAX]: 4.75 },
    // Pub 718: Yonkers (city) 8 7/8%, code 6511
    [YONKERS]: { [LOCAL_SALES_TAX]: 4.875 },
    // Pub 718: Monroe County 8%, code 2611
    [ROCHESTER]: { [LOCAL_SALES_TAX]: 4 },
    // Pub 718: Onondaga County 8%, code 3121
    [SYRACUSE]: { [LOCAL_SALES_TAX]: 4 },
    [ALBANY]: { [LOCAL_SALES_TAX]: 4 }, // Pub 718: Albany County 8%, code 0181
    // Pub 718: New Rochelle (city) 8 3/8%, code 6861
    [NEW_ROCHELLE]: { [LOCAL_SALES_TAX]: 4.375 },
    // Pub 718: Mount Vernon (city) 8 3/8%, code 5521
    [MOUNT_VERNON]: { [LOCAL_SALES_TAX]: 4.375 },
    // Pub 718: Schenectady County 8%, code 4241
    [SCHENECTADY]: { [LOCAL_SALES_TAX]: 4 },
    // Pub 718: Utica (city) 8 3/4%, code 3018
    [UTICA]: { [LOCAL_SALES_TAX]: 4.75 },
    // Pub 718: White Plains (city) 8 3/8%, code 6513
    [WHITE_PLAINS]: { [LOCAL_SALES_TAX]: 4.375 },
    // Pub 718: Nassau County 8 5/8%, code 2811 (village)
    [HEMPSTEAD]: { [LOCAL_SALES_TAX]: 4.625 },
    // Pub 718: Rensselaer County 8%, code 3881
    [TROY]: { [LOCAL_SALES_TAX]: 4 },
    // Pub 718: Niagara County 8%, code 2911
    [NIAGARA_FALLS]: { [LOCAL_SALES_TAX]: 4 },
    // Pub 718: Orange County 8 1/8%, code 3321 (village)
    [KIRYAS_JOEL]: { [LOCAL_SALES_TAX]: 4.125 },
    // Pub 718: Broome County 8%, code 0321
    [BINGHAMTON]: { [LOCAL_SALES_TAX]: 4 },
    // Pub 718: Nassau County 8 5/8%, code 2811 (village)
    [FREEPORT]: { [LOCAL_SALES_TAX]: 4.625 },
    // Pub 718: Nassau County 8 5/8%, code 2811 (village)
    [VALLEY_STREAM]: { [LOCAL_SALES_TAX]: 4.625 },
    // Pub 718: Nassau County 8 5/8%, code 2811
    [LONG_BEACH]: { [LOCAL_SALES_TAX]: 4.625 },
    // Pub 718: Rockland County 8 3/8%, code 3921 (village)
    [SPRING_VALLEY]: { [LOCAL_SALES_TAX]: 4.375 },
    [ITHACA]: { [LOCAL_SALES_TAX]: 4 }, // Pub 718: Ithaca (city) 8%, code 5021
  },
} as SalesTaxData;
