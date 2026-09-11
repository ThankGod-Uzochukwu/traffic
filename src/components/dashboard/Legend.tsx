import type { CoverageClass } from "@/lib/types";
import { COVERAGE_STYLES } from "./coverage-styles";

const ORDER: CoverageClass[] = ["continuous", "annual", "sparse", "stale"];

export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-xs">
      {ORDER.map((coverage) => {
        const style = COVERAGE_STYLES[coverage];
        const Icon = style.icon;
        return (
          <span
            key={coverage}
            className="inline-flex items-center gap-1.5"
            style={{ color: style.color }}
          >
            <Icon size={13} />
            {style.label}
          </span>
        );
      })}
      <span className="text-muted">Bigger dot, more off pattern</span>
    </div>
  );
}
