import { describe, expect, it } from "vitest";
import { normalizeAutomated, normalizeHistorical } from "./normalize";
import { HISTORICAL_HOUR_LABELS } from "./raw-types";
import type { RawAutomatedRecord, RawHistoricalRecord } from "./raw-types";

describe("normalizeHistorical", () => {
  it("expands the 24 hourly columns into one record per hour", () => {
    const record: RawHistoricalRecord = {
      segmentid: "123",
      roadway_name: "Main St",
      from: "1 Ave",
      to: "2 Ave",
      direction: "NB",
      date: "2010-05-01T00:00:00.000",
    };
    HISTORICAL_HOUR_LABELS.forEach((label, hour) => {
      record[label] = String(hour * 10);
    });

    const result = normalizeHistorical([record]);

    expect(result).toHaveLength(24);
    expect(result[0]).toMatchObject({
      segmentId: "123",
      street: "Main St",
      date: "2010-05-01",
      hour: 0,
      volume: 0,
      source: "historical",
      lat: null,
      lon: null,
    });
    expect(result[8].volume).toBe(80);
  });

  it("skips records with no usable location and no date", () => {
    const noDate: RawHistoricalRecord = { roadway_name: "Main St" };
    const noLocation: RawHistoricalRecord = { date: "2010-05-01" };
    expect(normalizeHistorical([noDate, noLocation])).toHaveLength(0);
  });
});

describe("normalizeAutomated", () => {
  it("parses date parts, volume, and the WKT point", () => {
    const record: RawAutomatedRecord = {
      boro: "Queens",
      yr: "2023",
      m: "3",
      d: "9",
      hh: "8",
      vol: "512",
      segmentid: "456",
      wktgeom: "POINT (-73.9 40.7)",
      street: "Queens Blvd",
      fromst: "1 St",
      tost: "2 St",
      direction: "EB",
    };

    const [result] = normalizeAutomated([record]);

    expect(result).toMatchObject({
      segmentId: "456",
      borough: "Queens",
      date: "2023-03-09",
      hour: 8,
      volume: 512,
      lat: 40.7,
      lon: -73.9,
      source: "automated",
    });
  });

  it("drops records missing required numeric fields", () => {
    const missingVolume: RawAutomatedRecord = {
      yr: "2023",
      m: "1",
      d: "1",
      hh: "0",
    };
    expect(normalizeAutomated([missingVolume])).toHaveLength(0);
  });
});
