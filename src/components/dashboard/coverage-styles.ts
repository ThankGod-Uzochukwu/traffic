import { AlertTriangle, CalendarClock, CalendarX2, Radio } from "lucide-react";
import type { CoverageClass } from "@/lib/types";

// Four distinguishable hues plus a distinct icon and label for each, so the
// map and legend do not rely on color alone (colorblind viewers, or anyone
// on a washed out screen, still get the difference).
export const COVERAGE_STYLES: Record<
  CoverageClass,
  { label: string; description: string; color: string; icon: typeof Radio }
> = {
  continuous: {
    label: "Continuous",
    description: "An automated counter has been running here across years.",
    color: "#2563eb",
    icon: Radio,
  },
  annual: {
    label: "Annual",
    description: "Counted for a couple of weeks in more than one year.",
    color: "#0d9488",
    icon: CalendarClock,
  },
  sparse: {
    label: "Sparse",
    description:
      "Counted once, for a couple of weeks, and that is the only record.",
    color: "#d97706",
    icon: CalendarX2,
  },
  stale: {
    label: "Stale",
    description: "No count in years. Whatever is on file is old.",
    color: "#e11d48",
    icon: AlertTriangle,
  },
};
