import { Gauge, MapPinned, Radio } from "lucide-react";
import type { Summary } from "@/lib/types";

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Radio;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted">
        <Icon size={15} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

export function SummaryStats({ summary }: { summary: Summary }) {
  const rarelyChecked =
    summary.coverageBreakdown.sparse + summary.coverageBreakdown.stale;
  const rarelyCheckedShare = Math.round(
    (rarelyChecked / summary.totalLocations) * 100,
  );
  const offPattern = summary.mostOffPatternLocationIds.length;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        icon={MapPinned}
        label="Locations tracked"
        value={String(summary.totalLocations)}
        hint={`${summary.locationsWithCoordinates} plotted on the map`}
      />
      <StatCard
        icon={Radio}
        label="Rarely checked"
        value={`${rarelyCheckedShare}%`}
        hint="Counted once, or not recently"
      />
      <StatCard
        icon={Gauge}
        label="Off pattern"
        value={String(offPattern)}
        hint="Busiest hour does not match the citywide norm"
      />
    </div>
  );
}
