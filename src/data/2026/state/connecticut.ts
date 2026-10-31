import { INFINITY } from "@/constants";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  CT_PAID_FAMILY_AND_MEDICAL_LEAVE,
  STANDARD_DEDUCTION,
  STATE_INCOME,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  [CT_PAID_FAMILY_AND_MEDICAL_LEAVE]: {
    [ALL]: [
      { min: 0, max: 184500, rate: 0.5 },
      { min: 184500, max: INFINITY, rate: 0 },
    ],
  },
  // Connecticut has no standard deduction. This is its personal exemption
  // (Conn. Gen. Stat. 12-702), modelled in the deduction slot because it is
  // subtracted from Connecticut AGI the same way. Do not "correct" these to
  // federal standard deduction amounts.
  //
  // The exemption tapers to nothing as CT AGI rises, so it is a schedule
  // rather than one number per status. 15,000 / 24,000 / 12,000 / 19,000 are
  // the maxima, which stop at $30,000 / $48,000 / $24,000 / $38,000 of CT
  // AGI; past that the exemption drops $1,000 for every $1,000, or fraction
  // of $1,000, of AGI above the threshold, and is gone at $44,000 / $71,000 /
  // $35,000 / $56,000. A single filer on $60,000 gets no exemption at all,
  // where this file used to give them $15,000.
  //
  // Two transcription notes, both from DRS printing Table A as
  // "More Than / Less Than or Equal To":
  //
  //  * That is the opposite half of the interval from a deduction band, so
  //    every boundary below is one dollar above the figure on the page: the
  //    row "$0 / $30,000 / $15,000" becomes `max: 30001`.
  //  * "or fraction thereof" rounds the step count up, while `reduce_per`
  //    counts whole steps down. The two agree exactly if the tapering band
  //    starts at the table's first reduced row rather than at the maximum --
  //    $14,000 just above $30,000, then $1,000 off per whole $1,000 -- so
  //    every amount below is one printed in Table A.
  //
  // Verified against Table A row by row. Single at $35,000 (table row
  // "$34,000 / $35,000 / $10,000"): floor((35000 - 30001) / 1000) = 4 steps,
  // 14,000 - 4,000 = $10,000. Joint at $60,000 (row "$59,000 / $60,000 /
  // $12,000"): floor((60000 - 48001) / 1000) = 11, 23,000 - 11,000 = $12,000.
  // Head of household at $56,000, the last non-zero row: floor((56000 -
  // 38001) / 1000) = 17, 18,000 - 17,000 = $1,000.
  //
  // Table A keys on Connecticut AGI; the calculator picks the band with
  // income after retirement contributions, its AGI proxy.
  //
  // Source: Form CT-1040ES (Rev. 01/26), "Table A - Personal Exemptions for
  // 2026 Taxable Year", checked row by row 2026-10-30 -- identical to the
  // 2023, 2024 and 2025 CT-1040 TCS Table A. IP 2026(7) (issued 12/12/2025)
  // prints the same table. The 2026 CT-1040 TCS is not published yet; OLR's
  // "2026 Acts Affecting Taxes" (2026-R-0076) lists no change to the
  // exemption or the rates from the 2026 session.
  // https://portal.ct.gov/-/media/drs/forms/2025/income/ct1040es-flat0126.pdf
  // https://portal.ct.gov/-/media/drs/publications/pubsip/2026/ip-2026-7.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 30001, amount: 15000 },
      {
        min: 30001,
        max: 44001,
        amount: 14000,
        reduce_per: 1000,
        reduce_by: 1000,
      },
      { min: 44001, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 48001, amount: 24000 },
      {
        min: 48001,
        max: 71001,
        amount: 23000,
        reduce_per: 1000,
        reduce_by: 1000,
      },
      { min: 71001, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 24001, amount: 12000 },
      {
        min: 24001,
        max: 35001,
        amount: 11000,
        reduce_per: 1000,
        reduce_by: 1000,
      },
      { min: 35001, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 38001, amount: 19000 },
      {
        min: 38001,
        max: 56001,
        amount: 18000,
        reduce_per: 1000,
        reduce_by: 1000,
      },
      { min: 56001, max: INFINITY, amount: 0 },
    ],
  },
  // Verified 2026-10-30 against Form CT-1040ES (Rev. 01/26), "Table B -
  // Initial Tax Calculation for 2026 Taxable Year": every threshold and rate
  // below, for all three of its schedules (single and married filing
  // separately share one). Not modelled: the 2% phase-out add-back, tax
  // recapture and personal tax credits (Tables C, D and E), which Table B
  // itself excludes.
  // https://portal.ct.gov/-/media/drs/forms/2025/income/ct1040es-flat0126.pdf
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 10000, rate: 2 },
      { min: 10000, max: 50000, rate: 4.5 },
      { min: 50000, max: 100000, rate: 5.5 },
      { min: 100000, max: 200000, rate: 6 },
      { min: 200000, max: 250000, rate: 6.5 },
      { min: 250000, max: 500000, rate: 6.9 },
      { min: 500000, max: INFINITY, rate: 6.99 },
    ],
    [MARRIED]: [
      { min: 0, max: 20000, rate: 2 },
      { min: 20000, max: 100000, rate: 4.5 },
      { min: 100000, max: 200000, rate: 5.5 },
      { min: 200000, max: 400000, rate: 6 },
      { min: 400000, max: 500000, rate: 6.5 },
      { min: 500000, max: 1000000, rate: 6.9 },
      { min: 1000000, max: INFINITY, rate: 6.99 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 10000, rate: 2 },
      { min: 10000, max: 50000, rate: 4.5 },
      { min: 50000, max: 100000, rate: 5.5 },
      { min: 100000, max: 200000, rate: 6 },
      { min: 200000, max: 250000, rate: 6.5 },
      { min: 250000, max: 500000, rate: 6.9 },
      { min: 500000, max: INFINITY, rate: 6.99 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 16000, rate: 2 },
      { min: 16000, max: 80000, rate: 4.5 },
      { min: 80000, max: 160000, rate: 5.5 },
      { min: 160000, max: 320000, rate: 6 },
      { min: 320000, max: 400000, rate: 6.5 },
      { min: 400000, max: 800000, rate: 6.9 },
      { min: 800000, max: INFINITY, rate: 6.99 },
    ],
  },
} as TaxData;
