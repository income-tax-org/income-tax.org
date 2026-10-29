import { describe, it, expect } from "vitest";
import { readTaxDataFromDisk } from "@/data-loaders/read-from-disk";

const DATA_DIR = process.cwd() + "/src/data";

describe("readTaxDataFromDisk", () => {
  /**
   * A static export calls this once per generated page -- 3,000-odd times --
   * and each uncached call walks src/data and dynamic-imports all 200-plus
   * files. The memo is the difference between doing that once and doing it
   * once per page.
   */
  describe("memoization", () => {
    it("hands every caller the same promise for a directory", () => {
      const first = readTaxDataFromDisk(DATA_DIR);
      const second = readTaxDataFromDisk(DATA_DIR);
      expect(second).toBe(first);
    });

    // Caching the promise rather than the resolved value is what makes this
    // true; caching on resolve would let concurrent callers each start a
    // traversal before the first one finished.
    it("shares one traversal between callers that race", async () => {
      const racers = Array.from({ length: 8 }, () =>
        readTaxDataFromDisk(DATA_DIR),
      );
      expect(new Set(racers).size).toBe(1);

      const settled = await Promise.all(racers);
      for (const result of settled) {
        expect(result).toBe(settled[0]);
      }
    });
  });

  describe("the assembled set", () => {
    it("orders years newest first and reports the newest as current", async () => {
      const { years, currentYear } = await readTaxDataFromDisk(DATA_DIR);

      expect(years.length).toBeGreaterThanOrEqual(4);
      const descending = [...years].sort(
        (a, b) => parseInt(b, 10) - parseInt(a, 10),
      );
      expect(years).toEqual(descending);
      expect(currentYear).toBe(years[0]);
    });

    it("gives every year federal data and a full state roster", async () => {
      const { taxDataByYear, years } = await readTaxDataFromDisk(DATA_DIR);

      for (const year of years) {
        expect(taxDataByYear[year].federal, `${year} federal`).toBeTruthy();
        const states = Object.keys(taxDataByYear[year]).filter(
          (key) => key !== "federal",
        );
        expect(states.length, `${year} states`).toBe(51);
      }
    });

    it("collects the cities a state taxes", async () => {
      const { statesAndCitiesForYear, currentYear } =
        await readTaxDataFromDisk(DATA_DIR);

      expect(statesAndCitiesForYear[currentYear].oregon.cities).toContain(
        "portland",
      );
      // A state with no city taxes gets an empty list, never undefined -- the
      // city select maps over this directly.
      expect(statesAndCitiesForYear[currentYear].idaho.cities).toEqual([]);
    });
  });
});
