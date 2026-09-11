import { describe, expect, it } from "vitest";
import { buildColumnMap, normalizeHeader } from "./import-automated-csv";

describe("normalizeHeader", () => {
  it("lowercases and strips punctuation and spaces", () => {
    expect(normalizeHeader("Segment ID")).toBe("segmentid");
    expect(normalizeHeader(" WktGeom ")).toBe("wktgeom");
    expect(normalizeHeader("From_St")).toBe("fromst");
  });
});

describe("buildColumnMap", () => {
  it("matches headers regardless of casing and spacing", () => {
    const headers = [
      "RequestID",
      "Boro",
      "Yr",
      "M",
      "D",
      "HH",
      "MM",
      "Vol",
      "Segment ID",
      "WktGeom",
      "street",
      "fromSt",
      "toSt",
      "Direction",
    ];
    const map = buildColumnMap(headers);
    expect(map.segmentid).toBe("Segment ID");
    expect(map.wktgeom).toBe("WktGeom");
    expect(map.fromst).toBe("fromSt");
    expect(Object.keys(map)).toHaveLength(14);
  });

  it("leaves a field unmapped when no header matches", () => {
    const map = buildColumnMap(["RequestID", "Boro"]);
    expect(map.requestid).toBe("RequestID");
    expect(map.vol).toBeUndefined();
  });
});
