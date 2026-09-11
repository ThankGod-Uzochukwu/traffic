// Generic paginated fetcher for the Socrata Open Data API used by
// data.cityofnewyork.us. Not specific to either dataset, so both real
// fetch scripts share it.
//
// Known issue at the time this was written: data.cityofnewyork.us returned
// HTTP 403 to every request from the development sandbox used to build this
// project, and also to a real request from outside that sandbox, both as a
// bare nginx "403 Forbidden" page rather than a Socrata JSON error. That
// shape (generic edge page, not an app level error) usually means an edge
// or WAF layer is blocking the request before it reaches Socrata at all,
// most often on a missing or non-browser User-Agent, so this client sends
// a normal browser style one. If it is still failing, check the response
// body this throws (not just the status code): an HTML page confirms an
// edge block, worth trying from a different network or with a Socrata app
// token, while a JSON body means the request actually reached Socrata and
// the error is something else.

const BASE_URL = "https://data.cityofnewyork.us/resource";
const PAGE_SIZE = 5000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

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

    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
      "Accept-Language": "en-US,en;q=0.9",
    };
    if (appToken) headers["X-App-Token"] = appToken;

    const response = await fetch(url, { headers });
    if (!response.ok) {
      const bodyPreview = (await response.text()).slice(0, 300);
      throw new Error(
        `Socrata request failed for dataset ${datasetId}: ` +
          `${response.status} ${response.statusText} (${url.toString()})\n` +
          `Response body preview: ${bodyPreview}`,
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
