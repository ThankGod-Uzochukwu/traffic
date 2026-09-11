// Imports a locally downloaded CSV copy of the Automated Traffic Volume
// Counts dataset into data/raw/automated.raw.json, in the same shape
// fetch-automated.ts would produce from the live API. Useful when
// data.cityofnewyork.us itself is unreachable but the data exists on a
// different host, for example the Kaggle mirror at
// kaggle.com/datasets/aadimator/nyc-automated-traffic-volume-counts.
//
// The exact column headers in a downloaded copy can vary (casing, spacing,
// "From" vs "fromSt"), so this matches headers case and punctuation
// insensitively against a list of known aliases, rather than assuming an
// exact header row.
//
// Usage: npx tsx scripts/etl/import-automated-csv.ts <path-to-csv>

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import type { RawAutomatedRecord, RawFile } from "./raw-types";

const DATASET_ID = "7ym2-wayt";
const OUT_PATH = path.join(process.cwd(), "data", "raw", "automated.raw.json");

const COLUMN_ALIASES: Record<keyof RawAutomatedRecord, string[]> = {
  requestid: ["requestid", "request id"],
  boro: ["boro", "borough"],
  yr: ["yr", "year"],
  m: ["m", "month"],
  d: ["d", "day"],
  hh: ["hh", "hour"],
  mm: ["mm", "minute"],
  vol: ["vol", "volume"],
  segmentid: ["segmentid", "segment id"],
  wktgeom: ["wktgeom", "wkt", "the_geom", "geometry"],
  street: ["street", "street name", "streetname"],
  fromst: ["fromst", "from", "from st", "fromstreet"],
  tost: ["tost", "to", "to st", "tostreet"],
  direction: ["direction", "dir"],
};

export function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function buildColumnMap(
  headers: string[],
): Partial<Record<keyof RawAutomatedRecord, string>> {
  const normalizedHeaders = headers.map((h) => ({
    raw: h,
    normalized: normalizeHeader(h),
  }));
  const map: Partial<Record<keyof RawAutomatedRecord, string>> = {};

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES) as [
    keyof RawAutomatedRecord,
    string[],
  ][]) {
    const normalizedAliases = aliases.map(normalizeHeader);
    const match = normalizedHeaders.find((h) =>
      normalizedAliases.includes(h.normalized),
    );
    if (match) map[field] = match.raw;
  }

  return map;
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error(
      "Usage: npx tsx scripts/etl/import-automated-csv.ts <path-to-csv>",
    );
    process.exitCode = 1;
    return;
  }

  const contents = await readFile(csvPath, "utf8");
  const rows: Record<string, string>[] = parse(contents, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  if (rows.length === 0) {
    console.error(`No rows found in ${csvPath}`);
    process.exitCode = 1;
    return;
  }

  const columnMap = buildColumnMap(Object.keys(rows[0]));
  const missing = (
    Object.keys(COLUMN_ALIASES) as (keyof RawAutomatedRecord)[]
  ).filter((field) => !columnMap[field]);
  if (missing.length > 0) {
    console.error(
      `Could not find a matching column for: ${missing.join(", ")}.\n` +
        `Found headers: ${Object.keys(rows[0]).join(", ")}.\n` +
        "Update COLUMN_ALIASES in scripts/etl/import-automated-csv.ts to match.",
    );
    process.exitCode = 1;
    return;
  }

  const records: RawAutomatedRecord[] = rows.map((row) => ({
    requestid: row[columnMap.requestid!],
    boro: row[columnMap.boro!],
    yr: row[columnMap.yr!],
    m: row[columnMap.m!],
    d: row[columnMap.d!],
    hh: row[columnMap.hh!],
    mm: row[columnMap.mm!],
    vol: row[columnMap.vol!],
    segmentid: row[columnMap.segmentid!],
    wktgeom: row[columnMap.wktgeom!],
    street: row[columnMap.street!],
    fromst: row[columnMap.fromst!],
    tost: row[columnMap.tost!],
    direction: row[columnMap.direction!],
  }));

  const file: RawFile<RawAutomatedRecord> = {
    meta: {
      synthetic: false,
      datasetId: DATASET_ID,
      fetchedAt: new Date().toISOString(),
      recordCount: records.length,
    },
    records,
  };

  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(file));
  console.log(
    `Imported ${records.length} real records from ${csvPath} to ${OUT_PATH}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
