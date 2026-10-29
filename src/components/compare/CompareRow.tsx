"use client";

import {
  Box,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import { useState } from "react";
import { getSegmentColor } from "@/constants/chart-colors";
import type { ComparisonRow } from "@/utils/compare-locations";
import { asCurrency, formatMoney, formatMoneyNoCents } from "@/utils/money";
import { formatPercent } from "@/utils/format-percent";
import { TaxBreakdownBar } from "@/components/TaxBreakdownBar";

export function CompareRow({
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
      {/*
        A grid, not a wrapping flex row: where a flex row breaks depends on
        how long the place's name is, so two rows on a phone broke in two
        different places and the totals stopped lining up. On a phone the
        name and total share the first line and everything else the second;
        from sm up it is one line.
      */}
      <Box
        sx={{
          display: "grid",
          alignItems: "center",
          columnGap: 2,
          rowGap: 0.25,
          gridTemplateColumns: {
            xs: "minmax(0, 1fr) auto",
            sm: "minmax(0, 1fr) auto 72px 72px auto",
          },
          gridTemplateAreas: {
            xs: `"label total" "meta actions" "sales sales"`,
            sm: `"label total rate delta actions" "sales sales sales sales sales"`,
          },
        }}
      >
        <Box
          sx={{
            gridArea: "label",
            display: "flex",
            alignItems: "center",
            gap: 1,
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
          sx={{
            gridArea: "total",
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          }}
          data-testid="compare-take-home"
        >
          {formatMoney(comparingSalesTax ? row.leftOver : row.takeHome)}
        </Typography>

        {/* Its own line on a phone; from sm up its children are grid cells. */}
        <Box
          sx={{
            gridArea: { xs: "meta" },
            display: { xs: "flex", sm: "contents" },
            gap: 2,
            pl: { xs: 2.25, sm: 0 },
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              gridArea: { sm: "rate" },
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatPercent(row.effectiveRate)} tax
          </Typography>

          <Typography
            variant="body2"
            sx={{
              gridArea: { sm: "delta" },
              fontVariantNumeric: "tabular-nums",
              fontWeight: isLeader ? 600 : undefined,
              color: isLeader
                ? theme.custom.green
                : theme.palette.text.secondary,
            }}
            data-testid="compare-delta"
          >
            {isLeader
              ? "best"
              : `\u2212${formatMoneyNoCents(asCurrency(row.behindLeaderBy))}`}
          </Typography>
        </Box>

        <Box
          sx={{ gridArea: "actions", display: "flex", justifyContent: "end" }}
        >
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

        {comparingSalesTax && row.salesTax ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              gridArea: "sales",
              fontVariantNumeric: "tabular-nums",
              pl: 2.25,
            }}
            data-testid="compare-sales-tax"
          >
            {/* Each half kept whole, so a narrow screen breaks between them
                rather than stranding the rate on a line of its own. */}
            <Box component="span" sx={{ whiteSpace: "nowrap" }}>
              {formatMoney(row.takeHome)} take home
            </Box>{" "}
            <Box component="span" sx={{ whiteSpace: "nowrap" }}>
              {"\u2212"} {formatMoney(row.salesTax)} sales tax (
              {/* Two places: sales tax rates are quoted to the hundredth, and
                Seattle's 10.55% would otherwise read as 10.6%. */}
              {Number(row.salesTaxRate.toFixed(2))}%)
            </Box>
          </Typography>
        ) : null}
      </Box>

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
