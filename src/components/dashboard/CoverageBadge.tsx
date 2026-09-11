import type { CoverageClass } from "@/lib/types";
import { COVERAGE_STYLES } from "./coverage-styles";

export function CoverageBadge({ coverage }: { coverage: CoverageClass }) {
  const style = COVERAGE_STYLES[coverage];
  const Icon = style.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{ borderColor: `${style.color}40`, color: style.color }}
    >
      <Icon size={13} />
      {style.label}
    </span>
  );
}
