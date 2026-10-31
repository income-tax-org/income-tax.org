import { INFINITY } from "@/constants";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  PERSONAL_EXEMPTION_CREDIT,
  STANDARD_DEDUCTION,
  STATE_INCOME,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Verified 2026-09-07. SINGLE, MARRIED and MARRIED_SEPARATELY confirmed
  // against DOR's Tax Rate Chronology (Table 1, Rev. 2-2026), whose
  // Jan. 1, 2026 row reads $8,850 single / $17,700 joint; MFS tracks single
  // in every published year.
  // https://revenue.nebraska.gov/sites/default/files/doc/research/chronology/4-607table1.pdf
  // HEAD_OF_HOUSEHOLD verified 2026-10-30 against DOR's 2026 Form 1040N-ES
  // (8-014-2025 Rev. 11-2025), Income Tax Worksheet line 5: "Nebraska
  // standard deduction: Single $8,850; Married, Filing Jointly $17,700; Head
  // of Household $12,950; Married, Filing Separately $8,850". It matches the
  // 12950 this file had derived (12,600 scaled by the single-filer increase)
  // and agrees with Table 1 on the other three. The 2026 1040N booklet is not
  // out yet; compare against it when it publishes.
  // https://revenue.nebraska.gov/sites/default/files/doc/tax-forms/2025/f_1040N-ES.pdf
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
  // Jan. 1, 2026 rate row reads 2.46 / 3.51 / 4.55 / 4.55. The 2026 Form
  // 1040N-ES rate schedule (checked 2026-10-30) prints the same boundaries
  // for all four statuses and notes that bands 3 and 4 share 4.55%.
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
  // Personal exemption credit: $176 per exemption for 2026. Form 1040N line
  // 18 carries it as "$X times the number on line 4"; the 2026 1040N is not
  // published yet, so the amount is from DOR's Tax Rate Chronology (Table 1,
  // Rev. 2-2026), whose Jan. 1, 2026 row reads "$176" under Personal
  // Exemption, and the 2026 1040N-ES rate schedule: "Include $176 for each
  // Nebraska personal exemption". Confirm against 1040N line 18 when the
  // 2026 form publishes.
  // Line 4 counts yourself (4a), a spouse on a joint return (4b) and
  // dependents (4c). Dependents are not modelled, so this is one exemption,
  // or two filing jointly -- Neb. Rev. Stat. 77-2716.01(1)(b): "plus two for
  // a married filing jointly return or plus one for any other return".
  // Nonrefundable, off Nebraska tax only; the form floors tax after
  // nonrefundable credits at zero. No AGI limit: the Chronology notes the
  // credit "was phased out as federal AGI increased for higher income
  // taxpayers through tax year 2005", and neither 77-2716.01(1)(b) nor the
  // form carries any limit now.
  // Source: https://revenue.nebraska.gov/sites/default/files/doc/research/chronology/4-607table1.pdf
  //         https://revenue.nebraska.gov/sites/default/files/doc/tax-forms/2025/f_1040N-ES.pdf
  //         https://nebraskalegislature.gov/laws/statutes.php?statute=77-2716.01
  [PERSONAL_EXEMPTION_CREDIT]: {
    [SINGLE]: 176,
    [MARRIED]: 352,
    [MARRIED_SEPARATELY]: 176,
    [HEAD_OF_HOUSEHOLD]: 176,
  },
} as TaxData;
