import { SITE_URL } from "@/constants/pages";
import { dashToSnakeCase } from "./string-utils";

export type ApiEndpoint = "calculate" | "tax-tables";

/**
 * The JSON request that mirrors a calculator or tax-tables page.
 *
 * Route params arrive dash-case and go out snake_case. What the page cannot
 * know is left as a `{placeholder}`: the income always (it lives in client
 * state), and the state on the landing page.
 */
export function apiUrlForPage(
  endpoint: ApiEndpoint,
  { year, state, city }: { year?: string; state?: string; city?: string },
): string {
  const params = new URLSearchParams();
  if (year) params.set("year", year);
  if (state) params.set("state", dashToSnakeCase(state));
  if (city) params.set("city", dashToSnakeCase(city));

  // URLSearchParams would escape the braces, so placeholders are appended.
  let query = params.toString();
  if (endpoint === "calculate") {
    if (!state) query += `${query ? "&" : ""}state={state}`;
    query += `${query ? "&" : ""}income={income}`;
  }
  return `${SITE_URL}/api/${endpoint}${query ? `?${query}` : ""}`;
}
