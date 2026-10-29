import { getBasePath } from "./url";
import { dashToSnakeCase } from "./string-utils";

/**
 * The year / state / city a URL is pointing at.
 *
 * Every route in the app is some prefix followed by `/{year}/{state}/{city}`,
 * with state and city in dash-case on the wire and snake_case in application
 * state.
 */
export type LocationSelection = {
  year: string;
  state: string;
  city: string;
};

const EMPTY_SELECTION: LocationSelection = { year: "", state: "", city: "" };

/**
 * Read the current selection out of `window.location`.
 *
 * `baseRoute` is the page's own prefix ("" for the calculator, "/tax-tables",
 * "/city-taxes"), stripped before the segments are read.
 *
 * Callers previously reached for `window.__NEXT_DATA__?.basePath` here. That is
 * a Pages Router global and is not reliably defined under the App Router, so it
 * silently evaluated to "" every time; `getBasePath()` is the deliberate answer
 * to the same question.
 */
export function readLocationSelection(baseRoute = ""): LocationSelection {
  if (typeof window === "undefined") {
    return EMPTY_SELECTION;
  }

  let pathname = window.location.pathname;
  const basePath = getBasePath();
  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length);
  }
  if (baseRoute && pathname.startsWith(baseRoute)) {
    pathname = pathname.slice(baseRoute.length);
  }

  const [year = "", state = "", city = ""] = pathname
    .split("/")
    .filter(Boolean);
  return {
    year,
    state: state ? dashToSnakeCase(state) : "",
    city: city ? dashToSnakeCase(city) : "",
  };
}
