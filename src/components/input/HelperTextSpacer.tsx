import { Box } from "@mui/material";

/**
 * Holds the helper-text row's height when a field has nothing to say.
 *
 * MUI omits the helper element entirely for empty text, which made the field
 * jump as the note appeared and disappeared. A literal " " avoided that but
 * left `aria-describedby` pointing at a description consisting of one space.
 */
export const HELPER_TEXT_SPACER = (
  <Box
    component="span"
    aria-hidden
    // Matches MUI's FormHelperText line-height, so the field does not shift
    // by a few pixels as the note appears and disappears.
    sx={{ display: "block", minHeight: "1.66em" }}
  />
);
