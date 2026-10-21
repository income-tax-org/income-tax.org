/**
 * Work backwards from a take-home goal to the gross income that reaches it.
 *
 * Take-home is not strictly increasing in gross income. A flat fee that
 * switches on at a threshold, Ohio's base-amount jump, or a standard deduction
 * that phases out in steps can each make $1 more of salary leave less in hand.
 * So the predicate "take-home reaches the target" can flip more than once, and
 * bisection on its own only promises to land on *a* crossing, not the lowest.
 * After converging we probe a window below the answer for an earlier crossing,
 * which catches the dips the data actually contains: they are a few hundred
 * dollars wide at most.
 *
 * Everything is in integer cents so the comparison is exact.
 */

/** Gross income in cents to take-home in cents. */
export type TakeHomeAt = (incomeCents: number) => number;

export type IncomeSolution = {
  /** Lowest gross income found, in cents, whose take-home reaches the target. */
  incomeCents: number;
  /** How many times the calculator was run, for keeping an eye on CPU time. */
  evaluations: number;
};

/** Past this, no realistic target is being asked for. */
export const MAX_SOLVABLE_INCOME_CENTS = 100_000_000 * 100;

/** How far below the bisection result to look for an earlier crossing. */
const CLIFF_WINDOW_CENTS = 1_000 * 100;
const CLIFF_STEP_CENTS = 50 * 100;

/**
 * Returns null when even MAX_SOLVABLE_INCOME_CENTS falls short, which in
 * practice means the target is not a sensible number.
 */
export function solveForIncome(
  takeHomeAt: TakeHomeAt,
  targetCents: number,
): IncomeSolution | null {
  let evaluations = 0;
  const reaches = (incomeCents: number) => {
    evaluations += 1;
    return takeHomeAt(incomeCents) >= targetCents;
  };

  if (reaches(0)) {
    return { incomeCents: 0, evaluations };
  }

  // Taxes only take money away, so the answer is at least the target itself.
  // Grow an upper bound from there; the last failing probe is the lower one.
  let low = 0;
  let high = Math.max(targetCents, 100);
  while (!reaches(high)) {
    if (high >= MAX_SOLVABLE_INCOME_CENTS) {
      return null;
    }
    low = high;
    high = Math.min(high * 2, MAX_SOLVABLE_INCOME_CENTS);
  }

  high = bisect(reaches, low, high);

  // Look for an earlier crossing hidden behind a dip. Keep the lowest probe
  // that reaches the target, then bisect down to the cent from the probe
  // below it.
  let earliest = high;
  for (
    let probe = high - CLIFF_STEP_CENTS;
    probe > Math.max(low, high - CLIFF_WINDOW_CENTS);
    probe -= CLIFF_STEP_CENTS
  ) {
    if (reaches(probe)) {
      earliest = probe;
    }
  }
  if (earliest < high) {
    high = bisect(
      reaches,
      Math.max(low, earliest - CLIFF_STEP_CENTS),
      earliest,
    );
  }

  return { incomeCents: high, evaluations };
}

/**
 * Narrow `[low, high]` to the cent, where `high` reaches the target and `low`
 * is taken not to. Returns the reaching end.
 */
function bisect(
  reaches: (incomeCents: number) => boolean,
  low: number,
  high: number,
): number {
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    if (reaches(mid)) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return high;
}
