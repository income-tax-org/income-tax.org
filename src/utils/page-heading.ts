import { snakeToTitleCase } from "./string-utils";

/**
 * A page's h1, worded like its <title>: "2025 Columbus, Ohio Income Tax
 * Calculator", "2025 Ohio Income Tax Tables", "Income Tax Calculator". State
 * and city may be snake_case or dash-case.
 */
export function placeHeading(
  pageName: string,
  year?: string,
  state?: string,
  city?: string,
): string {
  const place = state
    ? [city, state]
        .filter(Boolean)
        .map((part) => snakeToTitleCase(part as string))
        .join(", ")
    : "";
  return [year, place, pageName].filter(Boolean).join(" ");
}

/** "Alabama vs Arizona Income Tax (2026)", the pair page's title. */
export function comparePairHeading(
  year: string,
  stateA: string,
  stateB: string,
): string {
  return `${snakeToTitleCase(stateA)} vs ${snakeToTitleCase(stateB)} Income Tax (${year})`;
}
