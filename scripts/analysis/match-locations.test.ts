import { describe, expect, it } from "vitest";
import { matchLocations } from "./match-locations";
import type { NormalizedCount } from "../../src/lib/types";

function count(overrides: Partial<NormalizedCount>): NormalizedCount {
  return {
    segmentId: null,
    street: "Main St",
    from: "1 Ave",
    to: "2 Ave",
    direction: "NB",
    borough: null,
    lat: null,
    lon: null,
    date: "2024-01-01",
    hour: 8,
    volume: 100,
    source: "historical",
    ...overrides,
  };
}

describe("matchLocations", () => {
  it("groups records sharing a segment id and direction into one location", () => {
    const result = matchLocations([
      count({ segmentId: "1", source: "historical", volume: 100 }),
      count({
        segmentId: "1",
        source: "automated",
        volume: 200,
        lat: 40.7,
        lon: -73.9,
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].sources.sort()).toEqual(["automated", "historical"]);
    expect(result[0].lat).toBe(40.7);
    const hour8 = result[0].hourlyProfile.find((h) => h.hour === 8);
    expect(hour8?.volume).toBe(150);
  });

  it("falls back to street and cross streets when there is no segment id", () => {
    const result = matchLocations([
      count({ street: "Main St", from: "1 Ave", to: "2 Ave" }),
      count({ street: "Other St", from: "3 Ave", to: "4 Ave" }),
    ]);
    expect(result).toHaveLength(2);
  });

  it("tracks distinct count days and years active", () => {
    const result = matchLocations([
      count({ segmentId: "1", date: "2020-01-01" }),
      count({ segmentId: "1", date: "2020-01-01", hour: 9 }),
      count({ segmentId: "1", date: "2022-06-01" }),
    ]);
    expect(result[0].countDays).toBe(2);
    expect(result[0].yearsActive).toEqual([2020, 2022]);
  });
});
