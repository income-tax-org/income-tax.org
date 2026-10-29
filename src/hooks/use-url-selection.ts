import { useEffect, useRef } from "react";
import { getQueryParams } from "@/utils/url";
import { readLocationSelection } from "@/utils/url-selection";

type UrlSelectionOptions = {
  year: string;
  defaultYear: string;
  setYear: (value: string) => void;
  /** Omit both to opt out of state tracking (the city-taxes page has no state). */
  USAState?: string;
  setUSAState?: (value: string) => void;
  USACity?: string;
  setUSACity?: (value: string) => void;
  baseRoute?: string;
  /** Run after the path-derived selection is applied, for per-page params. */
  onQueryParams?: (params: URLSearchParams) => void;
};

/**
 * Keep year / state / city in step with browser back and forward.
 *
 * The listener is registered once and reads the current props through a ref,
 * rather than resubscribing whenever a selection changes. Beyond the churn,
 * the previous version listed `taxOptions` in its dependencies, so every
 * recomputation of that array tore down and re-added a window listener.
 */
export function useUrlSelectionOnPopState(options: UrlSelectionOptions): void {
  const latest = useRef(options);
  latest.current = options;

  useEffect(() => {
    const handlePopState = () => {
      const {
        year,
        defaultYear,
        setYear,
        USAState,
        setUSAState,
        USACity,
        setUSACity,
        baseRoute = "",
        onQueryParams,
      } = latest.current;

      const selection = readLocationSelection(baseRoute);

      if (selection.year) {
        if (selection.year !== year) {
          setYear(selection.year);
        }
      } else if (year !== defaultYear) {
        // Back to the route root, which serves the newest data year.
        setYear(defaultYear);
      }

      if (setUSAState && selection.state !== (USAState ?? "")) {
        setUSAState(selection.state);
      }
      if (setUSACity && selection.city !== (USACity ?? "")) {
        setUSACity(selection.city);
      }

      onQueryParams?.(getQueryParams());
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
}
