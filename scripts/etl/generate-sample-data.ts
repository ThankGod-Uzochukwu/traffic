// Produces synthetic data shaped exactly like the two real Socrata
// datasets, so the rest of the pipeline (normalize, match, analyze) can be
// built, tested, and demoed without needing live access to
// data.cityofnewyork.us, which was unreachable from the sandbox this
// project was built in. This is fixture data for local development only,
// not real NYC traffic counts. Run scripts/etl/fetch-historical.ts and
// scripts/etl/fetch-automated.ts against the live API to get real data.
//
// Usage: npx tsx scripts/etl/generate-sample-data.ts

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { HISTORICAL_HOUR_LABELS } from "./raw-types";
import type {
  RawAutomatedRecord,
  RawFile,
  RawHistoricalRecord,
} from "./raw-types";

const RAW_DIR = path.join(process.cwd(), "data", "raw");

// A small deterministic random number generator, so the sample dataset is
// stable across runs instead of changing on every regeneration.
function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(20000101);

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}
function randomBetween(min: number, max: number): number {
  return min + random() * (max - min);
}
function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

interface BoroughBounds {
  name: RawAutomatedRecord["boro"];
  lat: [number, number];
  lon: [number, number];
  streets: string[];
  crossStreets: string[];
}

const BOROUGHS: BoroughBounds[] = [
  {
    name: "Manhattan",
    lat: [40.7, 40.88],
    lon: [-74.02, -73.91],
    streets: ["Broadway", "8 Ave", "Lexington Ave", "Houston St", "14 St"],
    crossStreets: ["23 St", "34 St", "42 St", "57 St", "Canal St"],
  },
  {
    name: "Brooklyn",
    lat: [40.57, 40.74],
    lon: [-74.04, -73.83],
    streets: [
      "Flatbush Ave",
      "Atlantic Ave",
      "Bedford Ave",
      "4 Ave",
      "Court St",
    ],
    crossStreets: [
      "Fulton St",
      "Church Ave",
      "Eastern Pkwy",
      "86 St",
      "Myrtle Ave",
    ],
  },
  {
    name: "Queens",
    lat: [40.54, 40.8],
    lon: [-73.96, -73.7],
    streets: [
      "Queens Blvd",
      "Northern Blvd",
      "Woodhaven Blvd",
      "Astoria Blvd",
      "Main St",
    ],
    crossStreets: [
      "Roosevelt Ave",
      "Jamaica Ave",
      "Union Tpke",
      "Hillside Ave",
      "21 St",
    ],
  },
  {
    name: "Bronx",
    lat: [40.8, 40.92],
    lon: [-73.93, -73.77],
    streets: [
      "Grand Concourse",
      "Fordham Rd",
      "Bruckner Blvd",
      "White Plains Rd",
      "3 Ave",
    ],
    crossStreets: [
      "149 St",
      "Tremont Ave",
      "Gun Hill Rd",
      "E 161 St",
      "Westchester Ave",
    ],
  },
  {
    name: "Staten Island",
    lat: [40.49, 40.65],
    lon: [-74.25, -74.05],
    streets: [
      "Hylan Blvd",
      "Richmond Ave",
      "Victory Blvd",
      "Forest Ave",
      "Amboy Rd",
    ],
    crossStreets: [
      "Bay St",
      "Clove Rd",
      "Slosson Ave",
      "New Dorp Ln",
      "Page Ave",
    ],
  },
];

const DIRECTIONS = ["NB", "SB", "EB", "WB"] as const;

type PatternType = "commute" | "overnight" | "midday" | "flat";

// A simple bell curve centered on `center`, wrapped around the 24 hour
// clock so a center near midnight still produces a sensible bump.
function bell(hour: number, center: number, width: number, amplitude: number) {
  const diff = Math.min(Math.abs(hour - center), 24 - Math.abs(hour - center));
  return amplitude * Math.exp(-(diff * diff) / (2 * width * width));
}

function hourlyVolume(pattern: PatternType, hour: number, capacity: number) {
  const base = capacity * 0.08;
  let shaped: number;
  switch (pattern) {
    case "commute":
      shaped =
        base +
        bell(hour, 8, 1.6, capacity * 0.9) +
        bell(hour, 17, 1.8, capacity);
      break;
    case "overnight":
      shaped = base + bell(hour, 3, 1.4, capacity * 0.9);
      break;
    case "midday":
      shaped = base + bell(hour, 13, 2.5, capacity * 0.85);
      break;
    case "flat":
      shaped = capacity * 0.35;
      break;
  }
  const noise = randomBetween(0.85, 1.15);
  return Math.max(0, Math.round(shaped * noise));
}

// About 1 in 7 locations gets an off pattern, so the "rush hour isn't the
// same everywhere" finding has something real to show on the map.
function choosePattern(): PatternType {
  const roll = random();
  if (roll < 0.72) return "commute";
  if (roll < 0.85) return "overnight";
  if (roll < 0.94) return "midday";
  return "flat";
}

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

let nextSegmentId = 100000;
function newSegmentId(): string {
  nextSegmentId += 1;
  return String(nextSegmentId);
}

interface GeneratedSite {
  segmentId: string;
  borough: BoroughBounds;
  street: string;
  from: string;
  to: string;
  direction: (typeof DIRECTIONS)[number];
  lat: number;
  lon: number;
  capacity: number;
  pattern: PatternType;
}

function generateSite(): GeneratedSite {
  const borough = pick(BOROUGHS);
  return {
    segmentId: newSegmentId(),
    borough,
    street: pick(borough.streets),
    from: pick(borough.crossStreets),
    to: pick(borough.crossStreets),
    direction: pick(DIRECTIONS),
    lat: randomBetween(...borough.lat),
    lon: randomBetween(...borough.lon),
    capacity: randomBetween(250, 1600),
    pattern: choosePattern(),
  };
}

function automatedRecordsForSite(
  site: GeneratedSite,
  startDate: string,
  days: number,
): RawAutomatedRecord[] {
  const records: RawAutomatedRecord[] = [];
  for (let d = 0; d < days; d++) {
    const date = addDays(startDate, d);
    const [yr, m, day] = date.split("-");
    for (let hour = 0; hour < 24; hour++) {
      records.push({
        requestid: `${site.segmentId}-${date}-${hour}`,
        boro: site.borough.name,
        yr,
        m: String(Number(m)),
        d: String(Number(day)),
        hh: String(hour),
        mm: "0",
        vol: String(hourlyVolume(site.pattern, hour, site.capacity)),
        segmentid: site.segmentId,
        wktgeom: `POINT (${site.lon.toFixed(6)} ${site.lat.toFixed(6)})`,
        street: site.street,
        fromst: site.from,
        tost: site.to,
        direction: site.direction,
      });
    }
  }
  return records;
}

function historicalRecordForVisit(
  site: GeneratedSite,
  date: string,
  includeSegmentId: boolean,
): RawHistoricalRecord {
  const record: RawHistoricalRecord = {
    id: `${site.segmentId}-${date}`,
    segmentid: includeSegmentId ? site.segmentId : undefined,
    roadway_name: site.street,
    from: site.from,
    to: site.to,
    direction: site.direction,
    date,
  };
  HISTORICAL_HOUR_LABELS.forEach((label, hour) => {
    record[label] = String(hourlyVolume(site.pattern, hour, site.capacity));
  });
  return record;
}

function historicalVisitDays(startDate: string, windowDays: number): string[] {
  return Array.from({ length: windowDays }, (_, i) => addDays(startDate, i));
}

async function main() {
  const automated: RawAutomatedRecord[] = [];
  const historical: RawHistoricalRecord[] = [];

  // Continuous: automated recorders running across two years.
  for (let i = 0; i < 15; i++) {
    const site = generateSite();
    automated.push(...automatedRecordsForSite(site, "2023-01-10", 150));
    automated.push(...automatedRecordsForSite(site, "2024-02-01", 100));

    // A handful of these also got a one-off manual historical count, which
    // is the case where the two datasets should be matched by segment id.
    if (i < 5) {
      for (const date of historicalVisitDays("2022-05-02", 14)) {
        historical.push(historicalRecordForVisit(site, date, true));
      }
    }
  }

  // Annual: counted for a two week window in several different years.
  for (let i = 0; i < 25; i++) {
    const site = generateSite();
    const years = [2016, 2019, 2022].slice(0, 2 + Math.floor(random() * 2));
    for (const year of years) {
      const start = `${year}-${pad(3 + Math.floor(random() * 6), 2)}-01`;
      for (const date of historicalVisitDays(start, 14)) {
        historical.push(historicalRecordForVisit(site, date, false));
      }
    }
  }

  // Sparse: counted exactly once, in a fairly recent year.
  for (let i = 0; i < 80; i++) {
    const site = generateSite();
    const year = 2021 + Math.floor(random() * 3);
    const start = `${year}-${pad(3 + Math.floor(random() * 6), 2)}-01`;
    for (const date of historicalVisitDays(start, 14)) {
      historical.push(historicalRecordForVisit(site, date, false));
    }
  }

  // Stale: counted exactly once, a long time ago, never revisited.
  for (let i = 0; i < 20; i++) {
    const site = generateSite();
    const year = 2000 + Math.floor(random() * 6);
    const start = `${year}-${pad(3 + Math.floor(random() * 6), 2)}-01`;
    for (const date of historicalVisitDays(start, 14)) {
      historical.push(historicalRecordForVisit(site, date, false));
    }
  }

  const historicalFile: RawFile<RawHistoricalRecord> = {
    meta: {
      synthetic: true,
      datasetId: "btm5-ppia",
      generatedAt: new Date().toISOString(),
      recordCount: historical.length,
    },
    records: historical,
  };
  const automatedFile: RawFile<RawAutomatedRecord> = {
    meta: {
      synthetic: true,
      datasetId: "7ym2-wayt",
      generatedAt: new Date().toISOString(),
      recordCount: automated.length,
    },
    records: automated,
  };

  await mkdir(RAW_DIR, { recursive: true });
  await writeFile(
    path.join(RAW_DIR, "historical.raw.json"),
    JSON.stringify(historicalFile),
  );
  await writeFile(
    path.join(RAW_DIR, "automated.raw.json"),
    JSON.stringify(automatedFile),
  );

  console.log(
    `Generated ${historical.length} synthetic historical records and ` +
      `${automated.length} synthetic automated records.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
