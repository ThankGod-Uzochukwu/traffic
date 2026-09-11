// Reads whatever is in data/raw (real, from fetch-historical.ts and
// fetch-automated.ts, or synthetic, from generate-sample-data.ts),
// normalizes it, matches records into locations, runs the coverage and
// rush hour deviation analysis, and writes the aggregates the app reads
// from public/data.
//
// Usage: npx tsx scripts/build-data.ts

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { normalizeAutomated, normalizeHistorical } from "./etl/normalize";
import type { RawAutomatedRecord, RawFile, RawHistoricalRecord } from "./etl/raw-types";
import { matchLocations } from "./analysis/match-locations";
import { classifyCoverage } from "./analysis/coverage";
import {
  computeCitywideExpectedPeakHours,
  computeCitywideProfile,
  computeDeviationScore,
  findPeakAndTrough,
} from "./analysis/deviation";
import type { CoverageClass, Location, Summary } from "../src/lib/types";

const RAW_DIR = path.join(process.cwd(), "data", "raw");
const OUT_DIR = path.join(process.cwd(), "public", "data");
const TOP_OFF_PATTERN_COUNT = 12;

async function readRawFile<T>(fileName: string): Promise<RawFile<T> | null> {
  try {
    const contents = await readFile(path.join(RAW_DIR, fileName), "utf8");
    return JSON.parse(contents) as RawFile<T>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function main() {
  const historicalFile = await readRawFile<RawHistoricalRecord>(
    "historical.raw.json",
  );
  const automatedFile = await readRawFile<RawAutomatedRecord>(
    "automated.raw.json",
  );

  if (!historicalFile && !automatedFile) {
    console.error(
      "No raw data found in data/raw. Run `npm run etl:sample` for a " +
        "synthetic dataset, or `npm run etl:fetch` to pull real data " +
        "from a machine that can reach data.cityofnewyork.us.",
    );
    process.exitCode = 1;
    return;
  }

  const isSample = Boolean(
    historicalFile?.meta.synthetic ?? automatedFile?.meta.synthetic,
  );

  const normalizedHistorical = historicalFile
    ? normalizeHistorical(historicalFile.records)
    : [];
  const normalizedAutomated = automatedFile
    ? normalizeAutomated(automatedFile.records)
    : [];

  const drafts = matchLocations([
    ...normalizedHistorical,
    ...normalizedAutomated,
  ]);

  const citywideProfile = computeCitywideProfile(
    drafts.map((d) => d.hourlyProfile),
  );
  const citywideExpectedPeakHours =
    computeCitywideExpectedPeakHours(citywideProfile);

  const locations: Location[] = drafts.map((draft) => {
    const { peakHour, troughHour } = findPeakAndTrough(draft.hourlyProfile);
    return {
      ...draft,
      coverage: classifyCoverage(draft),
      peakHour,
      troughHour,
      deviationScore: computeDeviationScore(
        peakHour,
        citywideExpectedPeakHours,
      ),
    };
  });

  const coverageBreakdown = locations.reduce<Record<CoverageClass, number>>(
    (acc, loc) => {
      acc[loc.coverage] += 1;
      return acc;
    },
    { continuous: 0, annual: 0, sparse: 0, stale: 0 },
  );

  const mostOffPatternLocationIds = [...locations]
    .sort((a, b) => b.deviationScore - a.deviationScore)
    .slice(0, TOP_OFF_PATTERN_COUNT)
    .map((l) => l.id);

  const summary: Summary = {
    meta: { sample: isSample, generatedAt: new Date().toISOString() },
    totalLocations: locations.length,
    locationsWithCoordinates: locations.filter(
      (l) => l.lat !== null && l.lon !== null,
    ).length,
    coverageBreakdown,
    citywideExpectedPeakHours,
    citywideHourlyProfile: citywideProfile,
    mostOffPatternLocationIds,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(
    path.join(OUT_DIR, "locations.json"),
    JSON.stringify(locations),
  );
  await writeFile(path.join(OUT_DIR, "summary.json"), JSON.stringify(summary));

  console.log(
    `Wrote ${locations.length} locations (${summary.locationsWithCoordinates} ` +
      `with coordinates) to ${OUT_DIR}. Sample data: ${isSample}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
