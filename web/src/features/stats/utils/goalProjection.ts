const MS_PER_DAY = 86_400_000;
const DAYS_PER_MONTH = 30.44;

export interface GoalHistoryPoint {
  date: string;
  value: number;
}

export interface GoalHorizon {
  label: string;
  days: number | null;
}

export interface GoalProjection {
  label: string;
  pointCount: number;
  monthlyGrowth: number;
  currentValue: number;
  targetValue: number;
  daysRemaining: number | null;
  monthsRemaining: number | null;
  projectedDate: string | null;
}

function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return { slope: 0, intercept: sumY / n };
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function projectGoal(
  history: GoalHistoryPoint[],
  horizon: GoalHorizon,
  targetValue: number
): GoalProjection | null {
  if (history.length === 0) return null;

  const sorted = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const latest = sorted[sorted.length - 1];
  const windowStart =
    horizon.days === null
      ? -Infinity
      : new Date(latest.date).getTime() - horizon.days * MS_PER_DAY;
  const windowPoints = sorted.filter(
    (p) => new Date(p.date).getTime() >= windowStart
  );

  if (windowPoints.length < 2) return null;

  const originMs = new Date(windowPoints[0].date).getTime();
  const points = windowPoints.map((p) => ({
    x: (new Date(p.date).getTime() - originMs) / MS_PER_DAY,
    y: p.value
  }));
  const { slope, intercept } = linearRegression(points);
  const lastX = points[points.length - 1].x;
  const currentValue = latest.value;
  const monthlyGrowth = slope * DAYS_PER_MONTH;

  if (slope <= 0 || currentValue >= targetValue) {
    return {
      label: horizon.label,
      pointCount: windowPoints.length,
      monthlyGrowth,
      currentValue,
      targetValue,
      daysRemaining: currentValue >= targetValue ? 0 : null,
      monthsRemaining: currentValue >= targetValue ? 0 : null,
      projectedDate: currentValue >= targetValue ? latest.date : null
    };
  }

  const xTarget = (targetValue - intercept) / slope;
  const daysRemaining = Math.max(0, xTarget - lastX);
  const projectedDate = new Date(originMs + xTarget * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);

  return {
    label: horizon.label,
    pointCount: windowPoints.length,
    monthlyGrowth,
    currentValue,
    targetValue,
    daysRemaining,
    monthsRemaining: daysRemaining / DAYS_PER_MONTH,
    projectedDate
  };
}
