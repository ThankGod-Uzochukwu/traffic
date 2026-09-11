// Pulls the full Traffic Volume Counts (Historical) dataset (btm5-ppia)
// and writes it to data/raw/historical.raw.json. Run this from a machine
// that can actually reach data.cityofnewyork.us (see the note in
// socrata-client.ts about the sandbox this project was built in).
//
// Usage: npx tsx scripts/etl/fetch-historical.ts
// Optional: set SOCRATA_APP_TOKEN in the environment for higher rate limits.

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fetchAllRecords } from "./socrata-client";
import type { RawFile, RawHistoricalRecord } from "./raw-types";

const DATASET_ID = "btm5-ppia";
const OUT_PATH = path.join(process.cwd(), "data", "raw", "historical.raw.json");

async function main() {
  console.log(`Fetching dataset ${DATASET_ID} from Socrata...`);

  const records = await fetchAllRecords<RawHistoricalRecord>({
    datasetId: DATASET_ID,
    appToken: process.env.SOCRATA_APP_TOKEN,
    onPage: (page, total) => {
      console.log(`  got ${page.length} records, ${total} so far`);
    },
  });

  const file: RawFile<RawHistoricalRecord> = {
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
