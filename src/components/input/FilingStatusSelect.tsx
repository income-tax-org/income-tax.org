import type { FilingStatus } from "@/constants/filing-status";
import { FILING_STATUSES } from "@/constants/filing-status";
import { snakeToTitleCase } from "@/utils/string-utils";
import { MenuItem, TextField } from "@mui/material";

type FilingStatusSelectProps = {
  id: string;
  filingStatus: FilingStatus;
  setFilingStatus: (val: FilingStatus) => void;
};

export function FilingStatusSelect({
  id,
  filingStatus,
  setFilingStatus,
}: FilingStatusSelectProps) {
  return (
    <TextField
      id={id}
      select
      label="Filing Status"
      value={filingStatus}
      onChange={(e) => {
        setFilingStatus(e.target.value as FilingStatus);
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
  );
}
