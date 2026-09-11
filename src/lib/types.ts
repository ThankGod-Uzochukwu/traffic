export type Borough =
  | "Manhattan"
  | "Brooklyn"
  | "Queens"
  | "Bronx"
  | "Staten Island";

export type DataSource = "historical" | "automated";

export type CoverageClass = "continuous" | "annual" | "sparse" | "stale";

export interface HourlyVolume {
  hour: number;
  volume: number;
}

export interface NormalizedCount {
  segmentId: string | null;
  street: string;
  from: string;
  to: string;
  direction: string;
  borough: Borough | null;
  lat: number | null;
  lon: number | null;
  date: string;
  hour: number;
  volume: number;
  source: DataSource;
}

export interface Location {
  id: string;
  street: string;
  from: string;
  to: string;
  direction: string;
  borough: Borough | null;
  lat: number | null;
  lon: number | null;
  sources: DataSource[];
  countDays: number;
  yearsActive: number[];
  coverage: CoverageClass;
  hourlyProfile: HourlyVolume[];
  peakHour: number;
  troughHour: number;
  deviationScore: number;
}

export interface SummaryMeta {
  sample: boolean;
  generatedAt: string;
}

export interface Summary {
  meta: SummaryMeta;
  totalLocations: number;
  locationsWithCoordinates: number;
  coverageBreakdown: Record<CoverageClass, number>;
  citywideExpectedPeakHours: number[];
  citywideHourlyProfile: HourlyVolume[];
  mostOffPatternLocationIds: string[];
}
