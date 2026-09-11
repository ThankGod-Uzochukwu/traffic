// Generic paginated fetcher for the Socrata Open Data API used by
// data.cityofnewyork.us. Not specific to either dataset, so both real
// fetch scripts share it.
//
// Known issue at the time this was written: data.cityofnewyork.us returned
// HTTP 403 to every request from the development sandbox used to build this
// project, while general internet access worked fine from the same
// machine. That looked like a host-specific block, not a broken URL or a
// dead API. If a fetch fails here with a 403, check whether you are running
// from an environment that can actually reach that host before assuming
// the dataset moved or the API changed.

const BASE_URL = "https://data.cityofnewyork.us/resource";
const PAGE_SIZE = 5000;

export interface FetchAllOptions {
  datasetId: string;
  appToken?: string;
  maxRecords?: number;
  onPage?: (records: unknown[], totalSoFar: number) => void;
}

export async function fetchAllRecords<T>(
  options: FetchAllOptions,
): Promise<T[]> {
  const { datasetId, appToken, maxRecords, onPage } = options;
  const records: T[] = [];
  let offset = 0;

  for (;;) {
    const limit = maxRecords
      ? Math.min(PAGE_SIZE, maxRecords - records.length)
      : PAGE_SIZE;
    if (limit <= 0) break;

    const url = new URL(`${BASE_URL}/${datasetId}.json`);
    url.searchParams.set("$limit", String(limit));
    url.searchParams.set("$offset", String(offset));
    url.searchParams.set("$order", ":id");

    const headers: Record<string, string> = { Accept: "application/json" };
    if (appToken) headers["X-App-Token"] = appToken;

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(
        `Socrata request failed for dataset ${datasetId}: ` +
          `${response.status} ${response.statusText} (${url.toString()})`,
      );
    }

    const page = (await response.json()) as T[];
    records.push(...page);
    onPage?.(page, records.length);

    if (page.length < limit) break;
    offset += page.length;
  }

  return records;
}
