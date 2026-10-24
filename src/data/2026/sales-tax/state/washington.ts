import {
  AUBURN,
  BELLEVUE,
  BELLINGHAM,
  BOTHELL,
  BREMERTON,
  BURIEN,
  CITIES,
  EDMONDS,
  EVERETT,
  FEDERAL_WAY,
  ISSAQUAH,
  KENNEWICK,
  KENT,
  KIRKLAND,
  LACEY,
  LAKE_STEVENS,
  LAKEWOOD,
  LONGVIEW,
  LYNNWOOD,
  MARYSVILLE,
  MOUNT_VERNON,
  OLYMPIA,
  PASCO,
  PULLMAN,
  PUYALLUP,
  REDMOND,
  RENTON,
  RICHLAND,
  SAMMAMISH,
  SEATTLE,
  SHORELINE,
  SPOKANE,
  SPOKANE_VALLEY,
  TACOMA,
  VANCOUVER,
  WALLA_WALLA,
  WENATCHEE,
  YAKIMA,
} from "@/constants/cities";
import { LOCAL_SALES_TAX, STATE_SALES_TAX } from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// Washington Department of Revenue, "Local sales & use tax rates", quarterly
// download Rates_26Q1.csv through Rates_26Q4.csv
// (dor.wa.gov/taxes-rates/sales-use-tax-rates/downloadable-database). Each
// comment is the DOR location code and name the figure was read from; the
// file's Local column, as a percent. Every row's State column is 0.065.
//
// Where DOR splits a city by Sound Transit's district (RTA / NON-RTA) or by
// county, the code covering most of its residents is used: the RTA portion,
// and the King County portions of Auburn and Bothell.
export default {
  [STATE_SALES_TAX]: 6.5,
  // No city picked: the Tax Foundation's population-weighted average local
  // rate for Washington, 3.01% on January 1, 2026 and 3.07% on July 1, 2026
  // ("State and Local Sales Tax Rates"). It publishes twice a year, so each
  // figure stands for the two quarters that follow it.
  [LOCAL_SALES_TAX]: [3.01, 3.01, 3.07, 3.07],
  [CITIES]: {
    [SEATTLE]: { [LOCAL_SALES_TAX]: 4.05 }, // 1726 SEATTLE
    [SPOKANE]: { [LOCAL_SALES_TAX]: 2.6 }, // 3210 SPOKANE CITY
    [TACOMA]: { [LOCAL_SALES_TAX]: [3.8, 3.9, 4, 4] }, // 2717 TACOMA
    [VANCOUVER]: { [LOCAL_SALES_TAX]: [2.3, 2.4, 2.4, 2.4] }, // 0605 VANCOUVER
    [BELLEVUE]: { [LOCAL_SALES_TAX]: 3.8 }, // 1704 BELLEVUE RTA
    [KENT]: { [LOCAL_SALES_TAX]: 3.9 }, // 1715 KENT RTA
    [EVERETT]: { [LOCAL_SALES_TAX]: 3.4 }, // 3105 EVERETT RTA
    [RENTON]: { [LOCAL_SALES_TAX]: 4 }, // 1725 RENTON RTA
    [SPOKANE_VALLEY]: { [LOCAL_SALES_TAX]: 2.5 }, // 3213 SPOKANE VALLEY
    [FEDERAL_WAY]: { [LOCAL_SALES_TAX]: [3.8, 3.8, 3.9, 3.9] }, // 1732 FEDERAL WAY
    [YAKIMA]: { [LOCAL_SALES_TAX]: [2, 2, 2.1, 2.1] }, // 3913 YAKIMA CITY
    [KIRKLAND]: { [LOCAL_SALES_TAX]: 3.9 }, // 1716 KIRKLAND
    [BELLINGHAM]: { [LOCAL_SALES_TAX]: [2.6, 2.6, 2.7, 2.7] }, // 3701 BELLINGHAM
    [AUBURN]: { [LOCAL_SALES_TAX]: [3.9, 3.9, 4, 4] }, // 1702 AUBURN/KING RTA
    [KENNEWICK]: { [LOCAL_SALES_TAX]: 2.3 }, // 0302 KENNEWICK
    [PASCO]: { [LOCAL_SALES_TAX]: 2.4 }, // 1104 PASCO
    [REDMOND]: { [LOCAL_SALES_TAX]: 3.9 }, // 1724 REDMOND RTA
    [MARYSVILLE]: { [LOCAL_SALES_TAX]: 2.9 }, // 3111 MARYSVILLE
    [SAMMAMISH]: { [LOCAL_SALES_TAX]: 3.8 }, // 1739 SAMMAMISH RTA
    [LAKEWOOD]: { [LOCAL_SALES_TAX]: [3.6, 3.6, 3.8, 3.8] }, // 2721 LAKEWOOD
    [RICHLAND]: { [LOCAL_SALES_TAX]: [2.2, 2.3, 2.3, 2.3] }, // 0304 RICHLAND
    [SHORELINE]: { [LOCAL_SALES_TAX]: 4 }, // 1737 SHORELINE
    [LACEY]: { [LOCAL_SALES_TAX]: [3.2, 3.2, 3.3, 3.3] }, // 3402 LACEY
    [OLYMPIA]: { [LOCAL_SALES_TAX]: [3.3, 3.3, 3.5, 3.5] }, // 3403 OLYMPIA
    [BURIEN]: { [LOCAL_SALES_TAX]: [3.8, 3.8, 3.9, 3.9] }, // 1734 BURIEN
    [BOTHELL]: { [LOCAL_SALES_TAX]: 3.8 }, // 1706 BOTHELL/KING
    [BREMERTON]: { [LOCAL_SALES_TAX]: 2.7 }, // 1801 BREMERTON
    [EDMONDS]: { [LOCAL_SALES_TAX]: [4.1, 4.2, 4.2, 4.2] }, // 3104 EDMONDS
    [PUYALLUP]: { [LOCAL_SALES_TAX]: [3.7, 3.7, 3.8, 3.8] }, // 2711 PUYALLUP
    [LYNNWOOD]: { [LOCAL_SALES_TAX]: [4.1, 4.2, 4.2, 4.2] }, // 3110 LYNNWOOD
    [ISSAQUAH]: { [LOCAL_SALES_TAX]: 4 }, // 1714 ISSAQUAH RTA
    [LAKE_STEVENS]: { [LOCAL_SALES_TAX]: 2.8 }, // 3109 LAKE STEVENS
    [LONGVIEW]: { [LOCAL_SALES_TAX]: 1.7 }, // 0804 LONGVIEW
    [WENATCHEE]: { [LOCAL_SALES_TAX]: [2.3, 2.4, 2.5, 2.5] }, // 0405 WENATCHEE
    [MOUNT_VERNON]: { [LOCAL_SALES_TAX]: [2.3, 2.4, 2.5, 2.5] }, // 2907 MOUNT VERNON
    [WALLA_WALLA]: { [LOCAL_SALES_TAX]: 2.6 }, // 3604 WALLA WALLA CITY
    [PULLMAN]: { [LOCAL_SALES_TAX]: [1.5, 1.5, 1.7, 1.7] }, // 3812 PULLMAN
  },
} as SalesTaxData;
