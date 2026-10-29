import { ALL_STATES } from "@/constants/states";
import type { AutocompleteOption, AvailableStatesAndCities } from "@/types";
import { preserveQueryParams, updateURL } from "@/utils/url";
import {
  snakeToDashCase,
  snakeToTitleCase,
  toSnakeCase,
} from "@/utils/string-utils";
import { Autocomplete, TextField } from "@mui/material";
import { useMemo } from "react";

type StateSelectProps = {
  availableStatesAndCities: AvailableStatesAndCities;
  year: string;
  USAState: string;
  setUSAState: (val: string) => void;
  setUSACity: (val: string) => void;
  baseRoute?: string;
};

export function StateSelect({
  availableStatesAndCities,
  year,
  USAState,
  setUSAState,
  setUSACity,
  baseRoute = "",
}: StateSelectProps) {
  const stateOptions = useMemo((): AutocompleteOption[] => {
    if (!availableStatesAndCities) {
      return ALL_STATES.map((state) => {
        const firstLetter = state[0].toUpperCase();
        return {
          firstLetter,
          title: snakeToTitleCase(state),
          disabled: true,
        };
      }).sort((a, b) => {
        if (a.firstLetter > b.firstLetter) return 1;
        if (a.firstLetter < b.firstLetter) return -1;
        return 0;
      });
    }

    return ALL_STATES.map((state) => {
      const firstLetter = state[0].toUpperCase();
      return {
        firstLetter,
        title: snakeToTitleCase(state),
        disabled: typeof availableStatesAndCities[state] === "undefined",
      };
    }).sort((a, b) => {
      if (a.disabled && !b.disabled) return 1;
      if (!a.disabled && b.disabled) return -1;
      if (a.firstLetter > b.firstLetter) return 1;
      if (a.firstLetter < b.firstLetter) return -1;
      return 0;
    });
  }, [availableStatesAndCities]);

  return (
    <Autocomplete
      id="state-select"
      options={stateOptions}
      groupBy={(option) => option.firstLetter}
      isOptionEqualToValue={(option, value) => {
        return toSnakeCase(option?.title) === toSnakeCase(value?.title);
      }}
      getOptionLabel={(option) => snakeToTitleCase(option?.title) || ""}
      getOptionDisabled={(option) => option.disabled}
      freeSolo={false}
      value={
        USAState
          ? {
              title: USAState,
              firstLetter: (USAState?.[0] || "").toUpperCase(),
              disabled: false,
            }
          : null
      }
      onInputChange={(e, val) => {
        const state = toSnakeCase(val);
        if (state === USAState) return;

        const params = preserveQueryParams();

        if (val && ALL_STATES.includes(state)) {
          updateURL(`${baseRoute}/${year}/${snakeToDashCase(state)}`, params);
          setUSAState(state);
          setUSACity("");
        } else if (!val) {
          updateURL(`${baseRoute}/${year}`, params);
          setUSAState("");
          setUSACity("");
        }
      }}
      renderInput={(params) => {
        const { key, ...props } = params as any;
        return (
          <TextField
            key={props.id || key}
            {...props}
            label="State"
            variant="standard"
          />
        );
      }}
    />
  );
}
