import { CHART_COLOR } from "@/features/stats/constants";
import type { FunnelStep } from "@/lib/analytics";

const FUNNEL_STEP_MIN_OPACITY = 0.15;

const FUNNEL_CHART_WIDTH = 1000;
const FUNNEL_CHART_HEIGHT = 220;
const FUNNEL_MAX_BAR_HEIGHT = 180;

export function FunnelChart({
  steps,
  loading
}: {
  steps: FunnelStep[];
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

  if (steps.length === 0 || steps.every((step) => step.users === 0)) {
    return (
      <p className="chart-card-empty">
        No funnel data yet from Firebase Analytics for this range.
      </p>
    );
  }

  const maxUsers = Math.max(...steps.map((step) => step.users), 1);
  const firstStepUsers = steps[0].users || maxUsers;

  const segmentWidth = FUNNEL_CHART_WIDTH / steps.length;
  const midY = FUNNEL_CHART_HEIGHT / 2;
  const barHeights = steps.map(
    (step) => Math.max(step.users / maxUsers, 0.03) * FUNNEL_MAX_BAR_HEIGHT
  );
  const stepOpacities = steps.map((step) =>
    Math.max(step.users / firstStepUsers, FUNNEL_STEP_MIN_OPACITY)
  );

  return (
    <div>
      <div className="funnel">
        <svg
          className="funnel-svg"
          viewBox={`0 0 ${FUNNEL_CHART_WIDTH} ${FUNNEL_CHART_HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          {steps.map((step, index) => {
            const xStart = index * segmentWidth;
            const xEnd = xStart + segmentWidth;
            const xMid = (xStart + xEnd) / 2;
            const hStart = barHeights[index];
            const hEnd = barHeights[index + 1] ?? barHeights[index];
            const topStart = midY - hStart / 2;
            const topEnd = midY - hEnd / 2;
            const bottomStart = midY + hStart / 2;
            const bottomEnd = midY + hEnd / 2;
            const path = [
              `M ${xStart} ${topStart}`,
              `C ${xMid} ${topStart}, ${xMid} ${topEnd}, ${xEnd} ${topEnd}`,
              `L ${xEnd} ${bottomEnd}`,
              `C ${xMid} ${bottomEnd}, ${xMid} ${bottomStart}, ${xStart} ${bottomStart}`,
              "Z"
            ].join(" ");

            return (
              <path
                key={step.id}
                d={path}
                fill={CHART_COLOR}
                opacity={stepOpacities[index]}
              />
            );
          })}
          {steps.slice(1).map((step, index) => (
            <line
              key={step.id}
              x1={(index + 1) * segmentWidth}
              y1={0}
              x2={(index + 1) * segmentWidth}
              y2={FUNNEL_CHART_HEIGHT}
              stroke="rgba(10, 26, 20, 0.35)"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <div className="funnel-labels">
          {steps.map((step, index) => {
            const previous = index > 0 ? steps[index - 1] : null;
            const conversionFromPrevious =
              previous && previous.users > 0
                ? (step.users / previous.users) * 100
                : null;

            return (
              <div className="funnel-label" key={step.id}>
                <span className="funnel-label-name">{step.label}</span>
                <span className="funnel-label-value">
                  {step.users.toLocaleString()}
                </span>
                {conversionFromPrevious !== null && (
                  <span className="funnel-label-conversion">
                    {conversionFromPrevious.toFixed(0)}% of previous step
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="funnel-vertical">
        {steps.map((step, index) => {
          const previous = index > 0 ? steps[index - 1] : null;
          const conversionFromPrevious =
            previous && previous.users > 0
              ? (step.users / previous.users) * 100
              : null;
          const barWidth = Math.max(step.users / maxUsers, 0.08) * 100;

          return (
            <div className="funnel-vertical-row" key={step.id}>
              <div className="funnel-vertical-text">
                <span className="funnel-label-name">{step.label}</span>
                <span className="funnel-label-value">
                  {step.users.toLocaleString()}
                </span>
                {conversionFromPrevious !== null && (
                  <span className="funnel-label-conversion">
                    {conversionFromPrevious.toFixed(0)}% of previous step
                  </span>
                )}
              </div>
              <div
                className="funnel-vertical-bar"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: CHART_COLOR,
                  opacity: stepOpacities[index]
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
