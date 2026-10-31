import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

/**
 * The page's one h1, with an optional short introduction under it. The app
 * bar's site title is deliberately not a heading, so this is what names the
 * page for search engines and screen readers.
 */
export default function PageHeading({
  title,
  intro,
  sx,
}: {
  title: string;
  intro?: string;
  /** To line it up with the content below, e.g. a centred form. */
  sx?: SxProps<Theme>;
}) {
  return (
    <Box sx={[{ mb: 3 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontSize: { xs: "1.5rem", sm: "2rem" },
          fontWeight: 500,
          mb: intro ? 1 : 0,
        }}
      >
        {title}
      </Typography>
      {intro ? (
        <Typography variant="body1" color="text.secondary">
          {intro}
        </Typography>
      ) : null}
    </Box>
  );
}
