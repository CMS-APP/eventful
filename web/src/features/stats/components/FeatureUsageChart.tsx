import { CHART_COLOR } from "@/features/stats/constants";
import type { FeatureUsageStat } from "@/lib/analytics";

export function FeatureUsageChart({
  features,
  loading
}: {
  features: FeatureUsageStat[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="chart-card-loading" role="status" aria-live="polite">
        <span className="chart-card-spinner" aria-hidden />
        <span>Loading...</span>
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <p className="chart-card-empty">
        No feature usage data yet from Firebase Analytics for this range.
      </p>
    );
  }

  const maxCount = Math.max(...features.map((feature) => feature.count), 1);

  return (
    <div className="feature-usage-list">
      {features.map((feature) => (
        <div
          className="feature-usage-row"
          key={feature.event}
          data-tooltip={`${feature.count.toLocaleString()} uses · ${feature.users.toLocaleString()} users`}
        >
          <span className="feature-usage-label">{feature.label}</span>
          <div className="feature-usage-row-bottom">
            <div className="feature-usage-bar-track">
              <div
                className="feature-usage-bar-fill"
                style={{
                  width: `${Math.max((feature.count / maxCount) * 100, 4)}%`,
                  backgroundColor: CHART_COLOR
                }}
              />
            </div>
            <span className="feature-usage-count">
              {feature.count.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
