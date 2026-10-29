"use client";

import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link as MuiLink,
  TextField,
  InputAdornment,
  Divider,
} from "@mui/material";
import { ExpandMore, LocationCity, Search } from "@mui/icons-material";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { snakeToDashCase, snakeToTitleCase } from "@/utils/string-utils";
import { YearSelect } from "./input/YearSelect";
import { CITY_TAXES } from "@/constants/pages";
import type { TaxData } from "@/types";
import { ALL_STATES } from "@/constants/states";
import { useUrlSelectionOnPopState } from "@/hooks/use-url-selection";

interface City {
  cityKey: string;
  cityName: string;
  taxTypes: string[];
}

interface StateData {
  stateName: string;
  cities: City[];
}

interface CityTaxListData {
  [stateKey: string]: StateData;
}

interface CityTaxesProps {
  availableYears: string[];
  defaultYear: string;
  cityTaxList: CityTaxListData;
}

export default function CityTaxes({
  availableYears,
  defaultYear,
  cityTaxList: initialCityTaxList,
}: CityTaxesProps) {
  const [year, setYear] = useState(defaultYear);
  const [cityTaxList, setCityTaxList] = useState(initialCityTaxList);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set());

  // This page selects a year only; state and city are links, not local state.
  useUrlSelectionOnPopState({
    year,
    defaultYear,
    setYear,
    baseRoute: CITY_TAXES.route,
  });

  // Fetch city tax list when year changes
  useEffect(() => {
    // Guards against a slower earlier year resolving after a faster later one
    // and overwriting it.
    let cancelled = false;

    async function fetchCityTaxList() {
      const cityTaxList: CityTaxListData = {};

      // Load every state's data for this year in parallel rather than in
      // sequence — this is 51 chunk fetches.
      const loaded = await Promise.all(
        ALL_STATES.map(async (stateKey: string) => {
          try {
            const stateTaxData = (await import(
              `@/data/${year}/state/${stateKey}.ts`
            )) as { default: TaxData };
            return { stateKey, taxData: stateTaxData.default };
          } catch {
            // No data file for this state in this year
            return null;
          }
        }),
      );

      for (const entry of loaded) {
        if (!entry) {
          continue;
        }
        const { stateKey, taxData } = entry;

        // Skip states without city taxes
        const cities = Object.keys(taxData.cities || {});
        if (cities.length === 0) {
          continue;
        }

        cityTaxList[stateKey] = {
          stateName: snakeToTitleCase(stateKey),
          cities: cities.map((cityKey) => ({
            cityKey,
            cityName: snakeToTitleCase(cityKey),
            taxTypes: Object.keys(taxData.cities?.[cityKey] || {}),
          })),
        };
      }

      if (!cancelled) {
        setCityTaxList(cityTaxList);
      }
    }

    fetchCityTaxList();

    return () => {
      cancelled = true;
    };
  }, [year]);

  // Filter states and cities based on search query
  const filteredStateEntries = useMemo(() => {
    const stateEntries = Object.entries(cityTaxList).sort((a, b) =>
      a[1].stateName.localeCompare(b[1].stateName),
    );

    if (!searchQuery.trim()) {
      return stateEntries;
    }

    const query = searchQuery.toLowerCase();

    return stateEntries
      .map(([stateKey, stateData]) => {
        // Check if state name matches
        const stateMatches = stateData.stateName.toLowerCase().includes(query);

        // Filter cities that match the search
        const filteredCities = stateData.cities.filter((city) =>
          city.cityName.toLowerCase().includes(query),
        );

        // Include state if state name matches or if it has matching cities
        if (stateMatches || filteredCities.length > 0) {
          return [
            stateKey,
            {
              ...stateData,
              // If state name matches, show all cities; otherwise show filtered cities
              cities: stateMatches ? stateData.cities : filteredCities,
            },
          ] as [string, StateData];
        }

        return null;
      })
      .filter((entry): entry is [string, StateData] => entry !== null);
  }, [cityTaxList, searchQuery]);

  // Auto-expand all states when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      // Expand all filtered states when searching
      const stateKeys = new Set(filteredStateEntries.map(([key]) => key));
      setExpandedStates(stateKeys);
    } else {
      // Clear expanded states when not searching
      setExpandedStates(new Set());
    }
  }, [searchQuery, filteredStateEntries]);

  const handleAccordionChange = (stateKey: string) => {
    setExpandedStates((prev) => {
      const next = new Set(prev);
      if (next.has(stateKey)) {
        next.delete(stateKey);
      } else {
        next.add(stateKey);
      }
      return next;
    });
  };

  const totalStates = filteredStateEntries.length;
  const totalCities = filteredStateEntries.reduce(
    (sum, [, state]) => sum + state.cities.length,
    0,
  );

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
        Explore U.S. cities that impose local income taxes and view their tax
        structures.
      </Typography>
      {/* A four-option dropdown does not need the full page width. */}
      <Box sx={{ mb: 3, maxWidth: 220 }}>
        <YearSelect
          availableYears={availableYears}
          year={year}
          USAState=""
          USACity=""
          setYear={setYear}
          baseRoute={CITY_TAXES.route}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Search states and cities"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Typography variant="body1" sx={{ mb: 3 }}>
        {searchQuery ? (
          <>
            Found <strong>{totalStates}</strong> state
            {totalStates !== 1 ? "s" : ""} with <strong>{totalCities}</strong>{" "}
            {totalCities !== 1 ? "cities" : "city"} matching &quot;
            {searchQuery}&quot; in {year}.
          </>
        ) : (
          <>
            The following <strong>{totalStates}</strong> state
            {totalStates !== 1 ? "s have" : " has"}{" "}
            <strong>{totalCities}</strong>{" "}
            {totalCities !== 1 ? "cities" : "city"} with specific taxes in{" "}
            {year}.
          </>
        )}{" "}
        Click on a city to view its tax details.
      </Typography>

      {filteredStateEntries.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            {searchQuery
              ? `No cities or states found matching "${searchQuery}" for ${year}.`
              : `No cities with local taxes found for ${year}.`}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          {filteredStateEntries.map(([stateKey, stateData]) => (
            <Accordion
              key={stateKey}
              sx={{ mb: 1 }}
              expanded={expandedStates.has(stateKey)}
              onChange={() => handleAccordionChange(stateKey)}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls={`${stateKey}-content`}
                id={`${stateKey}-header`}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  {stateData.stateName} ({stateData.cities.length}{" "}
                  {stateData.cities.length === 1 ? "city" : "cities"})
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <Box>
                  {stateData.cities.map((city, index) => {
                    // Build URL with all city tax types as query parameter (convert to dash-case)
                    const taxTablesParam = encodeURIComponent(
                      city.taxTypes.map(snakeToDashCase).join(","),
                    );
                    const href = `/tax-tables/${year}/${snakeToDashCase(stateKey)}/${snakeToDashCase(city.cityKey)}?tables=${taxTablesParam}`;

                    return (
                      <Box key={city.cityKey}>
                        <MuiLink
                          component={Link}
                          href={href}
                          prefetch={false}
                          sx={{
                            textDecoration: "none",
                            p: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                          }}
                        >
                          <LocationCity color="action" fontSize="small" />
                          <Typography variant="body1" color="text.primary">
                            {city.cityName}
                          </Typography>
                        </MuiLink>
                        {index < stateData.cities.length - 1 && <Divider />}
                      </Box>
                    );
                  })}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
}
