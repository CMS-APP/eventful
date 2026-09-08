export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;

export function readLocalCache<T>(key: string, ttlMs: number): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const { timestamp, data } = JSON.parse(raw) as {
      timestamp: number;
      data: T;
    };
    if (Date.now() - timestamp > ttlMs) return null;
    return data;
  } catch {
    return null;
  }
}

export function writeLocalCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch {}
}
