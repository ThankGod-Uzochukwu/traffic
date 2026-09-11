"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X } from "lucide-react";
import type { Location } from "@/lib/types";
import { CoverageBadge } from "./CoverageBadge";
import { HourlyChart } from "./HourlyChart";
import { COVERAGE_STYLES } from "./coverage-styles";

type LocationPanelProps = {
  location: Location | null;
  expectedPeakHours: number[];
  onClose: () => void;
};

function formatHour(hour: number): string {
  const period = hour < 12 ? "am" : "pm";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}${period}`;
}

export function LocationPanel({
  location,
  expectedPeakHours,
  onClose,
}: LocationPanelProps) {
  return (
    <AnimatePresence>
      {location && (
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.25 }}
          className="flex h-full flex-col rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <MapPin size={18} className="mt-0.5 shrink-0 text-accent" />
              <div>
                <h3 className="text-sm font-semibold">{location.street}</h3>
                <p className="text-xs text-muted">
                  {location.from} to {location.to}
                  {location.direction ? `, ${location.direction}` : ""}
                  {location.borough ? ` · ${location.borough}` : ""}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close location detail"
              className="rounded-full p-1 text-muted transition-colors hover:bg-accent-soft hover:text-accent"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-4">
            <CoverageBadge coverage={location.coverage} />
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {COVERAGE_STYLES[location.coverage].description}
            </p>
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium text-muted">
              Average volume by hour
            </p>
            <div className="mt-2">
              <HourlyChart
                profile={location.hourlyProfile}
                expectedPeakHours={expectedPeakHours}
                color={COVERAGE_STYLES[location.coverage].color}
              />
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-muted">Busiest hour</dt>
              <dd className="font-medium">{formatHour(location.peakHour)}</dd>
            </div>
            <div>
              <dt className="text-muted">Quietest hour</dt>
              <dd className="font-medium">{formatHour(location.troughHour)}</dd>
            </div>
            <div>
              <dt className="text-muted">Count days on record</dt>
              <dd className="font-medium">{location.countDays}</dd>
            </div>
            <div>
              <dt className="text-muted">Years active</dt>
              <dd className="font-medium">
                {location.yearsActive.length > 0
                  ? location.yearsActive.join(", ")
                  : "none"}
              </dd>
            </div>
          </dl>

          {location.deviationScore > 0.5 && (
            <p className="mt-4 rounded-xl bg-accent-soft px-3 py-2 text-xs text-accent">
              This location&apos;s busiest hour does not line up with the
              citywide rush hour. It peaks at {formatHour(location.peakHour)}
              instead.
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
