import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { formatShortUtcDate } from "@/lib/dates";

const AXIS_TICK = { fontSize: 11, fill: "rgba(255, 255, 255, 0.55)" };
const TOOLTIP_STYLE = {
  background: "rgba(10, 10, 10, 0.92)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  borderRadius: 8,
  color: "var(--color-white)",
  fontSize: 13
};

export function TrendChart<T extends { date: string }>({
  history,
  metric,
  color,
  formatValue,
  emptyMessage,
  loading,
  secondaryMetric,
  secondaryLabel,
  formatSecondaryValue,
  startAtZero,
  projectedMetric
}: {
  history: T[];
  metric: keyof T;
  color: string;
  formatValue: (value: number) => string;
  emptyMessage: string;
  loading: boolean;
  secondaryMetric?: keyof T;
  secondaryLabel?: string;
  formatSecondaryValue?: (value: number) => string;
  startAtZero?: boolean;
  projectedMetric?: keyof T;
}) {
  if (loading) {
    return (
      <div className="chart-card-loading" role="status" aria-live="polite">
        <span className="chart-card-spinner" aria-hidden />
        <span>Loading...</span>
      </div>
    );
  }

  if (history.length === 0) {
    return <p className="chart-card-empty">{emptyMessage}</p>;
  }

  const lastPoint = history[history.length - 1];
  const latest = Number(lastPoint[metric]) || 0;
  const latestProjected = projectedMetric ? lastPoint[projectedMetric] : null;

  function renderTooltip({
    active,
    payload,
    label
  }: {
    active?: boolean;
    payload?: readonly unknown[];
    label?: unknown;
  }) {
    if (!active || !payload || payload.length === 0) return null;
    const point = (payload[0] as { payload: T }).payload;
    const projected = projectedMetric ? point[projectedMetric] : null;
    const showProjected = projected != null && projected !== point[metric];

    return (
      <div style={{ ...TOOLTIP_STYLE, padding: "8px 12px" }}>
        <div>{formatShortUtcDate(String(label))}</div>
        <div>{formatValue(Number(point[metric]) || 0)}</div>
        {showProjected && (
          <div style={{ opacity: 0.75 }}>
            Projected: ~{formatValue(Number(projected) || 0)}
          </div>
        )}
        {secondaryMetric && point[secondaryMetric] != null && (
          <div style={{ opacity: 0.75 }}>
            {secondaryLabel}:{" "}
            {(formatSecondaryValue ?? String)(
              Number(point[secondaryMetric]) || 0
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="chart-card-summary">
        <span className="chart-card-summary-value">{formatValue(latest)}</span>
        {latestProjected != null && (
          <span className="chart-card-summary-label">
            ~{formatValue(Number(latestProjected) || 0)} projected
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart
          data={history}
          margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatShortUtcDate}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            domain={
              startAtZero
                ? [(dataMin: number) => Math.min(0, dataMin), "auto"]
                : ["auto", "auto"]
            }
            tickFormatter={(v) => formatValue(Number(v))}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip content={renderTooltip} />
          <Line
            type="monotone"
            dataKey={metric as string}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
          {projectedMetric && (
            <Line
              type="monotone"
              dataKey={projectedMetric as string}
              stroke={color}
              strokeWidth={2}
              strokeDasharray="5 5"
              strokeOpacity={0.7}
              dot={{ r: 3, fill: color, fillOpacity: 0.5, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              legendType="none"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
