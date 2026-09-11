import type { HourlyVolume } from "../../src/lib/types";

const MORNING_WINDOW = { start: 5, end: 11 };
const EVENING_WINDOW = { start: 14, end: 20 };

function peakHourInWindow(
  profile: HourlyVolume[],
  start: number,
  end: number,
): number {
  let best = profile[start];
  for (let hour = start + 1; hour <= end; hour++) {
    if (profile[hour].volume > best.volume) best = profile[hour];
  }
  return best.hour;
}

// The citywide expected rush hour window is derived from the data itself
// rather than hardcoded to "8am and 5pm": it is the busiest hour within a
// typical morning commute window and the busiest hour within a typical
// evening commute window, averaged across every location that has data.
// This still assumes commuting is roughly bimodal, which is the whole
// point: locations whose real pattern does not look like that are the
// ones this project is trying to surface.
export function computeCitywideProfile(
  profiles: HourlyVolume[][],
): HourlyVolume[] {
  const totals = new Array(24).fill(0);
  const counts = new Array(24).fill(0);

  for (const profile of profiles) {
    for (const { hour, volume } of profile) {
      if (volume <= 0) continue;
      totals[hour] += volume;
      counts[hour] += 1;
    }
  }

  return totals.map((sum, hour) => ({
    hour,
    volume: counts[hour] > 0 ? sum / counts[hour] : 0,
  }));
}

export function computeCitywideExpectedPeakHours(
  citywideProfile: HourlyVolume[],
): number[] {
  return [
    peakHourInWindow(citywideProfile, MORNING_WINDOW.start, MORNING_WINDOW.end),
    peakHourInWindow(citywideProfile, EVENING_WINDOW.start, EVENING_WINDOW.end),
  ];
}

export function findPeakAndTrough(profile: HourlyVolume[]): {
  peakHour: number;
  troughHour: number;
} {
  const withVolume = profile.filter((p) => p.volume > 0);
  const source = withVolume.length > 0 ? withVolume : profile;
  let peak = source[0];
  let trough = source[0];
  for (const entry of source) {
    if (entry.volume > peak.volume) peak = entry;
    if (entry.volume < trough.volume) trough = entry;
  }
  return { peakHour: peak.hour, troughHour: trough.hour };
}

function circularHourDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 24;
  return Math.min(diff, 24 - diff);
}

// 0 means the location's busiest hour lines up exactly with one of the
// citywide expected rush hours. 1 means it peaks as far from both of them
// as the 24 hour clock allows (12 hours off), for example a location that
// is busiest at 3am.
export function computeDeviationScore(
  peakHour: number,
  citywideExpectedPeakHours: number[],
): number {
  const closest = Math.min(
    ...citywideExpectedPeakHours.map((h) => circularHourDistance(peakHour, h)),
  );
  return Number((closest / 12).toFixed(3));
}
