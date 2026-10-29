import { INFINITY } from "@/constants";
import { ALL } from "@/constants/filing-status";
import { STATE_INCOME, COUNTY_INCOME } from "@/constants/tax-types";
import { CITIES } from "@/constants/cities";
import {
  ADAMS_COUNTY,
  ALLEN_COUNTY,
  BARTHOLOMEW_COUNTY,
  BENTON_COUNTY,
  BLACKFORD_COUNTY,
  BOONE_COUNTY,
  BROWN_COUNTY,
  CARROLL_COUNTY_IN,
  CASS_COUNTY,
  CLARK_COUNTY,
  CLAY_COUNTY,
  CLINTON_COUNTY,
  CRAWFORD_COUNTY,
  DAVIESS_COUNTY,
  DEARBORN_COUNTY,
  DECATUR_COUNTY,
  DEKALB_COUNTY,
  DELAWARE_COUNTY,
  DUBOIS_COUNTY,
  ELKHART_COUNTY,
  FAYETTE_COUNTY,
  FLOYD_COUNTY,
  FOUNTAIN_COUNTY,
  FRANKLIN_COUNTY,
  FULTON_COUNTY,
  GIBSON_COUNTY,
  GRANT_COUNTY,
  GREENE_COUNTY,
  HAMILTON_COUNTY,
  HANCOCK_COUNTY,
  HARRISON_COUNTY,
  HENDRICKS_COUNTY,
  HENRY_COUNTY,
  HOWARD_COUNTY_IN,
  HUNTINGTON_COUNTY,
  JACKSON_COUNTY,
  JASPER_COUNTY,
  JAY_COUNTY,
  JEFFERSON_COUNTY,
  JENNINGS_COUNTY,
  JOHNSON_COUNTY,
  KNOX_COUNTY,
  KOSCIUSKO_COUNTY,
  LAGRANGE_COUNTY,
  LAKE_COUNTY,
  LAPORTE_COUNTY,
  LAWRENCE_COUNTY,
  MADISON_COUNTY,
  MARION_COUNTY,
  MARSHALL_COUNTY,
  MARTIN_COUNTY,
  MIAMI_COUNTY,
  MONROE_COUNTY,
  MONTGOMERY_COUNTY_IN,
  MORGAN_COUNTY,
  NEWTON_COUNTY,
  NOBLE_COUNTY,
  OHIO_COUNTY,
  ORANGE_COUNTY,
  OWEN_COUNTY,
  PARKE_COUNTY,
  PERRY_COUNTY,
  PIKE_COUNTY,
  PORTER_COUNTY,
  POSEY_COUNTY,
  PULASKI_COUNTY,
  PUTNAM_COUNTY,
  RANDOLPH_COUNTY,
  RIPLEY_COUNTY,
  RUSH_COUNTY,
  ST_JOSEPH_COUNTY,
  SCOTT_COUNTY,
  SHELBY_COUNTY,
  SPENCER_COUNTY,
  STARKE_COUNTY,
  STEUBEN_COUNTY,
  SULLIVAN_COUNTY,
  SWITZERLAND_COUNTY,
  TIPPECANOE_COUNTY,
  TIPTON_COUNTY,
  UNION_COUNTY,
  VANDERBURGH_COUNTY,
  VERMILLION_COUNTY,
  VIGO_COUNTY,
  WABASH_COUNTY,
  WARREN_COUNTY,
  WARRICK_COUNTY,
  WASHINGTON_COUNTY_IN,
  WAYNE_COUNTY,
  WELLS_COUNTY,
  WHITE_COUNTY,
  WHITLEY_COUNTY,
} from "@/constants/cities";
import type { TaxData } from "@/types";

export default {
  [STATE_INCOME]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 2.95 }],
  },
  // SOURCE CONVENTION — READ BEFORE CHANGING ANY RATE BELOW.
  //
  // The authority for these figures is Schedule CT-40 (form 47907), "Indiana
  // County Income Tax Rates and County Codes" — the ANNUAL chart printed on the
  // back of the county tax schedule filed with the IT-40.
  //
  // It is NOT Departmental Notice #1. DN #1 is the WITHHOLDING table: it gives
  // the rate an employer withholds during a period, and it is reissued whenever
  // a rate takes effect mid-year. An Indiana county may change its rate on
  // Oct. 1 as well as Jan. 1, and when it does the ANNUAL liability is computed
  // on a blend — nine months of the old rate plus three of the new. CT-40
  // publishes that blend; DN #1 never does.
  //
  // So a rate here that looks like a typo is usually the official blend:
  // .01618, .01725, .012125, .024875, .026325 are all real CT-40 figures.
  // DO NOT "tidy" a long decimal to a round number, and do not reconcile these
  // against DN #1 and conclude they are wrong. Doing either silently breaks a
  // correct value — validate-tax-data checks structure only, and a uniformly
  // wrong Indiana is internally consistent, so nothing downstream will catch it.
  //
  // 2026: PROVISIONAL SOURCE. No Schedule CT-40 for 2026 exists yet, so these
  // 92 rates come from DOR Departmental Notice #1, R46 / 01-26, effective
  // Jan. 1, 2026 — https://www.in.gov/dor/files/dn01.pdf. That is the Jan. 1
  // rate, which equals the annual rate only if no county changes on Oct. 1,
  // 2026. If any does, CT-40 (2026) will publish a blend for it and that county
  // must be revisited here. Verified 2026-09: six were stale and are fixed
  // below; the other 86 matched. Six counties raised their rate for 2026
  // (Carroll .024733, Grant .0275, Greene .0235, Howard .0235, Shelby .017,
  // Union .0275) and the file already had those.
  [CITIES]: {
    [ADAMS_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.6 }],
      },
    },
    [ALLEN_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.59 }],
      },
    },
    [BARTHOLOMEW_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.75 }],
      },
    },
    [BENTON_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.79 }],
      },
    },
    [BLACKFORD_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.5 }],
      },
    },
    [BOONE_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.7 }],
      },
    },
    [BROWN_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.5234 }],
      },
    },
    [CARROLL_COUNTY_IN]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.4733 }],
      },
    },
    [CASS_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.95 }],
      },
    },
    [CLARK_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.0 }],
      },
    },
    [CLAY_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.35 }],
      },
    },
    [CLINTON_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.65 }],
      },
    },
    [CRAWFORD_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.65 }],
      },
    },
    [DAVIESS_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.5 }],
      },
    },
    [DEARBORN_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.4 }],
      },
    },
    [DECATUR_COUNTY]: {
      [COUNTY_INCOME]: {
        // DOR Departmental Notice #1, R46 / 01-26 (effective Jan. 1, 2026). 2024 was a blend of .025 (Jan-Sep) and .0245 (Oct 1, 2024 change);
        // the full .0245 applies from 2025 on.
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.45 }],
      },
    },
    [DEKALB_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.13 }],
      },
    },
    [DELAWARE_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.5 }],
      },
    },
    [DUBOIS_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.2 }],
      },
    },
    [ELKHART_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.0 }],
      },
    },
    [FAYETTE_COUNTY]: {
      [COUNTY_INCOME]: {
        // DOR Departmental Notice #1, R46 / 01-26 (effective Jan. 1, 2026). 2024 was a blend of .0257 (Jan-Sep) and .0282 (Oct 1, 2024 change);
        // the full .0282 applies from 2025 on.
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.82 }],
      },
    },
    [FLOYD_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.89 }],
      },
    },
    [FOUNTAIN_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.1 }],
      },
    },
    [FRANKLIN_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.7 }],
      },
    },
    [FULTON_COUNTY]: {
      [COUNTY_INCOME]: {
        // DOR Departmental Notice #1, R46 / 01-26 (effective Jan. 1, 2026). 2024 was a blend of .0268 (Jan-Sep) and .0288 (Oct 1, 2024 change);
        // the full .0288 applies from 2025 on.
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.88 }],
      },
    },
    [GIBSON_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.3 }],
      },
    },
    [GRANT_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.75 }],
      },
    },
    [GREENE_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.35 }],
      },
    },
    [HAMILTON_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.1 }],
      },
    },
    [HANCOCK_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.94 }],
      },
    },
    [HARRISON_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.0 }],
      },
    },
    [HENDRICKS_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.7 }],
      },
    },
    [HENRY_COUNTY]: {
      [COUNTY_INCOME]: {
        // DOR Departmental Notice #1, R46 / 01-26 (effective Jan. 1, 2026). 2024 was a blend of .018 (Jan-Sep) and .0202 (Oct 1, 2024 change);
        // the full .0202 applies from 2025 on.
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.02 }],
      },
    },
    [HOWARD_COUNTY_IN]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.35 }],
      },
    },
    [HUNTINGTON_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.95 }],
      },
    },
    [JACKSON_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.1 }],
      },
    },
    [JASPER_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.864 }],
      },
    },
    [JAY_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.5 }],
      },
    },
    [JEFFERSON_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.03 }],
      },
    },
    [JENNINGS_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.5 }],
      },
    },
    [JOHNSON_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.4 }],
      },
    },
    [KNOX_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.7 }],
      },
    },
    [KOSCIUSKO_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.0 }],
      },
    },
    [LAGRANGE_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.65 }],
      },
    },
    [LAKE_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.5 }],
      },
    },
    [LAPORTE_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.45 }],
      },
    },
    [LAWRENCE_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.75 }],
      },
    },
    [MADISON_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.25 }],
      },
    },
    [MARION_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.02 }],
      },
    },
    [MARSHALL_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.25 }],
      },
    },
    [MARTIN_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.5 }],
      },
    },
    [MIAMI_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.54 }],
      },
    },
    [MONROE_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.14 }],
      },
    },
    [MONTGOMERY_COUNTY_IN]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.65 }],
      },
    },
    [MORGAN_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.72 }],
      },
    },
    [NEWTON_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.0 }],
      },
    },
    [NOBLE_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.75 }],
      },
    },
    [OHIO_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.0 }],
      },
    },
    [ORANGE_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.75 }],
      },
    },
    [OWEN_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.5 }],
      },
    },
    [PARKE_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.65 }],
      },
    },
    [PERRY_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.4 }],
      },
    },
    [PIKE_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.2 }],
      },
    },
    [PORTER_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 0.5 }],
      },
    },
    [POSEY_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.45 }],
      },
    },
    [PULASKI_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.85 }],
      },
    },
    [PUTNAM_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.3 }],
      },
    },
    [RANDOLPH_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 3.0 }],
      },
    },
    [RIPLEY_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.38 }],
      },
    },
    [RUSH_COUNTY]: {
      [COUNTY_INCOME]: {
        // DOR Departmental Notice #1, R46 / 01-26 (effective Jan. 1, 2026). raised from .021 effective Jan 1, 2025.
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.15 }],
      },
    },
    [ST_JOSEPH_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.75 }],
      },
    },
    [SCOTT_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.16 }],
      },
    },
    [SHELBY_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.7 }],
      },
    },
    [SPENCER_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 0.8 }],
      },
    },
    [STARKE_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.71 }],
      },
    },
    [STEUBEN_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.99 }],
      },
    },
    [SULLIVAN_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.7 }],
      },
    },
    [SWITZERLAND_COUNTY]: {
      [COUNTY_INCOME]: {
        // DOR Departmental Notice #1, R46 / 01-26 (effective Jan. 1, 2026). raised from .0125 effective Jan 1, 2025.
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.45 }],
      },
    },
    [TIPPECANOE_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.28 }],
      },
    },
    [TIPTON_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.6 }],
      },
    },
    [UNION_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.75 }],
      },
    },
    [VANDERBURGH_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.25 }],
      },
    },
    [VERMILLION_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.5 }],
      },
    },
    [VIGO_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.0 }],
      },
    },
    [WABASH_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.9 }],
      },
    },
    [WARREN_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.12 }],
      },
    },
    [WARRICK_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.0 }],
      },
    },
    [WASHINGTON_COUNTY_IN]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.0 }],
      },
    },
    [WAYNE_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.25 }],
      },
    },
    [WELLS_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.1 }],
      },
    },
    [WHITE_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.32 }],
      },
    },
    [WHITLEY_COUNTY]: {
      [COUNTY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.6829 }],
      },
    },
  },
} as TaxData;
