// Pulls the full Automated Traffic Volume Counts dataset (7ym2-wayt) and
// writes it to data/raw/automated.raw.json. Run this from a machine that
// can actually reach data.cityofnewyork.us (see the note in
// socrata-client.ts about the sandbox this project was built in).
//
// This dataset is large (continuous hourly counts since roughly 2011), so
// this can take a while and a lot of requests. Set SOCRATA_APP_TOKEN to
// avoid getting rate limited, and consider MAX_RECORDS for a quick test
// pull before fetching everything.
//
// Usage: npx tsx scripts/etl/fetch-automated.ts

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fetchAllRecords } from "./socrata-client";
import type { RawAutomatedRecord, RawFile } from "./raw-types";

const DATASET_ID = "7ym2-wayt";
const OUT_PATH = path.join(
  process.cwd(),
  "data",
  "raw",
  "automated.raw.json",
);

async function main() {
  console.log(`Fetching dataset ${DATASET_ID} from Socrata...`);

  const maxRecords = process.env.MAX_RECORDS
    ? Number(process.env.MAX_RECORDS)
    : undefined;

  const records = await fetchAllRecords<RawAutomatedRecord>({
    datasetId: DATASET_ID,
    appToken: process.env.SOCRATA_APP_TOKEN,
    maxRecords,
    onPage: (page, total) => {
      console.log(`  got ${page.length} records, ${total} so far`);
    },
  });

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
  console.log(`Wrote ${records.length} records to ${OUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
