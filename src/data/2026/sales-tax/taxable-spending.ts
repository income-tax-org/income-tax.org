import { INFINITY } from "@/constants";
import type { TaxableSpendingTable } from "@/types";

// CARRIED FROM 2025: the IRS publishes the 2026 table with the 2026 Schedule A
// instructions, early in 2027. This is the 2025 Optional State Sales Tax Table
// for Washington, unchanged.
//
// The table states the sales tax a household is estimated to pay, not what it
// spends. Divided by the 6.5% it was computed at, it gives the taxable
// spending behind that estimate, which is what the comparison needs: one
// spending figure that every location's own rate can then be applied to.
//
// Washington's table is used because Washington's tax base is a typical one --
// most goods taxed, groceries and prescription drugs exempt -- and it is the
// first state with sales tax data here. Rows are transcribed as printed, "at
// least / but less than", so bands are half-open, [min, max).
export default {
  rate: 6.5,
  bands: [
    { min: 0, max: 20000, amounts: [430, 492, 532, 565, 591, 628] },
    { min: 20000, max: 30000, amounts: [594, 680, 737, 782, 818, 869] },
    { min: 30000, max: 40000, amounts: [675, 773, 838, 889, 930, 988] },
    { min: 40000, max: 50000, amounts: [743, 851, 922, 978, 1024, 1088] },
    { min: 50000, max: 60000, amounts: [802, 919, 996, 1056, 1105, 1174] },
    { min: 60000, max: 70000, amounts: [855, 979, 1061, 1125, 1177, 1251] },
    { min: 70000, max: 80000, amounts: [903, 1033, 1120, 1187, 1243, 1320] },
    { min: 80000, max: 90000, amounts: [947, 1084, 1174, 1245, 1303, 1384] },
    { min: 90000, max: 100000, amounts: [987, 1129, 1225, 1298, 1359, 1443] },
    { min: 100000, max: 120000, amounts: [1040, 1190, 1291, 1368, 1432, 1521] },
    { min: 120000, max: 140000, amounts: [1108, 1268, 1375, 1458, 1526, 1621] },
    { min: 140000, max: 160000, amounts: [1171, 1341, 1453, 1541, 1612, 1712] },
    { min: 160000, max: 180000, amounts: [1228, 1406, 1523, 1615, 1690, 1796] },
    { min: 180000, max: 200000, amounts: [1281, 1465, 1589, 1685, 1763, 1874] },
    { min: 200000, max: 225000, amounts: [1335, 1528, 1657, 1757, 1838, 1953] },
    { min: 225000, max: 250000, amounts: [1393, 1594, 1728, 1833, 1918, 2038] },
    { min: 250000, max: 275000, amounts: [1447, 1656, 1796, 1903, 1993, 2116] },
    { min: 275000, max: 300000, amounts: [1498, 1714, 1860, 1970, 2063, 2192] },
    {
      min: 300000,
      max: INFINITY,
      amounts: [1790, 2049, 2222, 2356, 2466, 2619],
    },
  ],
} as TaxableSpendingTable;
