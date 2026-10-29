import { INFINITY } from "@/constants";
import {
  ALLENTOWN,
  ALTOONA,
  BETHLEHEM,
  CARLISLE,
  CITIES,
  ERIE,
  HANOVER,
  HARRISBURG,
  LANCASTER,
  PHILADELPHIA,
  PITTSBURGH,
  READING,
  SCRANTON,
  WILKES_BARRE,
  YORK,
} from "@/constants/cities";
import { ALL } from "@/constants/filing-status";
import { LOCAL_EARNED_INCOME, STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Verified 2026-09-07: correct. Pennsylvania has levied a flat 3.07% since
  // 2004 and the rate does not vary by filing status.
  // Source: PA Department of Revenue, Personal Income Tax Rates -- "2004 -
  // Present: 3.07%".
  // https://www.pa.gov/agencies/revenue/resources/tax-rates/personal-income-tax-rates.html
  //
  // No STANDARD_DEDUCTION key, correctly: Pennsylvania has no standard
  // deduction and no personal exemption. Low-income relief comes through Tax
  // Forgiveness (PA-40 Schedule SP), which is a credit against tax computed
  // from eligibility income and dependants, not a deduction, so it cannot be
  // expressed as brackets and is not modelled.
  [STATE_INCOME]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 3.07 }],
  },
  // Every rate below is the total *resident* earned income tax -- the
  // municipal rate plus the school district rate -- taken from the DCED
  // official EIT tax register for this year. The register is reachable from
  // https://dced.pa.gov/local-government/local-income-tax-information/ ->
  // "Tax Registers (Official)", historic report, reporting period 2024.
  // Seven of the fourteen were wrong; all seven are corrected below.
  [CITIES]: {
    // Corrected 2026-09-07: 3.93% -> 3.75%. 3.93% has never been a
    // Philadelphia Wage Tax rate at all -- the resident rate has not been
    // above 3.8398% since 2021 and was falling throughout this period.
    //
    // 2024 is the one clean year in this repo's range: Philadelphia's rate
    // changes every July 1, but the 2024-07-01 change held the resident rate
    // at 3.75%, so 3.75% covers the whole calendar year with no
    // mid-year-blending question.
    // Source: City of Philadelphia, Wage Tax (employers), rate history table.
    // https://www.phila.gov/services/payments-assistance-taxes/business-taxes/wage-tax-employers/
    [PHILADELPHIA]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 3.75 }],
      },
    },
    // Verified 2026-09-07: 1% city + 2% Pittsburgh S D = 3%.
    [PITTSBURGH]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 3.0 }],
      },
    },
    // Verified 2026-09-07: 2.1% city + 1.5% Reading S D = 3.6%.
    [READING]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 3.6 }],
      },
    },
    // Verified 2026-09-07: 2.4% city + 1% Scranton S D = 3.4%.
    [SCRANTON]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 3.4 }],
      },
    },
    // Verified 2026-09-07: 2.5% city + 0.5% Wilkes-Barre Area S D = 3%.
    [WILKES_BARRE]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 3.0 }],
      },
    },
    // Verified 2026-09-07: 1.15% city + 0.5% Erie City S D = 1.65%.
    [ERIE]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.65 }],
      },
    },
    // Corrected 2026-09-07: 1.6% -> 1.1%. Register: 0.6% city (effective
    // 2016-01-01) + 0.5% Lancaster S D = 1.1%. 1.6% is Lancaster's rate from
    // 2025-01-01, when the city rate rose to 1.1% -- a year too early here.
    [LANCASTER]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.1 }],
      },
    },
    // Corrected 2026-09-07: 1.35% -> 1.975%. Register: 1.475% city (effective
    // 2017-12-13) + 0.5% Allentown City S D = 1.975%. Allentown's elevated
    // municipal rate is an Act 205 distressed-pension recovery rate, which is
    // why it does not look like its neighbours'.
    [ALLENTOWN]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.975 }],
      },
    },
    // Verified 2026-09-07: 0.5% city + 0.5% Bethlehem Area S D = 1%. Bethlehem
    // straddles Lehigh and Northampton counties; the register gives the same
    // total on both sides.
    [BETHLEHEM]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.0 }],
      },
    },
    // Corrected 2026-09-07: 1.0% -> 2.0%. Register: 1.5% city (effective
    // 2013-01-01) + 0.5% Harrisburg City S D = 2%. The 2023, 2025 and 2026
    // files all had 2%; only this year was low.
    [HARRISBURG]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.0 }],
      },
    },
    // Corrected 2026-09-07: 1.0% -> 1.25%. Register: 0.75% city + 0.5% York
    // City S D = 1.25%, both effective 2015-01-01.
    [YORK]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.25 }],
      },
    },
    // Corrected 2026-09-07: 1.2% -> 1.6%. Register: 1.1% city (effective
    // 2017-01-01) + 0.5% Altoona Area S D = 1.6%. The school district rate was
    // missing, and 1.2% is the city rate from 2025-01-01, a year too early.
    [ALTOONA]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.6 }],
      },
    },
    // Corrected 2026-09-07: 1.0% -> 1.6%. Register: 0.5% borough + 1.1%
    // Carlisle Area S D (effective 2016-07-01) = 1.6%.
    [CARLISLE]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.6 }],
      },
    },
    // Verified 2026-09-07: 0.5% borough + 0.5% Hanover Public S D = 1%.
    [HANOVER]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.0 }],
      },
    },
  },
} as TaxData;
