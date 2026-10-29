"use client";
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { YearSelect } from "./input/YearSelect";
import { StateSelect } from "./input/StateSelect";
import { CitySelect } from "./input/CitySelect";
import type { AvailableStatesAndCities, SalesTaxData, TaxData } from "@/types";
import { useEffect, useMemo, useState, useRef } from "react";
import { TAX_TABLES } from "@/constants/pages";
import { TaxOptionsSelect } from "./input/TaxOptionsSelect";
import { EMPTY_STANDARD_DEDUCTION_MAP } from "@/constants/filing-status";
import type { StandardDeductionByFilingStatus } from "@/types";
import { CITIES, STATE_SCOPE } from "@/constants";
import type { TaxOption } from "@/utils/get-tax-options";
import { useTaxOptions } from "@/hooks/use-tax-options";
import {
  cityTaxKey,
  dashToSnakeCase,
  snakeToDashCase,
  snakeToTitleCase,
} from "@/utils/string-utils";
import { useTaxData } from "@/hooks/use-tax-data";
// Aliased: MUI exports a `Table` in the type space too.
import type { Table as TaxTableModel } from "@/utils/tax-table-data";
import {
  salesTaxToTable,
  standardDeductionMapToTable,
  tableDataFromTaxData,
} from "@/utils/tax-table-data";
import { FEDERAL_INCOME, SALES_TAX, STATE_INCOME } from "@/constants/tax-types";
import { loadSalesTax } from "@/data-loaders/sales-tax";
import type { TaxDataSelectOption } from "./input/TaxDataSelect";
import { TaxDataSelect } from "./input/TaxDataSelect";
import { getQueryParams, updateURL } from "@/utils/url";
import { useUrlSelectionOnPopState } from "@/hooks/use-url-selection";
import { asCurrency, formatMoneyNoCents } from "@/utils/money";

type TaxTableProps = {
  availableYears: string[];
  statesAndCitiesForYear: { [year: string]: AvailableStatesAndCities };
  defaultYear: string;
  defaultFederalTaxes: TaxData;
  defaultStateTaxes: TaxData;
  defaultUSAState?: string | undefined;
  defaultUSACity?: string;
};

const taxDataMap = {
  standardFederalDeductions: () => "Standard Federal Deductions",
  standardStateDeductions: (state: string) =>
    `Standard ${snakeToTitleCase(state)} Deductions`,
  max401kContributions: () => "Max 401(k) Contributions",
};

/**
 * Resolve a `?tables=` value against the options currently available.
 *
 * Returns null when there is nothing to resolve against -- no param, or the
 * options for this year/state/city have not been derived yet -- which callers
 * treat as "clear the selection" rather than "match nothing".
 */
function matchTaxOptions(
  tablesParam: string | null,
  taxOptions: TaxOption[],
): TaxOption[] | null {
  if (!tablesParam || taxOptions.length === 0) {
    return null;
  }
  const wanted = tablesParam
    .split(",")
    .map((value) => dashToSnakeCase(value.trim()));
  return taxOptions.filter((option) => wanted.includes(option.value));
}

export default function TaxTables({
  availableYears,
  statesAndCitiesForYear,
  defaultFederalTaxes,
  defaultStateTaxes,
  defaultYear,
  defaultUSAState,
  defaultUSACity,
}: TaxTableProps) {
  const [year, setYear] = useState(defaultYear);
  const [USAState, setUSAState] = useState(defaultUSAState || "");
  const [USACity, setUSACity] = useState(defaultUSACity || "");

  const [stateTaxes, setStateTaxes] = useState<TaxData>(defaultStateTaxes);
  const [federalTaxes, setFederalTaxes] =
    useState<TaxData>(defaultFederalTaxes);

  const [selectedTaxes, setSelectedTaxes] = useState<TaxOption[]>(
    [] as TaxOption[],
  );

  const [selectedTaxData, setSelectedTaxData] = useState<TaxDataSelectOption[]>(
    [] as TaxDataSelectOption[],
  );

  const [federalStandardDeductionMap, setFederalStandardDeductionMap] =
    useState<StandardDeductionByFilingStatus>(EMPTY_STANDARD_DEDUCTION_MAP);
  const [stateStandardDeductionMap, setStateStandardDeductionMap] =
    useState<StandardDeductionByFilingStatus>(EMPTY_STANDARD_DEDUCTION_MAP);

  const [max401KContribution, setMax401KContribution] = useState(0);

  // Undefined until loaded; null where the year has no data for the state.
  const [salesTax, setSalesTax] = useState<SalesTaxData | null | undefined>(
    undefined,
  );

  // Both guard the URL-writing effect below, which must not push a history
  // entry for a selection that came from the URL in the first place.
  const isInitializedFromURL = useRef(false);
  const isUpdatingFromInit = useRef(false);

  const availableStatesAndCities = useMemo(() => {
    return statesAndCitiesForYear[year];
  }, [statesAndCitiesForYear, year]);

  useTaxData({
    year,
    USAState,
    setFederalTaxes,
    setStateTaxes,
    setUSAState,
    setUSACity,
    baseRoute: TAX_TABLES.route,
  });

  const incomeTaxOptions = useTaxOptions({
    federalTaxes,
    stateTaxes,
    USACity,
    USAState,
    setFederalStandardDeductionMap,
    setStateStandardDeductionMap,
    setMax401KContribution,
  });

  // Sales tax is offered for every state, data or not, so that a year
  // without it says so instead of the option quietly disappearing.
  const taxOptions = useMemo((): TaxOption[] => {
    if (!USAState) {
      return incomeTaxOptions;
    }
    return [
      ...incomeTaxOptions,
      {
        title: snakeToTitleCase(`${USAState}_${SALES_TAX}`),
        value: SALES_TAX,
        scope: STATE_SCOPE,
        disabled: false,
      },
    ];
  }, [incomeTaxOptions, USAState]);

  const showsSalesTax = selectedTaxes.some((tax) => tax.value === SALES_TAX);
  useEffect(() => {
    setSalesTax(undefined);
    if (!showsSalesTax || !USAState) {
      return;
    }
    let cancelled = false;
    loadSalesTax(year, USAState).then((data) => {
      if (!cancelled) {
        setSalesTax(data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [showsSalesTax, year, USAState]);

  useUrlSelectionOnPopState({
    year,
    defaultYear,
    setYear,
    USAState,
    setUSAState,
    USACity,
    setUSACity,
    baseRoute: TAX_TABLES.route,
    onQueryParams: (params) => {
      const matching = matchTaxOptions(params.get("tables"), taxOptions);
      if (matching === null) {
        isUpdatingFromInit.current = true;
        setSelectedTaxes([]);
        return;
      }
      if (matching.length > 0) {
        isUpdatingFromInit.current = true;
        setSelectedTaxes(matching);
      }
    },
  });

  // Initialize selectedTaxes from URL query param on mount
  useEffect(() => {
    const matching = matchTaxOptions(
      getQueryParams().get("tables"),
      taxOptions,
    );
    if (matching && matching.length > 0) {
      isUpdatingFromInit.current = true;
      setSelectedTaxes(matching);
    }
    isInitializedFromURL.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxOptions.length]);

  // Validate and filter selected taxes when taxOptions change (e.g., when state/city changes)
  useEffect(() => {
    if (isInitializedFromURL.current && taxOptions.length > 0) {
      // Filter out any selected taxes that are no longer valid
      const validSelectedTaxes = selectedTaxes.filter((selectedTax) =>
        taxOptions.some((option) => option.value === selectedTax.value),
      );

      // Only update if something was filtered out
      if (validSelectedTaxes.length !== selectedTaxes.length) {
        isUpdatingFromInit.current = true;
        setSelectedTaxes(validSelectedTaxes);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxOptions]);

  // Update URL when selectedTaxes changes (but not during initialization)
  useEffect(() => {
    // Skip URL update if we haven't initialized yet
    if (!isInitializedFromURL.current) {
      return;
    }

    // Skip URL update if this change is from initialization
    if (isUpdatingFromInit.current) {
      isUpdatingFromInit.current = false;
      return;
    }

    // Build the path based on current year, state, and city
    const isCurrentYear = year === availableYears[0];
    const hasStateOrCity = USAState || USACity;

    let path: string;
    if (isCurrentYear && !hasStateOrCity) {
      path = TAX_TABLES.route;
    } else {
      path = `${TAX_TABLES.route}/${year}`;
      if (USAState) {
        path += `/${USAState.replace(/_/g, "-")}`;
        if (USACity) {
          path += `/${USACity.replace(/_/g, "-")}`;
        }
      }
    }

    if (selectedTaxes.length > 0) {
      // Create comma-separated list of tax table values (convert to dash-case for URL)
      const tablesValue = selectedTaxes
        .map((tax) => snakeToDashCase(tax.value))
        .join(",");
      updateURL(path, { tables: tablesValue });
    } else {
      // If no tables selected, update URL without the tables param
      updateURL(path);
    }
  }, [selectedTaxes, year, USAState, USACity, availableYears]);

  const taxDataOptions = useMemo(() => {
    const taxDataOptions = [] as TaxDataSelectOption[];
    if (federalStandardDeductionMap) {
      taxDataOptions.push({
        title: taxDataMap.standardFederalDeductions(),
      });
    }
    if (stateStandardDeductionMap && USAState) {
      taxDataOptions.push({
        title: taxDataMap.standardStateDeductions(USAState),
      });
    }
    if (max401KContribution) {
      taxDataOptions.push({
        title: taxDataMap.max401kContributions(),
      });
    }
    return taxDataOptions;
  }, [
    federalStandardDeductionMap,
    stateStandardDeductionMap,
    USAState,
    max401KContribution,
  ]);

  const taxTables = useMemo(() => {
    const tables: TaxTableModel[] = [] as TaxTableModel[];

    for (const selectedTax of selectedTaxes) {
      const tax = selectedTax.value;
      if (tax === SALES_TAX) {
        if (salesTax !== undefined) {
          tables.push(
            salesTaxToTable(
              `${USACity || USAState}_${SALES_TAX}`,
              salesTax,
              year,
              USACity,
            ),
          );
        }
        continue;
      }
      if (federalTaxes[tax]) {
        tables.push(tableDataFromTaxData(tax, federalTaxes[tax]));
      }
      if (stateTaxes[tax]) {
        const name = tax === STATE_INCOME ? `${USAState}_${tax}` : tax;
        tables.push(tableDataFromTaxData(name, stateTaxes[tax]));
      }
      if (stateTaxes?.[CITIES]?.[USACity]?.[tax]) {
        tables.push(
          tableDataFromTaxData(
            cityTaxKey(USACity, tax),
            stateTaxes[CITIES][USACity][tax],
          ),
        );
      }
    }

    return tables;
  }, [
    selectedTaxes,
    stateTaxes,
    federalTaxes,
    USACity,
    USAState,
    salesTax,
    year,
  ]);

  const taxDataTables = useMemo(() => {
    const tables: TaxTableModel[] = [] as TaxTableModel[];

    for (const selectedData of selectedTaxData) {
      if (selectedData.title === taxDataMap.standardFederalDeductions()) {
        tables.push(
          standardDeductionMapToTable(
            selectedData.title,
            federalStandardDeductionMap,
          ),
        );
      } else if (
        selectedData.title === taxDataMap.standardStateDeductions(USAState)
      ) {
        tables.push(
          standardDeductionMapToTable(
            selectedData.title,
            stateStandardDeductionMap,
          ),
        );
      } else if (selectedData.title === taxDataMap.max401kContributions()) {
        tables.push({
          name: selectedData.title,
          headers: ["Federal Amount"],
          rows: [[formatMoneyNoCents(asCurrency(max401KContribution))]],
        });
      }
    }

    return tables;
  }, [
    selectedTaxData,
    federalStandardDeductionMap,
    stateStandardDeductionMap,
    max401KContribution,
    USAState,
  ]);

  const tables = useMemo(() => {
    const selected = taxTables.concat(taxDataTables);
    if (selected.length > 0) {
      return selected;
    }
    // With nothing selected this page rendered four empty inputs and a
    // footer. Federal income brackets exist for every year, so show those
    // rather than nothing -- it is what most visitors came for, and an empty
    // page is a poor landing for a route whose purpose is reference content.
    const federalIncome = federalTaxes?.[FEDERAL_INCOME];
    if (federalIncome) {
      return [tableDataFromTaxData(FEDERAL_INCOME, federalIncome)];
    }
    return selected;
  }, [taxTables, taxDataTables, federalTaxes]);

  return (
    <>
      <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
        View detailed tax brackets, rates, and deductions for federal, state,
        and city taxes.
      </Typography>
      <Grid container spacing={2} columns={13}>
        <Grid item xs={13} sm={3}>
          <YearSelect
            availableYears={availableYears}
            USACity={USACity}
            USAState={USAState}
            year={year}
            setYear={setYear}
            baseRoute={TAX_TABLES.route}
            statesAndCitiesForYear={statesAndCitiesForYear}
            setUSACity={setUSACity}
          />
        </Grid>
        <Grid item xs={13} sm={5}>
          <StateSelect
            availableStatesAndCities={availableStatesAndCities}
            year={year}
            USAState={USAState}
            setUSAState={setUSAState}
            setUSACity={setUSACity}
            baseRoute={TAX_TABLES.route}
          />
        </Grid>
        <Grid item xs={13} sm={5}>
          <CitySelect
            availableStatesAndCities={availableStatesAndCities}
            year={year}
            USACity={USACity}
            USAState={USAState}
            setUSACity={setUSACity}
            baseRoute={TAX_TABLES.route}
          />
        </Grid>
        <Grid item xs={13} sm={6.5}>
          <TaxOptionsSelect
            data-testid="tax-options-select"
            id="tax-options-select"
            label="Tax rates & brackets"
            taxOptions={taxOptions}
            selectedTaxOptions={selectedTaxes}
            setSelectedTaxOptions={setSelectedTaxes}
          />
        </Grid>
        <Grid item xs={13} sm={6.5}>
          <TaxDataSelect
            data-testid="tax-data-select"
            id="tax-data-select"
            label="Deductions & limits"
            taxData={taxDataOptions}
            selectedTaxData={selectedTaxData}
            setSelectedTaxData={setSelectedTaxData}
          />
        </Grid>
        <Grid container spacing={2} columns={12} sx={{ mt: 3 }}>
          {tables.map((table, index) => (
            <Grid item xs={12} key={index}>
              {RenderTable(table)}
            </Grid>
          ))}
        </Grid>
      </Grid>
    </>
  );
}

function RenderTable(table: TaxTableModel) {
  const { name, headers, rows, note } = table;

  return (
    <>
      <Typography component="h2" variant="h5">
        {snakeToTitleCase(name)}
      </Typography>
      <TableContainer component={Paper} sx={{ border: 1, mt: 1, mb: 1 }}>
        <Table id={name}>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => {
              return (
                <TableRow key={index} id={`${name}_row_${index}`}>
                  {row.map((cell, index) => (
                    // pre-line: a sales tax rate that changed mid-year is
                    // one line per period.
                    <TableCell
                      key={`${cell}-${index}`}
                      sx={{ whiteSpace: "pre-line" }}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {note ? (
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
          {note}
        </Typography>
      ) : null}
    </>
  );
}
