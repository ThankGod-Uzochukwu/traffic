"use client";

import type { HourlyVolume } from "@/lib/types";

type HourlyChartProps = {
  profile: HourlyVolume[];
  expectedPeakHours: number[];
  color: string;
};

const WIDTH = 320;
const HEIGHT = 120;
const BAR_GAP = 2;

function formatHour(hour: number): string {
  const period = hour < 12 ? "am" : "pm";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}${period}`;
}

export function HourlyChart({
  profile,
  expectedPeakHours,
  color,
}: HourlyChartProps) {
  const max = Math.max(...profile.map((p) => p.volume), 1);
  const barWidth = (WIDTH - BAR_GAP * (profile.length - 1)) / profile.length;

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT + 20}`}
        className="w-full"
        role="img"
        aria-label="Average traffic volume by hour of day"
      >
        {expectedPeakHours.map((hour) => (
          <rect
            key={`expected-${hour}`}
            x={hour * (barWidth + BAR_GAP)}
            y={0}
            width={barWidth}
            height={HEIGHT}
            fill="currentColor"
            className="text-accent/10"
          />
        ))}
        {profile.map(({ hour, volume }) => {
          const barHeight = (volume / max) * HEIGHT;
          return (
            <rect
              key={hour}
              x={hour * (barWidth + BAR_GAP)}
              y={HEIGHT - barHeight}
              width={barWidth}
              height={barHeight}
              rx={1.5}
              fill={color}
            >
              <title>
                {formatHour(hour)}: {Math.round(volume)} vehicles on average
              </title>
            </rect>
          );
        })}
        {[0, 6, 12, 18].map((hour) => (
          <text
            key={hour}
            x={hour * (barWidth + BAR_GAP)}
            y={HEIGHT + 14}
            fontSize={9}
            fill="currentColor"
            className="text-muted"
          >
            {formatHour(hour)}
          </text>
        ))}
      </svg>
      <p className="mt-1 text-xs text-muted">
        Shaded bands mark the citywide expected rush hours.
      </p>
    </div>
  );
}
