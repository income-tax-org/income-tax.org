import { INFINITY } from "@/constants";
import {
  CITIES,
  ALABASTER,
  ATHENS,
  ATTALLA,
  AUBURN,
  BEAR_CREEK,
  BESSEMER,
  BIRMINGHAM,
  BRILLIANT,
  DAPHNE,
  DECATUR,
  DOTHAN,
  FAIRFIELD,
  FLORENCE,
  GADSDEN,
  GLENCOE,
  GOODWATER,
  GUIN,
  HACKLEBURG,
  HALEYVILLE,
  HAMILTON,
  HOOVER,
  HUNTSVILLE,
  IRONDALE,
  LEEDS,
  LYNN,
  MACON_COUNTY,
  MADISON,
  MIDFIELD,
  MOBILE,
  MONTGOMERY,
  MOSSES,
  NORTHPORT,
  OPELIKA,
  PHENIX_CITY,
  PRATTVILLE,
  RAINBOW_CITY,
  RED_BAY,
  SHORTER,
  SOUTHSIDE,
  SULLIGENT,
  TARRANT,
  TUSCALOOSA,
  TUSKEGEE,
  VESTAVIA_HILLS,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Alabama Department of Revenue 'Local Cities and Counties Tax Rates Text
// File', taxrates.csv
// (revenue.alabama.gov/wp-content/uploads/2024/03/taxrates.csv, updated for
// October 2026), which lists every state- and self-administered local tax
// with active and inactive dates; only TaxType ST, RateType GENER rows are
// used. Local = the city's general sales tax rate plus the county locality
// rates that apply inside its corporate limits: where ALDOR splits a county
// into corporate-limits (CL) and police-jurisdiction (PJ) localities, the CL
// code is used (Mobile 7749, Tuscaloosa/Northport 7763, Auburn/Opelika 7741,
// Phenix City 7757, Decatur 7752, Florence 7739); Madison adds both Madison
// County localities (7045 excluding Huntsville, 7745 countywide). Cities
// split across counties use the county holding most residents (Census 2025
// place-by-county estimates): Jefferson for Birmingham, Hoover, Vestavia
// Hills and Leeds; Madison for Huntsville and Madison; Houston for Dothan;
// Autauga for Prattville; Russell for Phenix City; Etowah for Southside;
// Winston for Haleyville. Police-jurisdiction rates, which apply outside city
// limits, are not used. Cross-checked against the City of Hoover's published
// breakdown (9.5% in Jefferson County), Avalara/SalesTaxHandbook for Tuskegee
// (11.5%), and reporting on Autauga County's 2026-09-01 increase. State rate
// 4% throughout. Small places added later follow the same method; Glencoe
// uses Etowah County, where 5,408 of its 5,426 residents live (Census 2025),
// and its Calhoun part would also total 6% local (county CL code 7408 at 1%).
// macon_county is unincorporated Macon County: the county general rate only,
// no city rate. ALDOR's 78xx 'unabated' county codes are a subset of the
// county rate, not an addition, and are not used. Small-town cross-checks:
// Avalara/SalesTaxHandbook give Shorter 11.5% and Sulligent 9.5% total;
// ALDOR's Hackleburg notice (2026-06-25) confirms 2% to 3% on 2026-07-01;
// Taxwire gives Mosses 10% (Lowndes 4%, as Avalara), though
// SalesTaxHandbook's Lowndes County page lists a 2.5% county rate, which
// ALDOR's file does not support.
//
// Prattville rises 0.5 point on 2026-09-01, when Autauga County's general
// rate went from 2% to 2.5% (Act 2026-362), so its 2026 figure is monthly.
// Hackleburg's town rate rose from 2% to 3% on 2026-07-01 (ALDOR local tax
// notice of 2026-06-25), so its 2026 figure is quarterly.
export default {
  [STATE_SALES_TAX]: 4,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: 5.46,
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 4,
    bands: [
      { min: 0, max: 20000, amounts: [306, 371, 416, 453, 483, 527] },
      { min: 20000, max: 30000, amounts: [405, 491, 550, 597, 638, 696] },
      { min: 30000, max: 40000, amounts: [453, 547, 613, 666, 712, 776] },
      { min: 40000, max: 50000, amounts: [492, 594, 666, 723, 772, 842] },
      { min: 50000, max: 60000, amounts: [525, 635, 711, 773, 825, 899] },
      { min: 60000, max: 70000, amounts: [555, 670, 751, 816, 870, 949] },
      { min: 70000, max: 80000, amounts: [581, 702, 787, 854, 911, 993] },
      { min: 80000, max: 90000, amounts: [605, 731, 820, 890, 949, 1034] },
      { min: 90000, max: 100000, amounts: [628, 758, 849, 922, 983, 1071] },
      { min: 100000, max: 120000, amounts: [657, 793, 889, 964, 1029, 1120] },
      { min: 120000, max: 140000, amounts: [695, 838, 938, 1018, 1086, 1182] },
      { min: 140000, max: 160000, amounts: [728, 877, 983, 1066, 1137, 1239] },
      { min: 160000, max: 180000, amounts: [759, 914, 1024, 1111, 1184, 1290] },
      { min: 180000, max: 200000, amounts: [787, 949, 1061, 1152, 1228, 1338] },
      { min: 200000, max: 225000, amounts: [816, 983, 1100, 1193, 1273, 1385] },
      {
        min: 225000,
        max: 250000,
        amounts: [846, 1020, 1142, 1238, 1319, 1437],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [874, 1053, 1179, 1279, 1363, 1484],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [902, 1086, 1215, 1317, 1405, 1528],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1052, 1265, 1416, 1535, 1635, 1779],
      },
    ],
  },
  [CITIES]: {
    // ALDOR taxrates.csv city 9145 + county 7745 (Madison)
    [HUNTSVILLE]: { [LOCAL_SALES_TAX]: 5 },
    // ALDOR taxrates.csv city 9149 + county 7749 (Mobile CL)
    [MOBILE]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9137 + county 7037 (Jefferson)
    [BIRMINGHAM]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9454 + county 7051 (Montgomery)
    [MONTGOMERY]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9163 + county 7763 (Tuscaloosa CL)
    [TUSCALOOSA]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9424 + county 7037 (Jefferson)
    [HOOVER]: { [LOCAL_SALES_TAX]: 5.5 },
    // ALDOR taxrates.csv city 9388 + county 7741 (Lee CL)
    [AUBURN]: { [LOCAL_SALES_TAX]: 5 },
    // ALDOR taxrates.csv city 9653 + county 7035 (Houston)
    [DOTHAN]: { [LOCAL_SALES_TAX]: 5 },
    // ALDOR taxrates.csv city 9662 + county 7045+7745 (Madison)
    [MADISON]: { [LOCAL_SALES_TAX]: 5 },
    // ALDOR taxrates.csv city 9152 + county 7752 (Morgan CL)
    [DECATUR]: { [LOCAL_SALES_TAX]: 5 },
    // ALDOR taxrates.csv city 9455 + county 7739 (Lauderdale CL)
    [FLORENCE]: { [LOCAL_SALES_TAX]: 5.5 },
    // ALDOR taxrates.csv city 9365 + county 7001 (Autauga)
    [PRATTVILLE]: {
      [LOCAL_SALES_TAX]: [5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 6, 6, 6, 6],
    },
    // ALDOR taxrates.csv city 9383 + county 7757 (Russell CL)
    [PHENIX_CITY]: { [LOCAL_SALES_TAX]: 5.75 },
    // ALDOR taxrates.csv city 9333 + county 7037 (Jefferson)
    [VESTAVIA_HILLS]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9663 + county 7741 (Lee CL)
    [OPELIKA]: { [LOCAL_SALES_TAX]: 5 },
    // ALDOR taxrates.csv city 9413 + county 7058 (Shelby)
    [ALABASTER]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9664 + county 7042 (Limestone)
    [ATHENS]: { [LOCAL_SALES_TAX]: 5 },
    // ALDOR taxrates.csv city 9696 + county 7028 (Etowah)
    [GADSDEN]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9162 + county 7763 (Tuscaloosa CL)
    [NORTHPORT]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9623 + county 7002 (Baldwin)
    [DAPHNE]: { [LOCAL_SALES_TAX]: 5.5 },
    // ALDOR taxrates.csv city 9336 + county 7037 (Jefferson)
    [BESSEMER]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9335 + county 7044 (Macon)
    [TUSKEGEE]: { [LOCAL_SALES_TAX]: 7.5 },
    // ALDOR taxrates.csv city 9134 + county 7037 (Jefferson)
    [IRONDALE]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9401 + county 7037 (Jefferson)
    [LEEDS]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9132 + county 7037 (Jefferson)
    [FAIRFIELD]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9375 + county 7037 (Jefferson)
    [MIDFIELD]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9701 + county 7028 (Etowah)
    [SOUTHSIDE]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9625 + county 7037 (Jefferson)
    [TARRANT]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9666 + county 7028 (Etowah)
    [RAINBOW_CITY]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9406 + county 7028 (Etowah)
    [ATTALLA]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9000 + county 7067 (Winston)
    [HALEYVILLE]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9359 + county 7047 (Marion)
    [HAMILTON]: { [LOCAL_SALES_TAX]: 5 },
    // ALDOR taxrates.csv city 9313 + county 7030 (Franklin)
    [RED_BAY]: { [LOCAL_SALES_TAX]: 4.5 },
    // ALDOR taxrates.csv city 9643 + county 7047 (Marion)
    [BEAR_CREEK]: { [LOCAL_SALES_TAX]: 5 },
    // ALDOR taxrates.csv city 9147 + county 7047 (Marion)
    [BRILLIANT]: { [LOCAL_SALES_TAX]: 5 },
    // ALDOR taxrates.csv city 9402 + county 7028 (Etowah)
    [GLENCOE]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9377 + county 7019 (Coosa)
    [GOODWATER]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9324 + county 7047 (Marion)
    [GUIN]: { [LOCAL_SALES_TAX]: 5 },
    // ALDOR taxrates.csv city 9349 + county 7047 (Marion)
    [HACKLEBURG]: { [LOCAL_SALES_TAX]: [4, 4, 5, 5] },
    // ALDOR taxrates.csv city 9125 + county 7067 (Winston)
    [LYNN]: { [LOCAL_SALES_TAX]: 4 },
    // ALDOR taxrates.csv county 7044 (Macon, unincorporated)
    [MACON_COUNTY]: { [LOCAL_SALES_TAX]: 2.5 },
    // ALDOR taxrates.csv city 9677 + county 7043 (Lowndes)
    [MOSSES]: { [LOCAL_SALES_TAX]: 6 },
    // ALDOR taxrates.csv city 9702 + county 7044 (Macon)
    [SHORTER]: { [LOCAL_SALES_TAX]: 7.5 },
    // ALDOR taxrates.csv city 9392 + county 7038 (Lamar)
    [SULLIGENT]: { [LOCAL_SALES_TAX]: 5.5 },
  },
} as SalesTaxData;
