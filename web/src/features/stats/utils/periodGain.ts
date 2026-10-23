export type GainInterval = "day" | "week" | "month" | "quarter";

export interface GainRange {
  label: string;
  days: number | null;
}

export interface GainPoint {
  date: string;
  gained: number;
  projected?: number;
}

export const GAIN_RANGES: GainRange[] = [
  { label: "Last month", days: 30 },
  { label: "Last 3 months", days: 91 },
  { label: "Last 6 months", days: 182 },
  { label: "Last 12 months", days: 365 },
  { label: "All time", days: null }
];

export const GAIN_INTERVALS: {
  value: GainInterval;
  label: string;
  days: number;
}[] = [
  { value: "day", label: "Daily", days: 1 },
  { value: "week", label: "Weekly", days: 7 },
  { value: "month", label: "Monthly", days: 30 },
  { value: "quarter", label: "Quarterly", days: 91 }
];

export function isIntervalAvailable(range: GainRange, interval: GainInterval) {
  if (range.days === null) return true;
  const intervalDays = GAIN_INTERVALS.find((i) => i.value === interval)!.days;
  return intervalDays * 2 <= range.days;
}

function periodStart(date: string, interval: GainInterval): string {
  const d = new Date(`${date}T00:00:00Z`);
  switch (interval) {
    case "day":
      return date;
    case "week": {
      const offset = (d.getUTCDay() + 6) % 7;
      d.setUTCDate(d.getUTCDate() - offset);
      return d.toISOString().slice(0, 10);
    }
    case "month":
      return `${date.slice(0, 7)}-01`;
    case "quarter": {
      const month = Math.floor(d.getUTCMonth() / 3) * 3 + 1;
      return `${d.getUTCFullYear()}-${String(month).padStart(2, "0")}-01`;
    }
  }
}

const MS_PER_DAY = 86_400_000;

function periodEnd(start: string, interval: GainInterval): Date {
  const d = new Date(`${start}T00:00:00Z`);
  switch (interval) {
    case "day":
      d.setUTCDate(d.getUTCDate() + 1);
      break;
    case "week":
      d.setUTCDate(d.getUTCDate() + 7);
      break;
    case "month":
      d.setUTCMonth(d.getUTCMonth() + 1);
      break;
    case "quarter":
      d.setUTCMonth(d.getUTCMonth() + 3);
      break;
  }
  return d;
}

export function withProjection(
  points: GainPoint[],
  interval: GainInterval,
  now: Date
): GainPoint[] {
  if (interval === "day" || points.length < 2) return points;

  const current = points[points.length - 1];
  if (current.date !== periodStart(now.toISOString().slice(0, 10), interval)) {
    return points;
  }

  const start = new Date(`${current.date}T00:00:00Z`).getTime();
  const end = periodEnd(current.date, interval).getTime();
  const elapsed = now.getTime() - start;
  if (elapsed < MS_PER_DAY) return points;

  const previous = points[points.length - 2];
  return [
    ...points.slice(0, -2),
    { ...previous, projected: previous.gained },
    {
      ...current,
      projected: Math.round((current.gained * (end - start)) / elapsed)
    }
  ];
}

export function periodGain(
  history: { date: string; total: number }[],
  range: GainRange,
  interval: GainInterval
): GainPoint[] {
  const closing = new Map<string, number>();
  for (const point of [...history].sort((a, b) =>
    a.date.localeCompare(b.date)
  )) {
    closing.set(periodStart(point.date, interval), point.total);
  }

  const periods = [...closing.entries()];
  const gains = periods.slice(1).map(([date, total], index) => ({
    date,
    gained: total - periods[index][1]
  }));

  if (range.days === null || history.length === 0) return gains;

  const latest = history.reduce((a, b) => (a.date > b.date ? a : b)).date;
  const cutoff = new Date(`${latest}T00:00:00Z`);
  cutoff.setUTCDate(cutoff.getUTCDate() - range.days);
  const cutoffPeriod = periodStart(cutoff.toISOString().slice(0, 10), interval);
  return gains.filter((point) => point.date > cutoffPeriod);
}
