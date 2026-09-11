import { FlaskConical } from "lucide-react";
import type { SourceStatus } from "@/lib/types";

type SampleDataBannerProps = {
  historicalSource: SourceStatus;
  automatedSource: SourceStatus;
};

function describe(label: string, status: SourceStatus): string {
  if (status === "real") return `${label}: real data`;
  if (status === "synthetic") return `${label}: sample data, not real counts`;
  return `${label}: not loaded`;
}

export function SampleDataBanner({
  historicalSource,
  automatedSource,
}: SampleDataBannerProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-border bg-card/60 px-4 py-3 text-sm text-muted">
      <FlaskConical size={16} className="mt-0.5 shrink-0" />
      <div>
        <p>
          {describe("Historical dataset", historicalSource)}.{" "}
          {describe("Automated dataset", automatedSource)}. Sample data is
          generated to match the real dataset schemas, it is not actual NYC
          traffic counts.
        </p>
        <p className="mt-1">
          Run{" "}
          <code className="rounded bg-accent-soft px-1 py-0.5 text-accent">
            npm run etl:fetch
          </code>{" "}
          from a machine that can reach data.cityofnewyork.us, or{" "}
          <code className="rounded bg-accent-soft px-1 py-0.5 text-accent">
            npm run etl:import-automated-csv
          </code>{" "}
          with a downloaded copy of the automated dataset, then{" "}
          <code className="rounded bg-accent-soft px-1 py-0.5 text-accent">
            npm run etl:build
          </code>
          , to replace sample data with the real thing.
        </p>
      </div>
    </div>
  );
}
