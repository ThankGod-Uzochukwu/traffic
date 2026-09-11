"use client";

import { useMemo, useState } from "react";
import type { Location } from "@/lib/types";
import { MapView } from "./MapView";
import { LocationPanel } from "./LocationPanel";
import { Legend } from "./Legend";

type DashboardClientProps = {
  locations: Location[];
  expectedPeakHours: number[];
};

export function DashboardClient({
  locations,
  expectedPeakHours,
}: DashboardClientProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedId) ?? null,
    [locations, selectedId],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-3">
        <Legend />
        <div className="h-[560px]">
          <MapView
            locations={locations}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>
      <div className="h-[560px]">
        {selectedLocation ? (
          <LocationPanel
            location={selectedLocation}
            expectedPeakHours={expectedPeakHours}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted">
            Click a point on the map to see its traffic pattern.
          </div>
        )}
      </div>
    </div>
  );
}
