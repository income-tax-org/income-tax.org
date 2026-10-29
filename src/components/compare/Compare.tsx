"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  FormControlLabel,
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ALL_STATES } from "@/constants/states";
import { FILING_STATUSES, SINGLE } from "@/constants/filing-status";
import type { FilingStatus } from "@/constants/filing-status";
import { COMPARE } from "@/constants/pages";
import { MAX_401K_CONTRIBUTION } from "@/constants/tax-types";
import type { AvailableStatesAndCities, TaxData } from "@/types";
import { useComparedTaxData } from "@/hooks/use-compared-tax-data";
import {
  buildComparison,
  labelFor,
  locationId,
  parseLocations,
  serialiseLocations,
  standardStateDeduction,
} from "@/utils/compare-locations";
import type { ComparedLocation } from "@/utils/compare-locations";
import { asCurrency, formatMoneyNoCents } from "@/utils/money";
import {
  defaultTaxableSpending,
  usesAverageLocalRate,
} from "@/utils/sales-tax";
import {
  getQueryParams,
  parseAmountParam,
  parseIncomeParam,
  updateURL,
} from "@/utils/url";
import { snakeToTitleCase } from "@/utils/string-utils";
import { YearSelect } from "@/components/input/YearSelect";
import { IncomeField } from "@/components/input/IncomeField";
import { Contribution401kField } from "@/components/input/Contribution401kField";
import { FilingStatusSelect } from "@/components/input/FilingStatusSelect";
import { HELPER_TEXT_SPACER } from "@/components/input/HelperTextSpacer";
import { CompareRow } from "./CompareRow";
import { LocationPicker } from "./LocationPicker";

type CompareProps = {
  availableYears: string[];
  defaultYear: string;
  statesAndCitiesForYear: { [year: string]: AvailableStatesAndCities };
  defaultFederalTaxes: TaxData;
  /** Preselected by the statically generated `/a/vs/b` pages. */
  defaultLocations?: ComparedLocation[];
  /**
   * The pretty path a statically generated pair page lives at. While the
   * selection still matches what that page was built for, the URL is left
   * alone -- otherwise landing on /compare/2026/texas/vs/california would
   * immediately rewrite itself to a query string.
   */
  canonicalPath?: string;
};

/** Shown when the compared states do not share one standard deduction. */
const VARIES_BY_STATE = "Varies by state";

export default function Compare({
  availableYears,
  defaultYear,
  statesAndCitiesForYear,
  defaultFederalTaxes,
  defaultLocations = [],
  canonicalPath,
}: CompareProps) {
  const [year, setYear] = useState(defaultYear);
  const [income, setIncome] = useState(150_000);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>(SINGLE);
  const [totalIRA, setTotalIRA] = useState(0);
  // Undefined means "use the federal standard deduction". State deductions are
  // never held here: each location resolves its own, or Oregon's would end up
  // applied to Texas.
  const [federalDeductions, setFederalDeductions] = useState<
    number | undefined
  >(undefined);
  const [locations, setLocations] =
    useState<ComparedLocation[]>(defaultLocations);
  const [includeSalesTax, setIncludeSalesTax] = useState(false);
  // Undefined means "estimate it from income", which follows the income field.
  const [spending, setSpending] = useState<number | undefined>(undefined);

  const availableStatesAndCities = statesAndCitiesForYear[year];

  // Set by anything the user changes. Until then the URL is whatever they
  // arrived on, which for a pair page is the path worth keeping.
  const hasEdited = useRef(false);
  // The URL is read once on mount and written on every change. Without a
  // guard the writer runs before the reader has applied what it found -- and
  // under StrictMode's double-invoked effects the reader then re-reads a URL
  // the writer has already flattened, losing whatever was shared. TaxTables
  // guards the same way.
  const initialisedFromUrl = useRef(false);
  const markEdited = useCallback(() => {
    hasEdited.current = true;
  }, []);

  // Read the URL once on mount; the statically generated pair pages supply
  // their locations as props instead.
  useEffect(() => {
    // Once only. StrictMode invokes mount effects twice in development, and
    // the second pass would re-read a URL the writer below has already
    // rewritten from state that had not landed yet -- silently replacing a
    // shared link's income with the default.
    if (initialisedFromUrl.current) return;
    const params = getQueryParams();
    const fromUrl = parseLocations(params.get("locations"));
    if (fromUrl.length) setLocations(fromUrl);
    const urlIncome = parseIncomeParam(params.get("income"));
    if (urlIncome !== null) setIncome(urlIncome);
    const urlIra = parseAmountParam(params.get("ira"), { allowZero: false });
    if (urlIra !== null) setTotalIRA(urlIra);
    const urlDeductions = parseAmountParam(params.get("deductions"));
    if (urlDeductions !== null) setFederalDeductions(urlDeductions);
    const status = params.get("status");
    if (status && (FILING_STATUSES as string[]).includes(status)) {
      setFilingStatus(status as FilingStatus);
    }
    if (params.get("sales-tax") === "1") setIncludeSalesTax(true);
    const urlSpending = parseAmountParam(params.get("spending"));
    if (urlSpending !== null) setSpending(urlSpending);
    initialisedFromUrl.current = true;
  }, []);

  // Keep the URL shareable. Replace rather than push: dragging the income
  // field should not fill the back button.
  useEffect(() => {
    if (!initialisedFromUrl.current) return;
    if (canonicalPath && !hasEdited.current) return;
    const path = `${COMPARE.route}/${year}`;
    const params: Record<string, string | number> = {};
    if (locations.length) params.locations = serialiseLocations(locations);
    if (income > 0) params.income = income;
    if (filingStatus !== SINGLE) params.status = filingStatus;
    if (totalIRA > 0) params.ira = totalIRA;
    if (typeof federalDeductions !== "undefined") {
      params.deductions = federalDeductions;
    }
    if (includeSalesTax) params["sales-tax"] = 1;
    if (includeSalesTax && typeof spending !== "undefined") {
      params.spending = spending;
    }
    updateURL(path, params, false, true);
  }, [
    locations,
    income,
    filingStatus,
    year,
    canonicalPath,
    totalIRA,
    federalDeductions,
    includeSalesTax,
    spending,
  ]);

  const { federalTaxes, stateTaxesByState, salesTaxByState } =
    useComparedTaxData({
      locations,
      year,
      includeSalesTax,
      defaultFederalTaxes,
    });

  const comparingSalesTax = includeSalesTax;

  const rows = useMemo(
    () =>
      buildComparison({
        locations,
        stateTaxesByState,
        federalTaxes,
        income,
        filingStatus,
        totalIRA,
        federalDeductions,
        salesTax: comparingSalesTax
          ? {
              spending,
              year: parseInt(year, 10),
              dataByState: salesTaxByState,
            }
          : undefined,
      }),
    [
      locations,
      stateTaxesByState,
      federalTaxes,
      income,
      filingStatus,
      totalIRA,
      federalDeductions,
      comparingSalesTax,
      spending,
      year,
      salesTaxByState,
    ],
  );

  // Rows charged no sales tax because the state has no data yet, as opposed
  // to Oregon, which has data saying there is none. Null is "looked, none
  // there"; undefined is still loading, and not worth a message.
  const missingSalesTax = comparingSalesTax
    ? rows
        .filter((row) => salesTaxByState[row.location.state] === null)
        .map((row) => labelFor(row.location))
    : [];

  /**
   * The estimate shown in the spending field. Each state estimates from its
   * own IRS table, since tax bases differ, so like the state deduction this is
   * one figure only when every compared state agrees.
   */
  const estimatedSpending = useMemo(() => {
    const values = Array.from(
      new Set(
        locations.flatMap((location) => {
          const salesTax = salesTaxByState[location.state];
          const value =
            salesTax && defaultTaxableSpending(salesTax, income, filingStatus);
          return typeof value === "number" ? [value] : [];
        }),
      ),
    );
    if (!values.length) return "";
    return values.length === 1
      ? values[0].toLocaleString("en-US")
      : VARIES_BY_STATE;
  }, [locations, salesTaxByState, income, filingStatus]);

  const max401KContribution = useMemo(
    () => (federalTaxes?.[MAX_401K_CONTRIBUTION] as number) ?? 0,
    [federalTaxes],
  );

  /**
   * One figure only when every compared state agrees on it. They usually do
   * not -- Oregon's is $2,835 and Texas has none -- and showing a single
   * number would imply it applied to all of them.
   *
   * Resolved at the entered income, since a state whose deduction phases out
   * gives a different answer as the income slider moves.
   */
  const stateDeductionDisplay = useMemo(() => {
    const deductionIncome = Math.max(0, income - totalIRA);
    const values = locations.map((location) => {
      const taxes = stateTaxesByState[location.state];
      return taxes
        ? standardStateDeduction(taxes, filingStatus, deductionIncome) ?? 0
        : null;
    });
    const known = values.filter((value): value is number => value !== null);
    if (!known.length) return "";
    const first = known[0];
    return known.every((value) => value === first)
      ? first.toLocaleString("en-US")
      : VARIES_BY_STATE;
  }, [locations, stateTaxesByState, filingStatus, income, totalIRA]);

  const addLocation = useCallback(
    (location: ComparedLocation) => {
      markEdited();
      setLocations((current) =>
        current.some((l) => locationId(l) === locationId(location))
          ? current
          : [...current, location],
      );
    },
    [markEdited],
  );

  const removeLocation = useCallback(
    (id: string) => {
      markEdited();
      setLocations((current) => current.filter((l) => locationId(l) !== id));
    },
    [markEdited],
  );

  const stateOptions = useMemo(
    () =>
      ALL_STATES.filter((state) => availableStatesAndCities?.[state]).map(
        (state) => ({ state, title: snakeToTitleCase(state) }),
      ),
    [availableStatesAndCities],
  );

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "2fr 1fr 1fr" },
          gap: 2,
          mb: 3,
          maxWidth: 900,
        }}
      >
        <IncomeField
          id="compare-income"
          value={income}
          onChange={(next: number) => {
            markEdited();
            setIncome(next);
          }}
        />

        <YearSelect
          availableYears={availableYears}
          year={year}
          USAState=""
          USACity=""
          setYear={(value: string) => {
            markEdited();
            setYear(value);
          }}
          baseRoute={COMPARE.route}
        />

        <FilingStatusSelect
          id="compare-filing-status"
          filingStatus={filingStatus}
          setFilingStatus={(value: FilingStatus) => {
            markEdited();
            setFilingStatus(value);
          }}
        />
      </Box>

      <Accordion variant="outlined" disableGutters sx={{ mt: 3, mb: 1 }}>
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          id="compare-deductions-header"
          aria-controls="compare-deductions-content"
        >
          <Typography>Deductions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
              gap: 2,
              maxWidth: 900,
              pt: 1,
            }}
          >
            <Contribution401kField
              id="compare-ira-401k-contributions"
              value={totalIRA}
              onChange={(next: number) => {
                markEdited();
                setTotalIRA(next);
              }}
              max={max401KContribution}
              year={year}
              helperSpacer={HELPER_TEXT_SPACER}
            />

            <TextField
              id="compare-federal-deductions"
              label="Total Federal Deductions"
              type="text"
              variant="outlined"
              placeholder="Standard deduction"
              inputProps={{ inputMode: "numeric", autoComplete: "off" }}
              helperText={
                typeof federalDeductions === "undefined"
                  ? "Using the standard deduction"
                  : " "
              }
              value={
                typeof federalDeductions === "undefined"
                  ? ""
                  : federalDeductions.toLocaleString("en-US")
              }
              onChange={(event) => {
                markEdited();
                const digits = event.target.value.replace(/[^0-9]/g, "");
                setFederalDeductions(digits ? parseInt(digits, 10) : undefined);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
            <TextField
              id="compare-state-deductions"
              label="Total State Deductions"
              type="text"
              variant="outlined"
              disabled
              value={stateDeductionDisplay}
              helperText="Using each state's own deduction"
              inputProps={{
                "aria-describedby": "compare-state-deductions-helper-text",
              }}
              FormHelperTextProps={{
                id: "compare-state-deductions-helper-text",
              }}
              InputProps={{
                startAdornment:
                  stateDeductionDisplay === VARIES_BY_STATE ? null : (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
              }}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion variant="outlined" disableGutters sx={{ mb: 1 }}>
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          id="compare-sales-tax-header"
          aria-controls="compare-sales-tax-content"
        >
          <Typography>Sales tax</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 2fr" },
              gap: 2,
              alignItems: "start",
              maxWidth: 900,
              pt: 1,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  id="compare-include-sales-tax"
                  checked={includeSalesTax}
                  onChange={(event) => {
                    markEdited();
                    setIncludeSalesTax(event.target.checked);
                  }}
                />
              }
              label="Include sales tax"
            />
            <TextField
              id="compare-taxable-spending"
              label="Yearly taxable spending"
              type="text"
              variant="outlined"
              disabled={!includeSalesTax}
              placeholder={estimatedSpending}
              inputProps={{ inputMode: "numeric", autoComplete: "off" }}
              helperText={
                typeof spending === "undefined"
                  ? "Estimated based on your income"
                  : "Purchases that are taxed; groceries and rent usually are not"
              }
              value={
                typeof spending === "undefined"
                  ? ""
                  : spending.toLocaleString("en-US")
              }
              onChange={(event) => {
                markEdited();
                const digits = event.target.value.replace(/[^0-9]/g, "");
                setSpending(digits ? parseInt(digits, 10) : undefined);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <LocationPicker
        stateOptions={stateOptions}
        stateTaxesByState={stateTaxesByState}
        year={year}
        onAdd={addLocation}
      />

      {locations.length ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
          {locations.map((location) => (
            <Chip
              key={locationId(location)}
              label={labelFor(location)}
              onDelete={() => removeLocation(locationId(location))}
            />
          ))}
        </Box>
      ) : null}

      <Divider sx={{ my: 4 }} />

      {rows.length < 1 ? (
        <Typography variant="body1" color="text.secondary">
          Add two or more places to compare them.
        </Typography>
      ) : (
        <Box>
          <Typography
            variant="h6"
            component="h2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {comparingSalesTax
              ? `Take home less sales tax on ${formatMoneyNoCents(asCurrency(income))}`
              : `Take home on ${formatMoneyNoCents(asCurrency(income))}`}
          </Typography>

          {missingSalesTax.length ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
              data-testid="compare-sales-tax-missing"
            >
              No sales tax data yet for {missingSalesTax.join(", ")}, so no
              sales tax is counted there.
            </Typography>
          ) : null}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {rows.map((row, index) => (
              <CompareRow
                key={row.id}
                row={row}
                index={index}
                isLeader={index === 0}
                label={
                  // "Washington" alone reads as a place with its own rate.
                  // It is charged the statewide average, which a city like
                  // Vancouver can sit below.
                  row.salesTax &&
                  usesAverageLocalRate(
                    salesTaxByState[row.location.state]!,
                    row.location.city,
                  )
                    ? `${labelFor(row.location)} (state average)`
                    : labelFor(row.location)
                }
                comparingSalesTax={comparingSalesTax}
                income={income}
                totalIRA={totalIRA}
                onRemove={() => removeLocation(row.id)}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
