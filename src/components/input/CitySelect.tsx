import type { AvailableStatesAndCities } from "@/types";
import { preserveQueryParams, updateURL } from "@/utils/url";
import {
  snakeToDashCase,
  snakeToTitleCase,
  toSnakeCase,
} from "@/utils/string-utils";
import { Autocomplete, TextField } from "@mui/material";
import { useMemo } from "react";

type CitySelectProps = {
  availableStatesAndCities: AvailableStatesAndCities;
  year: string;
  USAState: string;
  USACity: string;
  setUSACity: (val: string) => void;
  baseRoute?: string;
};

export function CitySelect({
  availableStatesAndCities,
  year,
  USAState,
  USACity,
  setUSACity,
  baseRoute = "",
}: CitySelectProps) {
  const cityOptions = useMemo(() => {
    if (
      !availableStatesAndCities ||
      typeof availableStatesAndCities[USAState]?.cities === "undefined"
    ) {
      return null;
    }

    return availableStatesAndCities[USAState]?.cities.map((city: string) => {
      return {
        title: city,
      };
    });
  }, [availableStatesAndCities, USAState]);

  if (!cityOptions) {
    // Before a state is chosen there is nothing to make a claim about; saying
    // "no specific city taxes" there reads as a statement about a state the
    // user has not picked yet.
    const message = USAState
      ? "No specific city taxes"
      : "Select a state first";
    return (
      <TextField
        fullWidth
        label="City"
        variant="standard"
        disabled={true}
        value={message}
        inputProps={{
          "aria-label": `City - ${message}`,
        }}
      />
    );
  }
  return (
    <Autocomplete
      id="city-select"
      options={cityOptions}
      getOptionLabel={(option) => snakeToTitleCase(option?.title) || ""}
      freeSolo={false}
      value={
        USACity
          ? {
              title: USACity,
            }
          : null
      }
      isOptionEqualToValue={(option, value) => {
        return toSnakeCase(option?.title) === toSnakeCase(value?.title);
      }}
      onInputChange={(e, val) => {
        const city = toSnakeCase(val);
        if (city === USACity) return;

        const params = preserveQueryParams();

        if (val && cityOptions.find((c) => c.title?.toLowerCase() === city)) {
          updateURL(
            `${baseRoute}/${year}/${snakeToDashCase(USAState)}/${snakeToDashCase(city)}`,
            params,
          );
          setUSACity(city);
        } else {
          setUSACity("");
          updateURL(
            `${baseRoute}/${year}/${snakeToDashCase(USAState)}`,
            params,
          );
        }
      }}
      renderInput={(params) => {
        const { key, ...props } = params as any;
        return (
          <TextField
            key={props.id || key}
            {...props}
            label="City"
            variant="standard"
          />
        );
      }}
    />
  );
}
