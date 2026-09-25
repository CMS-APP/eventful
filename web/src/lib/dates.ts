export function formatUtcDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions
): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  return date.toLocaleDateString(undefined, { ...options, timeZone: "UTC" });
}

export function formatShortUtcDate(dateStr: string): string {
  return formatUtcDate(dateStr, { month: "short", day: "numeric" });
}

export function formatMediumUtcDate(dateStr: string): string {
  return formatUtcDate(dateStr, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function formatDateTime(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch {
    return iso;
  }
}

export function formatEventDateTime(dateTime: { seconds: number }) {
  const date = new Date(dateTime.seconds * 1000);
  const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });
  const month = date.toLocaleDateString("en-GB", { month: "long" });
  const dateLabel = `${weekday} ${date.getDate()} ${month} ${date.getFullYear()}`;
  const timeLabel = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  return { dateLabel, timeLabel };
}

export function formatGalleryDate(date: string | null) {
  if (!date) return null;
  return new Date(date)
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    })
    .toUpperCase();
}

export function formatTimeOfDay(timeCreated: string | null) {
  if (!timeCreated) return "";
  return new Date(timeCreated).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}
