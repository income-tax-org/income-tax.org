import { INFINITY } from "@/constants";
import {
  ATTALLA,
  AUBURN,
  BEAR_CREEK,
  BESSEMER,
  BIRMINGHAM,
  BRILLIANT,
  CITIES,
  FAIRFIELD,
  GADSDEN,
  GLENCOE,
  GOODWATER,
  GUIN,
  HACKLEBURG,
  HALEYVILLE,
  HAMILTON,
  IRONDALE,
  LEEDS,
  LYNN,
  MACON_COUNTY,
  MIDFIELD,
  MOSSES,
  OPELIKA,
  RAINBOW_CITY,
  RED_BAY,
  SHORTER,
  SOUTHSIDE,
  SULLIGENT,
  TARRANT,
  TUSKEGEE,
} from "@/constants/cities";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  OCCUPATIONAL_TAX,
  STATE_INCOME,
  STANDARD_DEDUCTION,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Alabama's optional standard deduction shrinks as Alabama AGI rises, so it
  // is a schedule rather than one number per filing status. The four figures
  // this file used to carry alone -- 3,000 single, 8,500 joint, 4,250
  // separate, 5,200 head of family -- are the maxima, and only a filer under
  // $26,000 of AGI ($13,000 filing separately) actually gets one. Above
  // $35,500 ($17,750 separately) every Alabama filer sits at the floor, which
  // is why ADOR's own withholding example deducts 5,000, not 8,500, from
  // $44,200 of joint wages.
  //
  // The 2.83x married-to-single ratio (8,500 / 3,000) is Alabama's real
  // published rule, not a data error - the four statuses are indexed off
  // separate AGI ramps rather than a common multiple. Alabama calls head of
  // household "head of family"; HEAD_OF_HOUSEHOLD below is that chart.
  //
  // ADOR publishes the rule twice, as a chart of steps and as a formula. The
  // formula is what is transcribed here, in the state's own words for the
  // joint filer:
  //
  //   - GI of $25,999 or less deduct $8,500
  //   - GI greater than $25,999 but less than $35,500
  //     deduct $8,500 less $175 for each $500 increment or part thereof of
  //     GI above $25,999
  //   - GI of $35,500 or more deduct $5,000
  //
  // "or part thereof" rounds the step count up; `reduce_per` counts whole
  // steps down. The two agree exactly if the middle band starts from the
  // chart's first reduced row rather than from the maximum -- $8,325 at
  // $26,000, then $175 off per whole $500 above that -- so every number below
  // is one printed on ADOR's chart. `floor` records the state's stated floor;
  // the third band is where it actually binds.
  //
  // A second reason the formula is the transcribed source: ADOR's chart has a
  // typo in its own joint column, identical in the 2023, 2024 and 2025
  // booklets. Its third row reads "$25,500 - $26,999  $8,150" where it must
  // read "$26,500 - $26,999" - the row above it ends at $26,499, the other
  // three columns step cleanly by their own increment, and the formula's $500
  // steps put $8,150 at $26,500. So a reviewer checking $25,500 against that
  // row will read $8,150 where this file gives $8,500, and the file is right.
  // Distrust that one cell; the rest of the chart is sound. Transcribing the
  // 21 rows literally would have transcribed the typo.
  //
  // Verified: this reproduces all 21 rows of all four charts. Joint at
  // $30,000, floor((30000 - 26000) / 500) = 8 steps, 8,325 - 8 x 175 =
  // $6,925, the chart's "$30,000 - $30,499 $6,925"; at $35,000, 18 steps,
  // 8,325 - 3,150 = $5,175, its last stepped row. Separate at $15,000,
  // floor(2000 / 250) = 8 steps, 4,162 - 8 x 88 = $3,458, matching
  // "$15,000 - $15,249 $3,458".
  //
  // The charts key on Alabama AGI (Form 40, line 10); the calculator picks
  // the band with income after retirement contributions, its AGI proxy.
  //
  // Source: 2024 Form 40 booklet, "Standard Deduction" chart, p.8, with the
  // formula from ADOR's withholding booklet, "Formula For Computing Alabama
  // Withholding Tax", p.6. The chart is identical in the 2023, 2024 and 2025
  // booklets; Alabama does not index these amounts.
  // https://www.revenue.alabama.gov/wp-content/uploads/2025/01/24f40bk.pdf
  // https://www.revenue.alabama.gov/wp-content/uploads/2026/01/whbooklet_0126.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 26000, amount: 3000 },
      {
        min: 26000,
        max: 35500,
        amount: 2975,
        reduce_per: 500,
        reduce_by: 25,
        floor: 2500,
      },
      { min: 35500, max: INFINITY, amount: 2500 },
    ],
    [MARRIED]: [
      { min: 0, max: 26000, amount: 8500 },
      {
        min: 26000,
        max: 35500,
        amount: 8325,
        reduce_per: 500,
        reduce_by: 175,
        floor: 5000,
      },
      { min: 35500, max: INFINITY, amount: 5000 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 13000, amount: 4250 },
      {
        min: 13000,
        max: 17750,
        amount: 4162,
        reduce_per: 250,
        reduce_by: 88,
        floor: 2500,
      },
      { min: 17750, max: INFINITY, amount: 2500 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 26000, amount: 5200 },
      {
        min: 26000,
        max: 35500,
        amount: 5065,
        reduce_per: 500,
        reduce_by: 135,
        floor: 2500,
      },
      { min: 35500, max: INFINITY, amount: 2500 },
    ],
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 500, rate: 2 },
      { min: 500, max: 3000, rate: 4 },
      { min: 3000, max: INFINITY, rate: 5 },
    ],
    [MARRIED]: [
      { min: 0, max: 1000, rate: 2 },
      { min: 1000, max: 6000, rate: 4 },
      { min: 6000, max: INFINITY, rate: 5 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 500, rate: 2 },
      { min: 500, max: 3000, rate: 4 },
      { min: 3000, max: INFINITY, rate: 5 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 500, rate: 2 },
      { min: 500, max: 3000, rate: 4 },
      { min: 3000, max: INFINITY, rate: 5 },
    ],
  },
  // Verified 2026-09-07 against the Alabama League of Municipalities' live
  // "Municipal Occupational Taxes" list at https://almonline.org/TaxRates.aspx.
  // Every one of the 25 municipalities recorded in 2026/SOURCING-STATUS.md is
  // still on it, at the same rate, and it still misspells Hackleburg as
  // "Hacklebug". No rate below changed. Alabama's 2020 HB 147 grandfathered
  // existing occupational taxes and requires legislative approval for new
  // ones, so only decreases move; Opelika's and Irondale's are the only two
  // in this data set, and both are noted at the jurisdiction below.
  // The League disclaims its own figures - rates "are those given to the
  // League by survey and should be verified with the appropriate entity" -
  // and its Opelika entry is demonstrably stale (still 1.5%, cut to 1% on
  // 2025-04-01). So treat as PROVISIONAL, corroborated by the League survey
  // alone: Bear Creek, Brilliant, Goodwater, Guin, Hackleburg, Haleyville,
  // Hamilton, Lynn, Mosses, Red Bay, Shorter, Sulligent. None of those towns
  // publishes a reachable page or ordinance.
  // Birmingham's 1% is corroborated by the League list only this round -
  // birminghamal.gov, its hdlgov tax portal and Municode all refused
  // automated fetches on 2026-09-07. That is a fetch failure, NOT new doubt:
  // Birmingham was verified against primary sources in earlier work and is
  // recorded as verified in 2026/SOURCING-STATUS.md.
  // Tarrant was added this round from the city's own ordinance - see its entry
  // below. Beaverton stays deliberately absent: its administrator (Avenu/RDS)
  // blocks access, and an unsourceable rate is worse than a missing one, since
  // absence is visibly incomplete while a wrong rate is invisibly wrong.
  [CITIES]: {
    [ATTALLA]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2 }],
      },
    },
    [AUBURN]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [BEAR_CREEK]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [BESSEMER]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [BIRMINGHAM]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [BRILLIANT]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [FAIRFIELD]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [GADSDEN]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2 }],
      },
    },
    [GLENCOE]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2 }],
      },
    },
    [GOODWATER]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 0.75 }],
      },
    },
    [GUIN]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [HACKLEBURG]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [HALEYVILLE]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [HAMILTON]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    // MID-YEAR CHANGE, not modelled: 0.75% through 2024-07-02, 0.50% after
    // (Ordinance 2024-12). This file carries the PRE-change 0.75%, as the
    // Philadelphia wage tax does. Verified 2026-09-07 against the city's own
    // fee history: 1% from 2018-08-01 (Ordinance 2018-10c), reduced "first on
    // July 19, 2022 (Ordinance 2022-14 reducing to .75%) and again on July 2,
    // 2024 (Ordinance 2024-12 reducing to .50%)".
    // Source: https://cityofirondaleal.gov/occupational-license-fee/
    [IRONDALE]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 0.75 }],
      },
    },
    [LEEDS]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [LYNN]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [MACON_COUNTY]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [MIDFIELD]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [MOSSES]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    // Verified 2026-09-07: 1.5%, Opelika's rate from the early 1990s until
    // 2025-04-01. The city's current quarterly return carries the note "As of
    // April 1, 2025, the City of Opelika reduced the withholding fee from
    // 1.5% to 1% of total gross wages, salaried and other compensation paid
    // for work done or services performed in the City."
    // Source: https://www.opelika-al.gov/DocumentCenter/View/290/Occupational-Quarterly-Return-PDF
    [OPELIKA]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.5 }],
      },
    },
    [RAINBOW_CITY]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2 }],
      },
    },
    [RED_BAY]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 0.5 }],
      },
    },
    [SHORTER]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [SOUTHSIDE]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2 }],
      },
    },
    [SULLIGENT]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    // ADDED 2026-09-07. Tarrant is ABSENT from the Alabama League of
    // Municipalities roster that is this file's base source, so this entry has
    // to explain itself or it reads as spurious. Irondale is the precedent:
    // it has levied since 2018 and is not on the League list either. That list
    // is a survey, not a register - a floor, not a ceiling.
    // Source: City of Tarrant Ordinance No. 1132, adopted 2020-09-09, which
    // amended Ordinances 1020 and 1072 and STRUCK the fee's 2020-09-30 sunset
    // so that it would "continue without lapse" - that is what makes a 2020
    // document authoritative for 2026. It levies "a fee in the amount of
    // one-half percent (0.5%) of the gross income and compensation reported by
    // those persons who have undertaken various trades, occupations, and
    // professions".
    // https://mcclibraryfunctions.azurewebsites.us/api/ordinanceDownload/10178/1047327/pdf
    [TARRANT]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 0.5 }],
      },
    },
    [TUSKEGEE]: {
      [OCCUPATIONAL_TAX]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2 }],
      },
    },
  },
} as TaxData;
