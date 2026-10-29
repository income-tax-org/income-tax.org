/**
 * Heuristics for wrong *values* in tax data -- the class `validate-tax-data`
 * cannot see, because it checks that a schedule is well formed and never that
 * its numbers are the right ones.
 *
 * Every check here was chosen by testing candidate rules against a commit where
 * six states were known to be wrong, and keeping the ones that actually fired.
 * A cross-year equality check ("this year equals the next") was tried first and
 * rejected: it flagged 61 series to catch one real bug, and structurally could
 * not see two of the three it was aimed at. It misses a year shift whenever the
 * neighbouring year is *also* wrong -- weakest exactly when the data is worst --
 * and it cannot see a value copied from a different field at all.
 *
 * These are WARNINGS. A legislature really can cut a standard deduction, and the
 * first time one does, a check that fails the build would block CI over correct
 * data. Read the hits, confirm each against the state's own publication, and
 * silence a confirmed-correct one with a comment in the data file.
 */
import { readTaxDataFromDisk } from "@/data-loaders/read-from-disk";
import { STANDARD_DEDUCTION, STATE_INCOME } from "@/constants/tax-types";
import { CITIES } from "@/constants";
import { FILING_STATUSES } from "@/constants/filing-status";

type Warning = { kind: string; where: string; detail: string };
const warnings: Warning[] = [];
const add = (kind: string, where: string, detail: string) =>
  warnings.push({ kind, where, detail });

/** Ratio of each status to single, which is stable within a state over time. */
function ratios(sd: any): Record<string, number> | null {
  const single = sd?.single;
  if (typeof single !== "number" || single <= 0) return null;
  const out: Record<string, number> = {};
  for (const status of FILING_STATUSES) {
    const v = sd?.[status];
    if (typeof v === "number") out[status] = v / single;
  }
  return out;
}

async function main() {
  const { taxDataByYear } = await readTaxDataFromDisk(
    process.cwd() + "/src/data",
  );
  const years = Object.keys(taxDataByYear).sort();
  const states = Object.keys(taxDataByYear[years[0]])
    .filter((s) => s !== "federal")
    .sort();
  const sdFor = (y: string, s: string) =>
    taxDataByYear[y]?.[s]?.[STANDARD_DEDUCTION] as any;

  // --- A. A standard deduction that falls year over year.
  // Highest yield per unit of noise, and independent of whether the
  // neighbouring year is itself correct -- which is what sank the cross-year
  // check. Catches a stale year, a shifted year and a fabricated one alike.
  //
  // It says WHICH SERIES is anomalous and nothing about WHICH SIDE of the step
  // is wrong. Mississippi proved the point: head_of_household and
  // married_separately both stepped 3400 -> 2300 at the same year boundary, and
  // the correct repairs went in opposite directions -- HoH was right before the
  // step and wrong after, MFS wrong before and right after. Only the published
  // table settles it. Never infer the fix from the direction of the fall.
  for (const state of states) {
    for (let i = 1; i < years.length; i++) {
      const prev = sdFor(years[i - 1], state);
      const cur = sdFor(years[i], state);
      if (!prev || !cur || typeof prev !== "object" || typeof cur !== "object")
        continue;
      for (const status of FILING_STATUSES) {
        const a = prev[status];
        const b = cur[status];
        if (typeof a !== "number" || typeof b !== "number" || b >= a) continue;
        const pct = ((b - a) / a) * 100;
        add(
          "deduction-decreased",
          `${state}/${status}`,
          `${years[i - 1]} ${a} -> ${years[i]} ${b} (${pct.toFixed(1)}%)`,
        );
      }
    }
  }

  // --- B. One year whose status-to-single ratios break that state's own norm.
  // Names the offending field, which in practice is usually head_of_household --
  // the slot most often filled with a duplicated single or married value.
  //
  // MAJORITY VOTE, so with 3 of 4 years wrong it blames the HEALTHY year. This
  // is not hypothetical: it flagged Kentucky's 2023 married deduction as the
  // outlier at 1.00x single against 2.00x elsewhere, and 2023 was the only
  // correct year -- Form 740 line 10 says "if filing a joint return, only one
  // $2,980 standard deduction is allowed", so Kentucky's joint return really
  // does get a single deduction and the other three years were the bug.
  //
  // It identifies the STATE reliably and never which side is right. Read the
  // state's own form before deciding which year to change.
  for (const state of states) {
    const byYear = new Map<string, Record<string, number>>();
    for (const y of years) {
      const r = ratios(sdFor(y, state));
      if (r) byYear.set(y, r);
    }
    if (byYear.size < 3) continue;
    for (const status of FILING_STATUSES) {
      const seen = [...byYear.entries()]
        .map(([y, r]) => [y, r[status]] as const)
        .filter(([, v]) => typeof v === "number");
      if (seen.length < 3) continue;
      for (const [year, value] of seen) {
        const others = seen.filter(([y]) => y !== year).map(([, v]) => v);
        const norm = others[0];
        if (!others.every((v) => Math.abs(v - norm) < 0.02)) continue; // others disagree
        if (Math.abs(value - norm) < 0.02) continue;
        add(
          "ratio-breaks-from-other-years",
          `${state}/${status}`,
          `${year} is ${value.toFixed(2)}x single; every other year is ${norm.toFixed(2)}x`,
        );
      }
    }
  }

  // --- C. A married-to-single ratio that is a one-off across the whole data set.
  // Catches the case A and B both miss: a year stale in some statuses but not
  // others, where nothing decreases and the state's own history legitimately
  // varies. Georgia 2024 sat at 3.38 while 103 of 120 state-years sit at 2.00.
  //
  // 2.00x is DESCRIPTIVE, not a rule. Kentucky's joint return gets one single
  // deduction, not two, so 1.00x is correct there; Alabama sits at 2.83x by its
  // own schedule. The band below is wide enough to let both through, and a
  // ratio that is stable across a state's own years is treated as that state's
  // rule whatever its value. Never "correct" a state toward 2.00x.
  const mvs: { where: string; year: string; state: string; ratio: number }[] =
    [];
  for (const state of states) {
    for (const y of years) {
      const sd = sdFor(y, state);
      if (!sd || typeof sd !== "object") continue;
      if (
        typeof sd.single !== "number" ||
        typeof sd.married !== "number" ||
        !sd.single
      )
        continue;
      mvs.push({
        where: `${state}/married:single`,
        year: y,
        state,
        ratio: sd.married / sd.single,
      });
    }
  }
  for (const row of mvs) {
    if (row.ratio >= 1.0 && row.ratio <= 2.2) continue;
    // Stable across that state's own years => a real local rule, not an error.
    const sameState = mvs.filter((r) => r.state === row.state);
    const stable = sameState.every((r) => Math.abs(r.ratio - row.ratio) < 0.02);
    if (stable) continue;
    add(
      "married-single-ratio-outlier",
      row.where,
      `${row.year} is ${row.ratio.toFixed(2)}x, out of line with both the data set (usually 2.00x) and this state's other years`,
    );
  }

  // --- D. Two filing statuses sharing one bracket schedule, in a state that
  // distinguishes them in other years.
  //
  // Vermont 2025 had married-filing-separately copied from single and head of
  // household copied from joint -- the same duplicated-slot mistake seen four
  // times in standard deductions, but in brackets, where checks A-C cannot see
  // it. Plenty of states genuinely give two statuses the same schedule, so the
  // signal is only the *inconsistency*: identical here, distinct in that same
  // state's other years.
  for (const state of states) {
    const perYear = new Map<string, Record<string, string>>();
    for (const y of years) {
      const schedule = taxDataByYear[y]?.[state]?.[STATE_INCOME] as any;
      if (!schedule || typeof schedule !== "object") continue;
      const byStatus: Record<string, string> = {};
      for (const status of FILING_STATUSES) {
        if (Array.isArray(schedule[status]))
          byStatus[status] = JSON.stringify(schedule[status]);
      }
      if (Object.keys(byStatus).length === FILING_STATUSES.length)
        perYear.set(y, byStatus);
    }
    if (perYear.size < 2) continue;

    for (let i = 0; i < FILING_STATUSES.length; i++) {
      for (let j = i + 1; j < FILING_STATUSES.length; j++) {
        const a = FILING_STATUSES[i];
        const b = FILING_STATUSES[j];
        const sameIn: string[] = [];
        const differIn: string[] = [];
        for (const [y, byStatus] of perYear) {
          (byStatus[a] === byStatus[b] ? sameIn : differIn).push(y);
        }
        // Always identical => a real rule for this state. Always distinct => fine.
        if (!sameIn.length || !differIn.length) continue;
        for (const y of sameIn) {
          add(
            "statuses-share-a-schedule",
            `${state}/${STATE_INCOME}`,
            `${y} gives ${a} and ${b} identical brackets, but they differ in ${differIn.join(", ")}`,
          );
        }
      }
    }
  }

  // --- E. A first bracket boundary that falls year over year.
  //
  // The zero-rate band or lowest threshold is indexed in most states, so a drop
  // is either a real rate cut restructuring or a bad figure. Idaho 2025 held
  // Idaho Code 63-3024's *un-indexed statutory base* (2,500) where the indexed
  // value was 4,811 -- a 46% fall that no duplication or ratio check could see,
  // because all four statuses were distinct and internally consistent.
  for (const state of states) {
    for (let i = 1; i < years.length; i++) {
      for (const status of FILING_STATUSES) {
        const prev = (
          taxDataByYear[years[i - 1]]?.[state]?.[STATE_INCOME] as any
        )?.[status];
        const cur = (taxDataByYear[years[i]]?.[state]?.[STATE_INCOME] as any)?.[
          status
        ];
        if (!Array.isArray(prev) || !Array.isArray(cur)) continue;
        const a = prev[0]?.max;
        const b = cur[0]?.max;
        if (typeof a !== "number" || typeof b !== "number" || b >= a) continue;
        add(
          "bracket-floor-decreased",
          `${state}/${status}`,
          `${years[i - 1]} first bracket top ${a} -> ${years[i]} ${b} (${(((b - a) / a) * 100).toFixed(1)}%)`,
        );
      }
    }
  }

  // --- F. An indexed bracket schedule repeated in adjacent years.
  //
  // Reinstated deliberately, and deliberately narrow. A broad cross-year
  // equality check over every field was tried and rejected: 61 warnings to
  // catch one bug. Confined to `state_income` in states that demonstrably
  // index -- the schedule changes at two or more of the other year boundaries
  // -- it found North Dakota, whose 2025 held 2024's boundaries.
  //
  // CASCADE: it sees only the START of a shift. North Dakota's 2026 also held
  // the wrong year's boundaries, but differed from 2025 exactly as a real
  // indexation step would, so nothing internal could flag it. Whenever this
  // fires, treat EVERY LATER YEAR of that schedule as suspect too.
  for (const state of states) {
    const seq = years.map((y) => {
      const sched = taxDataByYear[y]?.[state]?.[STATE_INCOME];
      return sched ? JSON.stringify(sched) : "<absent>";
    });
    if (seq.includes("<absent>")) continue;
    let changes = 0;
    const repeats: number[] = [];
    for (let i = 1; i < seq.length; i++) {
      if (seq[i] === seq[i - 1]) repeats.push(i);
      else changes++;
    }
    if (changes < 2 || !repeats.length) continue;
    for (const i of repeats) {
      const later = years.slice(i + 1);
      add(
        "indexed-schedule-repeated",
        `${state}/${STATE_INCOME}`,
        `${years[i - 1]} and ${years[i]} are identical though this schedule changes at ${changes} of the other ${seq.length - 1} boundaries` +
          (later.length
            ? ` -- also re-check ${later.join(", ")}, a shift of this kind cascades and later years look normal`
            : ""),
      );
    }
  }

  // --- G. A rate lower than BOTH adjacent years.
  //
  // Tax rates move in runs, not spikes. A year that dips below the years either
  // side of it is almost never a real cut-and-restore -- it is a value from
  // somewhere else entirely.
  //
  // Maryland 2024 is why this exists. Fifteen of its twenty-four county rates
  // were Maryland figures from roughly 2010-2015: Worcester at 1.25%, a rate it
  // left in 2016. That file had been seeded from a decade-old table and never
  // revisited. Every other check here was blind to it -- the file was
  // internally consistent, structurally valid, and its ratios were fine. Only
  // its own neighbours gave it away.
  //
  // Zero false positives across 369 local rate series at the time of writing,
  // so a hit here deserves immediate attention rather than triage.
  const rateSeries = new Map<string, Record<string, number>>();
  for (const y of years) {
    for (const state of states) {
      const record = (key: string, list: any) => {
        const rate = Array.isArray(list) ? list[0]?.rate : undefined;
        if (typeof rate !== "number") return;
        if (!rateSeries.has(key)) rateSeries.set(key, {});
        rateSeries.get(key)![y] = rate;
      };
      const stateSchedule: any = taxDataByYear[y]?.[state]?.[STATE_INCOME];
      for (const [status, list] of Object.entries<any>(stateSchedule || {})) {
        record(`${state}/${STATE_INCOME}[${status}]`, list);
      }
      const cities: any = taxDataByYear[y]?.[state]?.[CITIES];
      for (const [city, cityData] of Object.entries<any>(cities || {})) {
        for (const [taxType, byStatus] of Object.entries<any>(cityData || {})) {
          for (const [status, list] of Object.entries<any>(byStatus || {})) {
            record(`${state}/${city}/${taxType}[${status}]`, list);
          }
        }
      }
    }
  }
  for (const [key, byYear] of rateSeries) {
    for (let i = 1; i < years.length - 1; i++) {
      const prev = byYear[years[i - 1]];
      const cur = byYear[years[i]];
      const next = byYear[years[i + 1]];
      if ([prev, cur, next].some((v) => typeof v !== "number")) continue;
      if (cur < prev && cur < next) {
        add(
          "rate-dips-below-both-neighbours",
          key,
          `${years[i - 1]}=${prev}%, ${years[i]}=${cur}%, ${years[i + 1]}=${next}% -- a dip, not a run. Check where ${years[i]}'s value came from.`,
        );
      }
    }
  }

  const ORDER = [
    "rate-dips-below-both-neighbours",
    "statuses-share-a-schedule",
    "indexed-schedule-repeated",
    "bracket-floor-decreased",
    "deduction-decreased",
    "ratio-breaks-from-other-years",
    "married-single-ratio-outlier",
  ];
  warnings.sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
  const byKind = new Map<string, Warning[]>();
  for (const w of warnings) {
    if (!byKind.has(w.kind)) byKind.set(w.kind, []);
    byKind.get(w.kind)!.push(w);
  }
  for (const [kind, list] of byKind) {
    console.log(`\n### ${kind} (${list.length})`);
    for (const w of list) console.log(`  ${w.where.padEnd(44)} ${w.detail}`);
  }
  console.log(
    `\n${warnings.length} warnings. Heuristics, not errors -- confirm each against the state's own publication.`,
  );
  console.log(
    "\nA flag identifies a suspect YEAR, not a suspect cell. In three of five\n" +
      "states checked this way the flagged field was not the only wrong one in\n" +
      "that year: one bad head-of-household figure sat beside three more, a ratio\n" +
      "flag beside four stale figures, a single bracket flag on top of eight wrong\n" +
      "boundaries. Re-verify the whole year against the source, not just the cell\n" +
      "named below.",
  );
}
main();
