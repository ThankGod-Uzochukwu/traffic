import type { CoverageClass, DataSource } from "../../src/lib/types";

export interface CoverageInput {
  sources: DataSource[];
  countDays: number;
  yearsActive: number[];
}

const STALE_AFTER_YEARS = 5;
// An automated recorder logs hourly data essentially every day it is
// running. 200 distinct count days in a year is a reasonable line between
// "this is a permanent counter" and "this got an unusually long manual
// count", based on the automated dataset's typical near daily cadence.
const CONTINUOUS_MIN_COUNT_DAYS = 200;

export function classifyCoverage(
  input: CoverageInput,
  currentYear: number = new Date().getFullYear(),
): CoverageClass {
  const mostRecentYear = Math.max(0, ...input.yearsActive);
  if (currentYear - mostRecentYear > STALE_AFTER_YEARS) return "stale";

  if (
    input.sources.includes("automated") &&
    input.countDays >= CONTINUOUS_MIN_COUNT_DAYS
  ) {
    return "continuous";
  }

  if (input.yearsActive.length >= 2) return "annual";

  return "sparse";
}
