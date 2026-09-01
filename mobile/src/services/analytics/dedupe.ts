const recent = new Map<string, number>();
const TTL_MS = 1500;

export function isDuplicate(key: string): boolean {
  const now = Date.now();
  const last = recent.get(key);
  if (last !== undefined && now - last < TTL_MS) return true;
  recent.set(key, now);

  if (recent.size > 100) {
    for (const [k, t] of recent) {
      if (now - t >= TTL_MS) recent.delete(k);
    }
  }
  return false;
}
