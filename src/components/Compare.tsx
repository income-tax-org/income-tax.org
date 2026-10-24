"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ALL_STATES } from "@/constants/states";
import { FILING_STATUSES } from "@/constants/filing-status";
import type { FilingStatus } from "@/constants/filing-status";
import { COMPARE } from "@/constants/pages";
import { MAX_401K_CONTRIBUTION } from "@/constants/tax_types";
import type {
  AvailableStatesAndCities,
  SalesTaxData,
  TaxData,
  TaxableSpendingTable,
} from "@/types";
import { getSegmentColor } from "@/constants/chart-colors";
import {
  buildComparison,
  citiesForState,
  locationId,
  standardStateDeduction,
} from "@/utils/compare-locations";
import type {
  ComparedLocation,
  ComparisonRow,
} from "@/utils/compare-locations";
import { asCurrency, formatMoney, formatMoneyNoCents } from "@/utils/money";
import {
  defaultTaxableSpending,
  salesTaxCitiesFor,
  usesAverageLocalRate,
} from "@/utils/sales-tax";
import { formatPercent } from "@/utils/format-percent";
import { getQueryParams, updateURL } from "@/utils/base-path";
import {
  dashToSnakeCase,
  snakeToDashCase,
  snakeToTitleCase,
} from "@/utils/string-utils";
import { YearSelect } from "./input/YearSelect";
import { IncomeField } from "./input/IncomeField";
import { Contribution401kField } from "./input/Contribution401kField";
import { TaxBreakdownBar } from "./TaxBreakdownBar";

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

/**
 * Holds the helper-text row's height when a field has nothing to say. MUI
 * omits the element entirely for empty text, which makes the field jump.
 */
const HELPER_TEXT_SPACER = (
  <Box
    component="span"
    aria-hidden
    sx={{ display: "block", minHeight: "1.66em" }}
  />
);

/** Serialised into `?locations=` as `oregon-portland,texas`. */
function parseLocations(value: string | null): ComparedLocation[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [state, city = ""] = entry.split("/");
      return { state: dashToSnakeCase(state), city: dashToSnakeCase(city) };
    })
    .filter((location) => ALL_STATES.includes(location.state));
}

function serialiseLocations(locations: ComparedLocation[]): string {
  return locations
    .map(({ state, city }) =>
      city
        ? `${snakeToDashCase(state)}/${snakeToDashCase(city)}`
        : snakeToDashCase(state),
    )
    .join(",");
}

/** Null where the year has no sales tax data for the state. */
async function loadSalesTax(
  year: string,
  state: string,
): Promise<SalesTaxData | null> {
  try {
    const mod = (await import(
      `@/data/${year}/sales-tax/state/${state}.ts`
    )) as {
      default: SalesTaxData;
    };
    return mod.default;
  } catch {
    return null;
  }
}

/** Null for a year with no sales tax data at all. */
async function loadSpendingTable(
  year: string,
): Promise<TaxableSpendingTable | null> {
  try {
    const mod = (await import(
      `@/data/${year}/sales-tax/taxable-spending.ts`
    )) as {
      default: TaxableSpendingTable;
    };
    return mod.default;
  } catch {
    return null;
  }
}

function labelFor({ state, city }: ComparedLocation): string {
  return city
    ? `${snakeToTitleCase(city)}, ${snakeToTitleCase(state)}`
    : snakeToTitleCase(state);
}

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
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [totalIRA, setTotalIRA] = useState(0);
  // Undefined means "use the federal standard deduction". State deductions are
  // never held here: each location resolves its own, or Oregon's would end up
  // applied to Texas.
  const [federalDeductions, setFederalDeductions] = useState<
    number | undefined
  >(undefined);
  const [locations, setLocations] =
    useState<ComparedLocation[]>(defaultLocations);
  const [stateTaxesByState, setStateTaxesByState] = useState<
    Record<string, TaxData>
  >({});
  const [federalTaxes, setFederalTaxes] =
    useState<TaxData>(defaultFederalTaxes);
  const [includeSalesTax, setIncludeSalesTax] = useState(false);
  // Undefined means "estimate it from income", which follows the income field.
  const [spending, setSpending] = useState<number | undefined>(undefined);
  const [salesTaxByState, setSalesTaxByState] = useState<
    Record<string, SalesTaxData | null>
  >({});
  const [spendingTable, setSpendingTable] =
    useState<TaxableSpendingTable | null>(null);

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
    const urlIncome = parseInt(params.get("income") ?? "", 10);
    if (!isNaN(urlIncome) && urlIncome > 0) setIncome(urlIncome);
    const urlIra = parseInt(params.get("ira") ?? "", 10);
    if (!isNaN(urlIra) && urlIra > 0) setTotalIRA(urlIra);
    const urlDeductions = parseInt(params.get("deductions") ?? "", 10);
    if (!isNaN(urlDeductions) && urlDeductions >= 0) {
      setFederalDeductions(urlDeductions);
    }
    const status = params.get("status");
    if (status && (FILING_STATUSES as string[]).includes(status)) {
      setFilingStatus(status as FilingStatus);
    }
    if (params.get("sales-tax") === "1") setIncludeSalesTax(true);
    const urlSpending = parseInt(params.get("spending") ?? "", 10);
    if (!isNaN(urlSpending) && urlSpending >= 0) setSpending(urlSpending);
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
    if (filingStatus !== "single") params.status = filingStatus;
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

  // Each location needs its own state's schedules. The files are a few KB and
  // code-split per state, so this is a handful of small parallel fetches.
  useEffect(() => {
    let cancelled = false;
    const wanted = Array.from(new Set(locations.map((l) => l.state)));

    async function load() {
      const federal = (await import(`@/data/${year}/federal.ts`)) as {
        default: TaxData;
      };
      const loaded = await Promise.all(
        wanted.map(async (state) => {
          try {
            const mod = (await import(`@/data/${year}/state/${state}.ts`)) as {
              default: TaxData;
            };
            return [state, mod.default] as const;
          } catch {
            return null;
          }
        }),
      );
      // Small files, and only fetched once sales tax is switched on.
      const [table, salesTax] = includeSalesTax
        ? await Promise.all([
            loadSpendingTable(year),
            Promise.all(
              wanted.map(
                async (state) =>
                  [state, await loadSalesTax(year, state)] as const,
              ),
            ),
          ])
        : [null, []];
      if (cancelled) return;
      setFederalTaxes(federal.default);
      setStateTaxesByState(
        Object.fromEntries(loaded.filter(Boolean) as [string, TaxData][]),
      );
      setSpendingTable(table);
      setSalesTaxByState(Object.fromEntries(salesTax));
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [locations, year, includeSalesTax]);

  const estimatedSpending = useMemo(
    () =>
      spendingTable
        ? defaultTaxableSpending(spendingTable, income, filingStatus)
        : undefined,
    [spendingTable, income, filingStatus],
  );
  const effectiveSpending = spending ?? estimatedSpending;
  // On, and with data for this year. Years before sales tax data was
  // gathered have no table, and so no estimate to compare with.
  const comparingSalesTax =
    includeSalesTax && typeof effectiveSpending !== "undefined";

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
        salesTax:
          comparingSalesTax && typeof effectiveSpending !== "undefined"
            ? {
                spending: effectiveSpending,
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
      effectiveSpending,
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

        <TextField
          id="compare-filing-status"
          select
          label="Filing Status"
          value={filingStatus}
          onChange={(event) => {
            markEdited();
            setFilingStatus(event.target.value as FilingStatus);
          }}
          fullWidth
          variant="standard"
        >
          {FILING_STATUSES.map((option) => (
            <MenuItem key={option} value={option}>
              {snakeToTitleCase(option)}
            </MenuItem>
          ))}
        </TextField>
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
              placeholder={
                typeof estimatedSpending === "undefined"
                  ? ""
                  : estimatedSpending.toLocaleString("en-US")
              }
              inputProps={{ inputMode: "numeric", autoComplete: "off" }}
              helperText={
                includeSalesTax && typeof estimatedSpending === "undefined"
                  ? `No sales tax data for ${year} yet`
                  : typeof spending === "undefined"
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
        includeSalesTax={includeSalesTax}
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

function CompareRow({
  row,
  index,
  isLeader,
  label,
  comparingSalesTax,
  income,
  totalIRA,
  onRemove,
}: {
  row: ComparisonRow;
  index: number;
  isLeader: boolean;
  label: string;
  comparingSalesTax: boolean;
  income: number;
  totalIRA: number;
  onRemove: () => void;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <Box
      data-testid="compare-row"
      sx={{
        border: 1,
        borderColor: isLeader ? "divider" : "transparent",
        borderRadius: 1,
        bgcolor: isLeader ? "action.hover" : "transparent",
        px: 1.5,
        py: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          columnGap: 2,
          rowGap: 0.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 10,
              height: 10,
              borderRadius: "2px",
              flexShrink: 0,
              bgcolor: getSegmentColor(index),
            }}
          />
          <Typography
            variant="body1"
            fontWeight={isLeader ? "bold" : undefined}
            sx={{ overflowWrap: "anywhere" }}
          >
            {label}
          </Typography>
        </Box>

        <Typography
          variant="body1"
          fontWeight={isLeader ? "bold" : undefined}
          sx={{ fontVariantNumeric: "tabular-nums" }}
          data-testid="compare-take-home"
        >
          {formatMoney(comparingSalesTax ? row.leftOver : row.takeHome)}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontVariantNumeric: "tabular-nums", minWidth: 72 }}
        >
          {formatPercent(row.effectiveRate)} tax
        </Typography>

        <Typography
          variant="body2"
          sx={{
            fontVariantNumeric: "tabular-nums",
            minWidth: 72,
            fontWeight: isLeader ? 600 : undefined,
            color: isLeader ? theme.custom.green : theme.palette.text.secondary,
          }}
          data-testid="compare-delta"
        >
          {isLeader
            ? "best"
            : `\u2212${formatMoneyNoCents(asCurrency(row.behindLeaderBy))}`}
        </Typography>

        <Box sx={{ display: "flex", flexShrink: 0 }}>
          <Tooltip title={open ? "Hide breakdown" : "Show breakdown"}>
            <IconButton
              size="small"
              aria-label={`${open ? "Hide" : "Show"} breakdown for ${label}`}
              aria-expanded={open}
              onClick={() => setOpen((current) => !current)}
            >
              {open ? (
                <KeyboardArrowUp fontSize="small" />
              ) : (
                <KeyboardArrowDown fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title={`Remove ${label}`}>
            <IconButton
              size="small"
              aria-label={`Remove ${label}`}
              onClick={onRemove}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {comparingSalesTax && row.salesTax ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontVariantNumeric: "tabular-nums", pl: 2.25 }}
          data-testid="compare-sales-tax"
        >
          {formatMoney(row.takeHome)} take home {"\u2212"}{" "}
          {formatMoney(row.salesTax)} sales tax (
          {/* Two places: sales tax rates are quoted to the hundredth, and
              Seattle's 10.55% would otherwise read as 10.6%. */}
          {Number(row.salesTaxRate.toFixed(2))}%)
        </Typography>
      ) : null}

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2, mb: 1 }}>
          <TaxBreakdownBar
            federalResults={row.federalResults}
            stateResults={row.stateResults}
            totalIncome={income}
            takeHome={row.takeHome}
            totalIRA={totalIRA}
          />
        </Box>
      </Collapse>
    </Box>
  );
}

function LocationPicker({
  stateOptions,
  stateTaxesByState,
  year,
  includeSalesTax,
  onAdd,
}: {
  stateOptions: { state: string; title: string }[];
  stateTaxesByState: Record<string, TaxData>;
  year: string;
  /** Also offers cities that differ only in sales tax, like Seattle. */
  includeSalesTax: boolean;
  onAdd: (location: ComparedLocation) => void;
}) {
  const [pendingState, setPendingState] = useState<string>("");
  const [pendingCity, setPendingCity] = useState<string>("");
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Cities only become known once the state's data is in hand.
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
          includeSalesTax
            ? loadSalesTax(year, pendingState).then(salesTaxCitiesFor)
            : [],
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
  }, [pendingState, stateTaxesByState, year, includeSalesTax]);

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
                      : includeSalesTax
                        ? "No city taxes or city sales tax data here"
                        : "No city taxes here"
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
