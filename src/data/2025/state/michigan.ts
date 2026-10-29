import { INFINITY } from "@/constants";
import {
  ALBION,
  BATTLE_CREEK,
  BENTON_HARBOR,
  BIG_RAPIDS,
  CITIES,
  DETROIT,
  EAST_LANSING,
  FLINT,
  GRAND_RAPIDS,
  GRAYLING,
  HAMTRAMCK,
  HIGHLAND_PARK,
  HUDSON,
  IONIA,
  JACKSON,
  LANSING,
  LAPEER,
  MUSKEGON,
  MUSKEGON_HEIGHTS,
  PONTIAC,
  PORT_HURON,
  PORTLAND_MI,
  SAGINAW,
  SPRINGFIELD,
  WALKER,
} from "@/constants/cities";
import { ALL } from "@/constants/filing-status";
import { CITY_INCOME, STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  [STATE_INCOME]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 4.25 }],
  },
  [CITIES]: {
    // Rates verified 2026-09-07 against the Michigan City Income Tax Act and
    // the cities' own ordinances; no change in any of the four years.
    // MCL 141.611 sets the default at 1% resident / 0.5% non-resident, and the
    // only ways above it are closed classes: MCL 141.503(2)(d) gives a city
    // over 600,000 (Detroit alone) 2.40%/1.20%; MCL 141.503a(2) gives 2%/1% on
    // a pre-Nov-1988 vote (Highland Park); MCL 141.503c gives 1.5%/0.75%
    // (Grand Rapids, Saginaw). So no other Michigan city can exceed 1%.
    // These are the RESIDENT rates, which is what a take-home calculator wants.
    // Confirmed directly: Detroit 2.4% (Treasury Form 5469, TY2023-TY2026),
    // Highland Park 2.0% (HP-1040 booklet), Grand Rapids 1.5% ("July 1, 2010 -
    // Present"), Saginaw 1.50%, Flint 1%, Muskegon 1%.
    // Treasury's roster of the 24 taxing cities matches this list exactly.
    //
    // The other seventeen 1% cities were deliberately NOT sourced one page at a
    // time, and that is not a gap. A city page tells you what it said the day
    // you fetched it; MCL 141.611 and the closed classes above tell you what is
    // possible, which is the stronger guarantee. Those seventeen are capped at
    // 1% by statute -- none of them is over 600,000, none had a pre-Nov-1988
    // rate vote, none sits in 141.503c's population bands, and 141.503b lapsed
    // on its own 13-year limit. A rate above 1% in any of them would need an
    // act of the Legislature first, so re-verifying them city by city buys
    // nothing. Check for a new statutory exception, not for 17 changed pages.
    // (A city may adopt a rate BELOW 1%; none currently does.)
    //
    // NOT MODELLED: Michigan cities allow a personal/dependency exemption, not
    // a standard deduction -- $600 per exemption in Detroit and Highland Park.
    // Nothing here subtracts it, so city tax is charged on gross and is
    // overstated by rate x exemptions: $14.40/yr for a single Detroit filer,
    // $6.00 in a 1% city, ~$57.60 for a Detroit family of four.
    // https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-141-611
    // https://www.michigan.gov/taxes/questions/iit/accordion/general/what-cities-impose-an-income-tax
    [DETROIT]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2.4 }],
      },
    },
    [HIGHLAND_PARK]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 2 }],
      },
    },
    [GRAND_RAPIDS]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.5 }],
      },
    },
    [SAGINAW]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1.5 }],
      },
    },
    [ALBION]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [BATTLE_CREEK]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [BENTON_HARBOR]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [BIG_RAPIDS]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [EAST_LANSING]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [FLINT]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [GRAYLING]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [HAMTRAMCK]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [HUDSON]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [IONIA]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [JACKSON]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [LANSING]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [LAPEER]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [MUSKEGON]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [MUSKEGON_HEIGHTS]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [PONTIAC]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [PORT_HURON]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [PORTLAND_MI]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [SPRINGFIELD]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
    [WALKER]: {
      [CITY_INCOME]: {
        [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
      },
    },
  },
} as TaxData;
