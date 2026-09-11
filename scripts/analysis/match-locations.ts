import type {
  Borough,
  DataSource,
  HourlyVolume,
  NormalizedCount,
} from "../../src/lib/types";

export type LocationDraft = {
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
  hourlyProfile: HourlyVolume[];
};

function slug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Locations are matched primarily by segment id, since that is the one
// identifier both datasets are supposed to share for the same physical
// stretch of road. When a segment id is missing (common in the historical
// dataset), fall back to a key built from street name plus cross streets
// plus direction. That fallback is a heuristic, not a guarantee: two
// differently-named references to the same corner will not be matched.
function locationKey(count: NormalizedCount): string {
  if (count.segmentId) return `seg:${count.segmentId}:${slug(count.direction)}`;
  return `name:${slug(count.street)}:${slug(count.from)}:${slug(count.to)}:${slug(count.direction)}`;
}

export function matchLocations(counts: NormalizedCount[]): LocationDraft[] {
  const groups = new Map<string, NormalizedCount[]>();
  for (const count of counts) {
    const key = locationKey(count);
    const group = groups.get(key);
    if (group) group.push(count);
    else groups.set(key, [count]);
  }

  const drafts: LocationDraft[] = [];

  for (const [key, group] of groups) {
    const withCoords = group.find((c) => c.lat !== null && c.lon !== null);
    const withBorough = group.find((c) => c.borough !== null);
    const representative = group[0];

    const dates = new Set(group.map((c) => c.date));
    const years = new Set(group.map((c) => Number(c.date.slice(0, 4))));
    const sources = new Set(group.map((c) => c.source));

    const hourTotals = new Map<number, { sum: number; n: number }>();
    for (const count of group) {
      const bucket = hourTotals.get(count.hour) ?? { sum: 0, n: 0 };
      bucket.sum += count.volume;
      bucket.n += 1;
      hourTotals.set(count.hour, bucket);
    }
    const hourlyProfile: HourlyVolume[] = Array.from(
      { length: 24 },
      (_, hour) => {
        const bucket = hourTotals.get(hour);
        return { hour, volume: bucket ? bucket.sum / bucket.n : 0 };
      },
    );

    drafts.push({
      id: key,
      street: representative.street,
      from: representative.from,
      to: representative.to,
      direction: representative.direction,
      borough: withBorough?.borough ?? null,
      lat: withCoords?.lat ?? null,
      lon: withCoords?.lon ?? null,
      sources: Array.from(sources),
      countDays: dates.size,
      yearsActive: Array.from(years).sort((a, b) => a - b),
      hourlyProfile,
    });
  }

  return drafts;
}
