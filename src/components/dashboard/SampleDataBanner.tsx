import { FlaskConical } from "lucide-react";

export function SampleDataBanner() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-border bg-card/60 px-4 py-3 text-sm text-muted">
      <FlaskConical size={16} className="mt-0.5 shrink-0" />
      <p>
        This is sample data, generated to match the real dataset schemas, not
        actual NYC traffic counts. Run{" "}
        <code className="rounded bg-accent-soft px-1 py-0.5 text-accent">
          npm run etl:fetch
        </code>{" "}
        from a machine that can reach data.cityofnewyork.us, then{" "}
        <code className="rounded bg-accent-soft px-1 py-0.5 text-accent">
          npm run etl:build
        </code>
        , to replace it with the real thing.
      </p>
    </div>
  );
}
