import type { Borough, NormalizedCount } from "../../src/lib/types";
import {
  HISTORICAL_HOUR_LABELS,
  type RawAutomatedRecord,
  type RawHistoricalRecord,
} from "./raw-types";

const KNOWN_BOROUGHS: Borough[] = [
  "Manhattan",
  "Brooklyn",
  "Queens",
  "Bronx",
  "Staten Island",
];

function parseBorough(value: string | undefined): Borough | null {
  if (!value) return null;
  const match = KNOWN_BOROUGHS.find(
    (b) => b.toLowerCase() === value.trim().toLowerCase(),
  );
  return match ?? null;
}

// The automated dataset stores location as WKT, e.g. "POINT (-73.98 40.75)".
function parseWktPoint(
  wkt: string | undefined,
): { lat: number; lon: number } | null {
  if (!wkt) return null;
  const match = /POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/i.exec(
    wkt,
  );
  if (!match) return null;
  const lon = Number(match[1]);
  const lat = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}

export function normalizeHistorical(
  raw: RawHistoricalRecord[],
): NormalizedCount[] {
  const out: NormalizedCount[] = [];

  for (const record of raw) {
    const date = record.date?.slice(0, 10);
    if (!date) continue;

    // The historical dataset does not carry coordinates. Location is
    // resolved later, in matching, by segment id or by street name plus
    // cross streets. A record with no usable identifier at all is dropped.
    const segmentId = record.segmentid?.trim() || null;
    const street = record.roadway_name?.trim() ?? "";
    if (!segmentId && !street) continue;

    HISTORICAL_HOUR_LABELS.forEach((label, hour) => {
      const raw_value = record[label];
      if (raw_value === undefined || raw_value === "") return;
      const volume = Number(raw_value);
      if (!Number.isFinite(volume)) return;

      out.push({
        segmentId,
        street,
        from: record.from?.trim() ?? "",
        to: record.to?.trim() ?? "",
        direction: record.direction?.trim() ?? "",
        borough: null,
        lat: null,
        lon: null,
        date,
        hour,
        volume,
        source: "historical",
      });
    });
  }

  return out;
}

export function normalizeAutomated(
  raw: RawAutomatedRecord[],
): NormalizedCount[] {
  const out: NormalizedCount[] = [];

  for (const record of raw) {
    const year = Number(record.yr);
    const month = Number(record.m);
    const day = Number(record.d);
    const hour = Number(record.hh);
    const volume = Number(record.vol);
    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day) ||
      !Number.isFinite(hour) ||
      !Number.isFinite(volume)
    ) {
      continue;
    }

    const date = `${year.toString().padStart(4, "0")}-${month
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    const point = parseWktPoint(record.wktgeom);

    out.push({
      segmentId: record.segmentid?.trim() || null,
      street: record.street?.trim() ?? "",
      from: record.fromst?.trim() ?? "",
      to: record.tost?.trim() ?? "",
      direction: record.direction?.trim() ?? "",
      borough: parseBorough(record.boro),
      lat: point?.lat ?? null,
      lon: point?.lon ?? null,
      date,
      hour,
      volume,
      source: "automated",
    });
  }

  return out;
}
