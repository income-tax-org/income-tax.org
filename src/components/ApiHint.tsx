import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { DEVELOPERS, SITE_URL } from "@/constants/pages";
import type { ApiEndpoint } from "@/utils/api-url-for-page";
import { apiUrlForPage } from "@/utils/api-url-for-page";

type ApiHintProps = {
  /** Which API route mirrors the page. */
  endpoint: ApiEndpoint;
  /** Route params, dash-case as they arrive from the URL. */
  year?: string;
  state?: string;
  city?: string;
};

/**
 * A line pointing machine readers at the JSON version of this page.
 *
 * The calculator works out its figures in the browser, so a model that fetches
 * one of these pages gets HTML with no numbers in it. This sentence is in the
 * static HTML and names the exact request that returns them, with the page's
 * own year, state and city already filled in.
 */
export default function ApiHint({ endpoint, ...location }: ApiHintProps) {
  return (
    <Typography
      variant="caption"
      component="p"
      color="text.secondary"
      sx={{ mt: 4, textAlign: "center", overflowWrap: "anywhere" }}
    >
      For AI assistants and scripts:{" "}
      {endpoint === "calculate"
        ? "these results are available as JSON from "
        : "these tables are available as JSON from "}
      <code>{apiUrlForPage(endpoint, location)}</code>, or through the MCP
      server at <code>{SITE_URL}/mcp</code>.{" "}
      <MuiLink component={Link} href={DEVELOPERS.route} prefetch={false}>
        API &amp; MCP docs
      </MuiLink>
    </Typography>
  );
}
