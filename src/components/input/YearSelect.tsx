import type { AvailableStatesAndCities } from "@/types";
import { preserveQueryParams, updateURL } from "@/utils/url";
import { snakeToDashCase } from "@/utils/string-utils";
import { MenuItem, TextField } from "@mui/material";

type YearSelectProps = {
  availableYears: string[];
  year: string;
  USAState: string;
  USACity: string;
  setYear: (val: string) => void;
  baseRoute?: string;
  /**
   * Pass both to drop a city the newly picked year does not list, rather
   * than send the visitor to a page that was never generated. Seattle's tax
   * table exists for the years with sales tax data, not before.
   */
  statesAndCitiesForYear?: { [year: string]: AvailableStatesAndCities };
  setUSACity?: (val: string) => void;
};

export function YearSelect({
  availableYears,
  year,
  USAState,
  USACity,
  setYear,
  baseRoute = "",
  statesAndCitiesForYear,
  setUSACity,
}: YearSelectProps) {
  // `availableYears` is sorted newest-first by readTaxDataFromDisk. Use it rather
  // than the calendar year: on January 1st those disagree, and the mismatch
  // routes the newest data year to /{year} while / still serves it, producing
  // two URLs with identical content.
  const latestDataYear = availableYears[0];

  return (
    <TextField
      fullWidth
      select
      label="Tax Year"
      id="tax-year-select"
      data-testid="tax-year-select"
      value={year}
      onChange={(e) => {
        const selectedYear = e.target.value;

        const params = preserveQueryParams();

        const city =
          setUSACity &&
          statesAndCitiesForYear &&
          !statesAndCitiesForYear[selectedYear]?.[USAState]?.cities.includes(
            USACity,
          )
            ? ""
            : USACity;

        // If selecting the newest data year and no state/city, go to homepage
        const isCurrentYear = selectedYear === latestDataYear;
        const hasStateOrCity = USAState || city;

        let newUrl: string;
        if (isCurrentYear && !hasStateOrCity) {
          newUrl = baseRoute || "/";
        } else {
          newUrl = `${baseRoute}/${selectedYear}`;
          if (USAState) {
            newUrl += `/${snakeToDashCase(USAState)}`;
          }
          if (city) {
            newUrl += `/${snakeToDashCase(city)}`;
          }
        }

        updateURL(newUrl, params);
        setYear(selectedYear);
        if (city !== USACity) {
          setUSACity?.(city);
        }
      }}
      variant="standard"
    >
      {availableYears.map((option: string) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  );
}
