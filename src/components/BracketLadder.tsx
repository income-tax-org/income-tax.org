"use client";

import { Box, MenuItem, TextField, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import type { LadderSchedule } from "@/utils/bracket-schedules";
import { buildBracketLadder } from "@/utils/marginal-rate";
import { asCurrency, formatMoney, formatMoneyNoCents } from "@/utils/money";
import { getSegmentColor } from "@/constants/chart-colors";

type BracketLadderProps = {
  /** Every banded schedule in this calculation, federal through city. */
  schedules: LadderSchedule[];
};

/**
 * Shows how taxable income is split across a jurisdiction's bands.
 *
 * The point is the one most people get wrong: landing in the 22% bracket does
 * not mean paying 22% on everything, only on the part above that threshold.
 * Saying so is much less convincing than showing the slices.
 */
export function BracketLadder({ schedules }: BracketLadderProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Falls back to the first schedule, so changing state or city cannot leave
  // the picker pointing at something that is no longer levied.
  const active =
    schedules.find((schedule) => schedule.key === selectedKey) ?? schedules[0];

  const accent = getSegmentColor(0);

  const steps = useMemo(
    () =>
      active ? buildBracketLadder(active.brackets, active.taxableIncome) : [],
    [active],
  );

  // A dropdown rather than toggles: Portland alone levies eight banded
  // schedules once federal, state and city are counted.
  const picker = schedules.length > 1 && (
    <TextField
      select
      id="bracket-schedule-select"
      data-testid="bracket-schedule-select"
      label="Show brackets for"
      value={active?.key ?? ""}
      onChange={(event) => setSelectedKey(event.target.value)}
      variant="standard"
      sx={{ mb: 3, minWidth: 260 }}
    >
      {schedules.map((schedule) => (
        <MenuItem key={schedule.key} value={schedule.key}>
          {schedule.label}
        </MenuItem>
      ))}
    </TextField>
  );

  if (!active || !steps.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Nothing here is charged in bands. The taxes that do apply are in the
        breakdown above.
      </Typography>
    );
  }

  const widest = Math.max(...steps.map((step) => step.amountInBracket), 1);

  return (
    <Box>
      {picker}

      <Box
        component="dl"
        sx={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          columnGap: 2,
          rowGap: 1,
          alignItems: "center",
          m: 0,
        }}
      >
        {steps.map((step) => {
          const used = step.amountInBracket > 0;
          return (
            <Box
              key={step.min}
              sx={{ display: "contents", opacity: used ? 1 : 0.45 }}
            >
              <Box
                component="dt"
                aria-current={step.isCurrent ? "true" : undefined}
                sx={{ whiteSpace: "nowrap" }}
              >
                <Typography
                  variant="body2"
                  component="span"
                  fontWeight={step.isCurrent ? "bold" : 500}
                >
                  {step.rate}%
                </Typography>
                <Typography
                  variant="caption"
                  component="span"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  {formatMoneyNoCents(asCurrency(step.min))}
                  {step.max === null
                    ? "+"
                    : ` – ${formatMoneyNoCents(asCurrency(step.max))}`}
                </Typography>
              </Box>

              <Box
                aria-hidden
                sx={{
                  height: 10,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${(step.amountInBracket / widest) * 100}%`,
                    height: "100%",
                    bgcolor: accent,
                    opacity: step.isCurrent ? 1 : 0.45,
                  }}
                />
              </Box>

              <Typography
                component="dd"
                variant="body2"
                sx={{ m: 0, fontVariantNumeric: "tabular-nums" }}
              >
                {used ? formatMoney(asCurrency(step.taxFromBracket)) : "—"}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
