import { getName, registerLocale } from "i18n-iso-countries";
import enCountryNames from "i18n-iso-countries/langs/en.json";

import type { UserDeviceStatsRow } from "@/features/stats/services/database";

registerLocale(enCountryNames);

export function regionName(region: string): string {
  return getName(region, "en") ?? region;
}

export function aggregateBy(
  rows: UserDeviceStatsRow[],
  field: keyof UserDeviceStatsRow
): { value: string; count: number }[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const v = String(row[field] ?? "unknown");
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

export function deviceTypeLabel(code: string): string {
  switch (code) {
    case "1":
      return "Phone";
    case "2":
      return "Tablet";
    case "3":
      return "Desktop";
    case "4":
      return "TV";
    default:
      return "Unknown";
  }
}

export function aggregateDeviceType(
  rows: UserDeviceStatsRow[]
): { value: string; count: number }[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const label = deviceTypeLabel(row.deviceType);
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

export function compareVersionsDescending(a: string, b: string): number {
  if (a === b) return 0;
  if (a === "unknown") return 1;
  if (b === "unknown") return -1;

  const aParts = a.split(".").map(Number);
  const bParts = b.split(".").map(Number);
  const length = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < length; i++) {
    const an = aParts[i] || 0;
    const bn = bParts[i] || 0;
    if (an !== bn) return bn - an;
  }
  return 0;
}
