"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import { SINGLE } from "@/constants/filing-status";
import type { FilingStatus } from "@/constants/filing-status";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { IconButton, Tooltip } from "@mui/material";
import type { AvailableStatesAndCities, TaxData } from "@/types";
import Results from "@/components/Results";
import { RestartAlt } from "@mui/icons-material";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { StateSelect } from "./input/StateSelect";
import { CitySelect } from "./input/CitySelect";
import { YearSelect } from "./input/YearSelect";
import { FilingStatusSelect } from "./input/FilingStatusSelect";
import { HELPER_TEXT_SPACER } from "./input/HelperTextSpacer";
import { TaxOptionsSelect } from "./input/TaxOptionsSelect";
import type { TaxOption } from "@/utils/get-tax-options";
import { useTaxOptions } from "@/hooks/use-tax-options";
import { useTaxData } from "@/hooks/use-tax-data";
import { useStandardDeductions } from "@/hooks/use-standard-deductions";
import { PaycheckFrequencySelect } from "./input/PaycheckFrequencySelect";
import { IncomeField } from "./input/IncomeField";
import { Contribution401kField } from "./input/Contribution401kField";
import type { PaycheckFrequency } from "@/constants/paycheck-frequency";
import { MONTHLY } from "@/constants/paycheck-frequency";
import { updateURL, getQueryParams, parseIncomeParam } from "@/utils/url";
import { useUrlSelectionOnPopState } from "@/hooks/use-url-selection";

type CalculatorProps = {
  availableYears: string[];
  statesAndCitiesForYear: { [year: string]: AvailableStatesAndCities };
  defaultYear: string;
  defaultFederalTaxes: TaxData;
  defaultStateTaxes: TaxData;
  defaultUSAState?: string | undefined;
  defaultUSACity?: string;
};

export default function Calculator({
  availableYears,
  statesAndCitiesForYear,
  defaultFederalTaxes,
  defaultStateTaxes,
  defaultYear,
  defaultUSAState,
  defaultUSACity,
}: CalculatorProps) {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalIRA, setTotalIRA] = useState(0);

  const [USACity, setUSACity] = useState<string>(defaultUSACity || "");
  const [USAState, setUSAState] = useState(defaultUSAState || "");
  const [year, setYear] = useState(defaultYear);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>(SINGLE);
  const [paycheckFrequency, setPaycheckFrequency] =
    useState<PaycheckFrequency>(MONTHLY);
  const [exemptTaxes, setExemptTaxes] = useState<TaxOption[]>(
    [] as TaxOption[],
  );

  const [stateTaxes, setStateTaxes] = useState<TaxData>(defaultStateTaxes);
  const [federalTaxes, setFederalTaxes] =
    useState<TaxData>(defaultFederalTaxes);

  const [max401KContribution, setMax401KContribution] = useState(0);

  const availableStatesAndCities = useMemo(() => {
    return statesAndCitiesForYear[year];
  }, [statesAndCitiesForYear, year]);

  // Initialize income from URL query param on mount
  useEffect(() => {
    const income = parseIncomeParam(getQueryParams().get("income"));
    if (income !== null) {
      setTotalIncome(income);
    }
  }, []);

  // Update URL when income changes
  useEffect(() => {
    if (totalIncome > 0) {
      // Build the path based on current year, state, and city
      let path = `/${year}`;
      if (USAState) {
        path += `/${USAState.replace(/_/g, "-")}`;
        if (USACity) {
          path += `/${USACity.replace(/_/g, "-")}`;
        }
      }
      // Use replaceHistory=true to avoid adding income changes to browser history
      updateURL(path, { income: totalIncome }, false, true);
    }
  }, [totalIncome, year, USAState, USACity]);

  const {
    totalFederalDeductions,
    setTotalFederalDeductions,
    totalStateDeductions,
    setTotalStateDeductions,
    setFederalStandardDeductionMap,
    setStateStandardDeductionMap,
    federalStandardDeduction,
    stateStandardDeduction,
    resetTotalFederalDeductions,
    resetTotalStateDeductions,
    standardFederalDeductionDisplay,
    standardStateDeductionDisplay,
  } = useStandardDeductions({ year, filingStatus, totalIncome, totalIRA });

  useTaxData({
    year,
    USAState,
    setFederalTaxes,
    setStateTaxes,
    setUSAState,
    setUSACity,
  });

  useUrlSelectionOnPopState({
    year,
    defaultYear,
    setYear,
    USAState,
    setUSAState,
    USACity,
    setUSACity,
    onQueryParams: (params) => {
      const incomeParam = params.get("income");
      if (!incomeParam) {
        setTotalIncome(0);
        return;
      }
      const income = parseIncomeParam(incomeParam);
      if (income !== null) {
        setTotalIncome(income);
      }
    },
  });

  const taxOptions = useTaxOptions({
    federalTaxes,
    stateTaxes,
    USACity,
    USAState,
    setFederalStandardDeductionMap,
    setStateStandardDeductionMap,
    setMax401KContribution,
    excludeNonWageTaxes: true,
  });

  const handleNumberChange = useCallback(
    (setterFunction: (value: number) => void) => {
      return (
        event: React.ChangeEvent<HTMLInputElement>,
        newValue?: number | string,
      ) => {
        let value: number | string = event.target.value;
        if (typeof newValue !== "undefined" && newValue !== null) {
          value = newValue;
        }
        if (!value || (typeof value === "string" && !/[0-9]/.test(value))) {
          setterFunction(0);
          return;
        }
        // The income field renders with thousands separators, so strip
        // anything that is not a digit before parsing -- parseInt("75,000")
        // would otherwise yield 75.
        const numberValue =
          typeof value === "number"
            ? value
            : parseInt(value.replace(/[^0-9]/g, ""), 10);
        if (!isNaN(numberValue)) {
          // Nothing here is meaningful below zero, and a negative income
          // otherwise flows through to a negative take-home figure.
          setterFunction(Math.max(0, numberValue));
        }
      };
    },
    [],
  );

  const validateAll = useCallback(() => {
    if (totalIRA > max401KContribution) {
      setTotalIRA(max401KContribution);
    }
  }, [totalIRA, max401KContribution]);
  useEffect(() => {
    validateAll();
  }, [validateAll]);

  let resultsRender = null;
  if (totalIncome) {
    resultsRender = (
      <Results
        federalTaxes={federalTaxes}
        stateTaxes={stateTaxes}
        totalIncome={totalIncome}
        filingStatus={filingStatus}
        totalIRA={totalIRA}
        totalFederalDeductions={totalFederalDeductions as number}
        totalStateDeductions={totalStateDeductions as number}
        exemptTaxes={exemptTaxes}
        USACity={USACity}
        USAState={USAState}
        paycheckFrequency={paycheckFrequency}
      />
    );
  }

  return (
    <>
      {/*
        Capped independently of the page container: the container widened so
        the breakdown can use a large screen, but a 600px-wide text field is
        harder to use, not easier.
      */}
      <Grid container spacing={2} sx={{ mb: 2, maxWidth: 900, mx: "auto" }}>
        <Grid xs={12} sm={6} md={6}>
          <IncomeField
            id="total-income"
            value={totalIncome}
            onChange={setTotalIncome}
          />
        </Grid>
        <Grid xs={12} sm={3} md={3} display="flex" justifyContent="center">
          <YearSelect
            availableYears={availableYears}
            USACity={USACity}
            USAState={USAState}
            year={year}
            setYear={setYear}
          />
        </Grid>
        <Grid xs={12} sm={3} md={3}>
          <FilingStatusSelect
            id="filing-status-select"
            filingStatus={filingStatus}
            setFilingStatus={setFilingStatus}
          />
        </Grid>
        <Grid xs={12} sm={6} md={6}>
          <StateSelect
            availableStatesAndCities={availableStatesAndCities}
            year={year}
            USAState={USAState}
            setUSAState={setUSAState}
            setUSACity={setUSACity}
          />
        </Grid>
        <Grid xs={12} sm={6} md={6}>
          <CitySelect
            availableStatesAndCities={availableStatesAndCities}
            year={year}
            USACity={USACity}
            USAState={USAState}
            setUSACity={setUSACity}
          />
        </Grid>
        <Grid xs={12} sm={6} md={6}>
          <PaycheckFrequencySelect
            paycheckFrequency={paycheckFrequency}
            setPaycheckFrequency={setPaycheckFrequency}
          />
        </Grid>
        <Grid xs={12} sm={6} md={6}>
          <TaxOptionsSelect
            id="tax-exemptions-select"
            label="Tax Exemptions"
            taxOptions={taxOptions}
            selectedTaxOptions={exemptTaxes}
            setSelectedTaxOptions={setExemptTaxes}
          />
        </Grid>
        <Grid xs={12} sx={{ mt: 2 }}>
          <Accordion variant="outlined" disableGutters>
            <AccordionSummary
              expandIcon={<ArrowDownwardIcon />}
              id="deductions-header"
              aria-controls="deductions-content"
            >
              <Typography>Deductions</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid xs={12} sm={12} md={4}>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <Contribution401kField
                      id="ira-401k-contributions"
                      value={totalIRA}
                      onChange={setTotalIRA}
                      max={max401KContribution}
                      year={year}
                      helperSpacer={HELPER_TEXT_SPACER}
                    />
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6} md={4}>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <TextField
                      id="total-federal-deductions"
                      label="Total Federal Deductions"
                      type="text"
                      helperText={
                        standardFederalDeductionDisplay ?? HELPER_TEXT_SPACER
                      }
                      FormHelperTextProps={{
                        id: "federal-deductions-helper-text",
                      }}
                      inputProps={{
                        inputMode: "numeric",
                        autoComplete: "off",
                        "aria-describedby": standardFederalDeductionDisplay
                          ? "federal-deductions-helper-text"
                          : undefined,
                      }}
                      value={
                        totalFederalDeductions
                          ? totalFederalDeductions.toLocaleString("en-US")
                          : ""
                      }
                      onChange={handleNumberChange(setTotalFederalDeductions)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                        endAdornment:
                          standardFederalDeductionDisplay === null &&
                          federalStandardDeduction !== 0 &&
                          totalFederalDeductions ? (
                            <InputAdornment position="end">
                              <Tooltip
                                title={`Set to standard deduction for ${year}`}
                              >
                                <IconButton
                                  aria-label="Reset to standard deduction for year"
                                  onClick={() => {
                                    resetTotalFederalDeductions();
                                  }}
                                  edge="end"
                                >
                                  <RestartAlt />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ) : (
                            ""
                          ),
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6} md={4}>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <TextField
                      id="total-state-deductions"
                      label="Total State Deductions"
                      type="text"
                      helperText={
                        standardStateDeductionDisplay ?? HELPER_TEXT_SPACER
                      }
                      FormHelperTextProps={{
                        id: "state-deductions-helper-text",
                      }}
                      inputProps={{
                        inputMode: "numeric",
                        autoComplete: "off",
                        "aria-describedby": standardStateDeductionDisplay
                          ? "state-deductions-helper-text"
                          : undefined,
                      }}
                      value={
                        totalStateDeductions
                          ? totalStateDeductions.toLocaleString("en-US")
                          : ""
                      }
                      onChange={handleNumberChange(setTotalStateDeductions)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                        endAdornment:
                          standardStateDeductionDisplay === null &&
                          stateStandardDeduction !== 0 ? (
                            <InputAdornment position="end">
                              <Tooltip
                                title={`Set to standard deduction for ${year}`}
                              >
                                <IconButton
                                  aria-label="Reset to standard deduction for year"
                                  onClick={() => {
                                    resetTotalStateDeductions();
                                  }}
                                  edge="end"
                                >
                                  <RestartAlt />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ) : (
                            ""
                          ),
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
      {resultsRender}
    </>
  );
}
