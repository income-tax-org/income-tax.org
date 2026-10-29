"use client";

import { Autocomplete, Box, Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { loadSalesTax } from "@/data-loaders/sales-tax";
import type { TaxData } from "@/types";
import { citiesForState } from "@/utils/compare-locations";
import type { ComparedLocation } from "@/utils/compare-locations";
import { salesTaxCitiesFor } from "@/utils/sales-tax";
import { snakeToTitleCase } from "@/utils/string-utils";

export function LocationPicker({
  stateOptions,
  stateTaxesByState,
  year,
  onAdd,
}: {
  stateOptions: { state: string; title: string }[];
  stateTaxesByState: Record<string, TaxData>;
  year: string;
  onAdd: (location: ComparedLocation) => void;
}) {
  const [pendingState, setPendingState] = useState<string>("");
  const [pendingCity, setPendingCity] = useState<string>("");
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Cities only become known once the state's data is in hand. Cities that
  // differ only in sales tax, like Seattle, are offered whether or not sales
  // tax is switched on, so a location list does not change shape with it.
  useEffect(() => {
    let cancelled = false;
    setPendingCity("");
    if (!pendingState) {
      setCityOptions([]);
      return;
    }
    setLoadingCities(true);
    (async () => {
      try {
        const [incomeCities, salesTaxCities] = await Promise.all([
          stateTaxesByState[pendingState]
            ? citiesForState(stateTaxesByState[pendingState])
            : import(`@/data/${year}/state/${pendingState}.ts`).then(
                (mod: { default: TaxData }) => citiesForState(mod.default),
                () => [],
              ),
          loadSalesTax(year, pendingState).then(salesTaxCitiesFor),
        ]);
        if (!cancelled) {
          setCityOptions(
            Array.from(new Set([...incomeCities, ...salesTaxCities])).sort(),
          );
        }
      } finally {
        if (!cancelled) setLoadingCities(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pendingState, stateTaxesByState, year]);

  const add = () => {
    if (!pendingState) return;
    onAdd({ state: pendingState, city: pendingCity });
    setPendingState("");
    setPendingCity("");
  };

  const hasCities = cityOptions.length > 0;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr auto" },
        gap: 2,
        alignItems: "start",
        maxWidth: 700,
      }}
    >
      <Autocomplete
        id="compare-state-select"
        options={stateOptions}
        getOptionLabel={(option) => option.title}
        isOptionEqualToValue={(option, value) => option.state === value.state}
        value={stateOptions.find((o) => o.state === pendingState) ?? null}
        onChange={(event, value) => setPendingState(value?.state ?? "")}
        renderInput={(params) => {
          const { key, ...props } = params as any;
          return (
            <TextField
              key={props.id || key}
              {...props}
              label="Add a state"
              variant="standard"
            />
          );
        }}
      />

      <Autocomplete
        id="compare-city-select"
        options={cityOptions}
        getOptionLabel={(option) => snakeToTitleCase(option)}
        disabled={!pendingState || !hasCities}
        value={pendingCity || null}
        onChange={(event, city) => setPendingCity(city ?? "")}
        renderInput={(params) => {
          const { key, ...props } = params as any;
          return (
            <TextField
              key={props.id || key}
              {...props}
              label={
                !pendingState
                  ? "City"
                  : loadingCities
                    ? "Checking for city taxes…"
                    : hasCities
                      ? "City (optional)"
                      : "No city taxes or city sales tax data here"
              }
              variant="standard"
              helperText={
                pendingState && hasCities
                  ? "Leave blank for the state alone"
                  : " "
              }
            />
          );
        }}
      />

      <Button
        variant="outlined"
        onClick={add}
        disabled={!pendingState}
        sx={{ mt: { xs: 0, sm: 2 }, whiteSpace: "nowrap" }}
      >
        Add
      </Button>
    </Box>
  );
}
