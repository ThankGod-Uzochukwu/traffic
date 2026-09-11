// Field names match the real Socrata schemas for the two source datasets.
// Historical: https://data.cityofnewyork.us/Transportation/Traffic-Volume-Counts-Historical-/btm5-ppia
// Automated: https://data.cityofnewyork.us/Transportation/Automated-Traffic-Volume-Counts/7ym2-wayt

export interface RawHistoricalRecord {
  id?: string;
  segmentid?: string;
  roadway_name?: string;
  from?: string;
  to?: string;
  direction?: string;
  date?: string;
  // The historical dataset is wide: one column per hour of the day, using
  // labels like "12:00-1:00am". Rather than list all 24 as named fields,
  // callers index into this bag with the known label list.
  [hourLabel: string]: string | undefined;
}

export interface RawAutomatedRecord {
  requestid?: string;
  boro?: string;
  yr?: string;
  m?: string;
  d?: string;
  hh?: string;
  mm?: string;
  vol?: string;
  segmentid?: string;
  wktgeom?: string;
  street?: string;
  fromst?: string;
  tost?: string;
  direction?: string;
}

export interface RawFileMeta {
  synthetic: boolean;
  datasetId: string;
  fetchedAt?: string;
  generatedAt?: string;
  recordCount: number;
}

export interface RawFile<T> {
  meta: RawFileMeta;
  records: T[];
}

// The 24 hourly column labels used by the historical dataset, in order
// starting at midnight. Confirmed against the dataset's published column
// list; if NYC DOT ever renames them, normalize-historical.ts will need
// updating to match.
export const HISTORICAL_HOUR_LABELS = [
  "12:00-1:00am",
  "1:00-2:00am",
  "2:00-3:00am",
  "3:00-4:00am",
  "4:00-5:00am",
  "5:00-6:00am",
  "6:00-7:00am",
  "7:00-8:00am",
  "8:00-9:00am",
  "9:00-10:00am",
  "10:00-11:00am",
  "11:00-12:00pm",
  "12:00-1:00pm",
  "1:00-2:00pm",
  "2:00-3:00pm",
  "3:00-4:00pm",
  "4:00-5:00pm",
  "5:00-6:00pm",
  "6:00-7:00pm",
  "7:00-8:00pm",
  "8:00-9:00pm",
  "9:00-10:00pm",
  "10:00-11:00pm",
  "11:00-12:00am",
] as const;
