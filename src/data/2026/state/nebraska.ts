import { INFINITY } from "@/constants";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import { STANDARD_DEDUCTION, STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Verified 2026-09-07. SINGLE, MARRIED and MARRIED_SEPARATELY confirmed
  // against DOR's Tax Rate Chronology (Table 1, Rev. 2-2026), whose
  // Jan. 1, 2026 row reads $8,850 single / $17,700 joint; MFS tracks single
  // in every published year.
  // https://revenue.nebraska.gov/sites/default/files/doc/research/chronology/4-607table1.pdf
  // UNSOURCED: HEAD_OF_HOUSEHOLD. Nebraska publishes it only in the Form
  // 1040N booklet, which is not out for 2026, and the 2026 Circular EN
  // withholds head-of-household filers as single so it carries no figure.
  // 12950 is derived - 12,600 scaled by the confirmed single-filer increase
  // (8,600 -> 8,850, +2.907%) and rounded to the nearest $50, the rounding
  // Nebraska uses. Re-check against the 2026 booklet when it publishes.
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 8850,
    [MARRIED]: 17700,
    [MARRIED_SEPARATELY]: 8850,
    [HEAD_OF_HOUSEHOLD]: 12950,
  },
  // Verified 2026-09-07: correct, though it looks short by a bracket.
  // Nebraska publishes FOUR bands for 2026 - single 0-4,130 / 4,130-24,760 /
  // 24,760-39,900 / over 39,900 - but Neb. Rev. Stat. 77-2715.03 sets both
  // rate three and rate four to 4.55% for 2026 (they split again at 3.99% in
  // 2027), so bands 3 and 4 carry the same rate and collapsing them is
  // arithmetically identical and reads better in the bracket ladder. If a
  // future year gives those bands different rates, split them back out at
  // 39,900 single and separate, 79,800 joint, 59,160 head of household.
  // Boundaries from DOR's Tax Rate Chronology (Table 1, Rev. 2-2026), whose
  // Jan. 1, 2026 rate row reads 2.46 / 3.51 / 4.55 / 4.55.
  // https://revenue.nebraska.gov/sites/default/files/doc/research/chronology/4-607table1.pdf
  // https://nebraskalegislature.gov/laws/statutes.php?statute=77-2715.03
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 4130, rate: 2.46 },
      { min: 4130, max: 24760, rate: 3.51 },
      { min: 24760, max: INFINITY, rate: 4.55 },
    ],
    [MARRIED]: [
      { min: 0, max: 8250, rate: 2.46 },
      { min: 8250, max: 49530, rate: 3.51 },
      { min: 49530, max: INFINITY, rate: 4.55 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 4130, rate: 2.46 },
      { min: 4130, max: 24760, rate: 3.51 },
      { min: 24760, max: INFINITY, rate: 4.55 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 7700, rate: 2.46 },
      { min: 7700, max: 39620, rate: 3.51 },
      { min: 39620, max: INFINITY, rate: 4.55 },
    ],
  },
} as TaxData;
