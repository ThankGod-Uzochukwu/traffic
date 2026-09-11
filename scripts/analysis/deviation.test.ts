import { describe, expect, it } from "vitest";
import {
  computeCitywideExpectedPeakHours,
  computeCitywideProfile,
  computeDeviationScore,
  findPeakAndTrough,
} from "./deviation";
import type { HourlyVolume } from "../../src/lib/types";

function flatProfileWithPeak(peakHour: number): HourlyVolume[] {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    volume: hour === peakHour ? 500 : 50,
  }));
}

describe("computeCitywideExpectedPeakHours", () => {
  it("finds the busiest hour in the morning and evening commute windows", () => {
    const profile = computeCitywideProfile([
      flatProfileWithPeak(8),
      flatProfileWithPeak(17),
    ]);
    expect(computeCitywideExpectedPeakHours(profile)).toEqual([8, 17]);
  });
});

describe("findPeakAndTrough", () => {
  it("picks out the busiest and quietest hour", () => {
    const { peakHour, troughHour } = findPeakAndTrough(
      flatProfileWithPeak(3),
    );
    expect(peakHour).toBe(3);
    expect(troughHour).toBeGreaterThanOrEqual(0);
  });
});

describe("computeDeviationScore", () => {
  it("scores a location peaking exactly at a citywide rush hour as zero", () => {
    expect(computeDeviationScore(8, [8, 17])).toBe(0);
  });

  it("scores a location peaking 12 hours from both rush hours as 1", () => {
    // 20 is 12 hours from 8 and 3 hours from 17, so the closest match wins.
    expect(computeDeviationScore(20, [8])).toBe(1);
  });

  it("scores a location that peaks between the two rush hours as partial", () => {
    const score = computeDeviationScore(2, [8, 17]);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });
});
