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
    [ALL]: [
      {
        min: 0,
        max: INFINITY,
        rate: 3.07,
      },
    ],
  },
  // Every rate below is the total *resident* earned income tax -- the
  // municipal rate plus the school district rate -- taken from the DCED
  // official EIT tax register for this year. The register is reachable from
  // https://dced.pa.gov/local-government/local-income-tax-information/ ->
  // "Tax Registers (Official)", historic report, reporting period 2023.
  // Six of the fourteen were wrong; all six are corrected below.
  [CITIES]: {
    // Corrected 2026-09-07: 3.74% -> 3.79%. 3.74% is the rate Philadelphia
    // set on 2025-07-01, more than two years after this tax year.
    //
    // Philadelphia's Wage Tax changes every July 1, which this data model
    // cannot express, so the repo's convention (see the Alabama files and
    // 2026/SOURCING-STATUS.md) is to carry the rate in effect at the start of
    // the calendar year. For 2023 that is the 3.79% resident rate set on
    // 2022-07-01; it fell to 3.75% on 2023-07-01.
    // Source: City of Philadelphia, Wage Tax (employers), rate history table.
    // https://www.phila.gov/services/payments-assistance-taxes/business-taxes/wage-tax-employers/
    [PHILADELPHIA]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 3.79 }],
      },
    },
    // Verified 2026-09-07: 1% city + 2% Pittsburgh S D = 3%.
    [PITTSBURGH]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 3.0 }],
      },
    },
    // Verified 2026-09-07: 2.4% city + 1% Scranton S D = 3.4%.
    [SCRANTON]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 3.4 }],
      },
    },
    // Verified 2026-09-07: 2.1% city + 1.5% Reading S D = 3.6%.
    [READING]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 3.6 }],
      },
    },
    // Verified 2026-09-07: 2.5% city + 0.5% Wilkes-Barre Area S D = 3%.
    [WILKES_BARRE]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 3.0 }],
      },
    },
    // Corrected 2026-09-07: 1.95% -> 1.65%. Register: 1.15% city + 0.5% Erie
    // City S D = 1.65%, both effective 2020-01-01, so 1.95% was not Erie's
    // rate in any of the four years this repo covers.
    [ERIE]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.65 }],
      },
    },
    // Corrected 2026-09-07: 1.35% -> 1.1%. Register: 0.6% city (effective
    // 2016-01-01) + 0.5% Lancaster S D = 1.1%. The city rate did not rise to
    // 1.1% -- and the total to 1.6% -- until 2025-01-01.
    [LANCASTER]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.1 }],
      },
    },
    // Corrected 2026-09-07: 1.4% -> 1.975%. Register: 1.475% city (effective
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
    // Verified 2026-09-07: 1.5% city + 0.5% Harrisburg City S D = 2%.
    [HARRISBURG]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.0 }],
      },
    },
    // Verified 2026-09-07: 0.75% city + 0.5% York City S D = 1.25%.
    [YORK]: {
      [LOCAL_EARNED_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.25 }],
      },
    },
    // Corrected 2026-09-07: 1.0% -> 1.6%. Register: 1.1% city (effective
    // 2017-01-01) + 0.5% Altoona Area S D = 1.6%. The school district rate was
    // missing altogether.
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
