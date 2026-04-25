import { Event } from "@/types/Event";

export function parseDatabaseDate(date: any) {
  if (!date) return null;

  if (typeof date === "string") {
    return new Date(date);
  }

  if (date.toDate) {
    return date.toDate();
  }

  return new Date(date);
}

export function formatDate(date: any) {
  if (!date) return "";
  const newDate = parseDatabaseDate(date);
  const options = {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  };

  return newDate.toLocaleDateString("en-GB", options).replace(/,\s/, " ");
}

export function formatTime(date: any) {
  const newDate = parseDatabaseDate(date);
  const options = {
    hour: "numeric",
    minute: "numeric"
  };
  return newDate.toLocaleTimeString("en-GB", options);
}

export function getMonthLength(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDayNextMonth = new Date(Date.UTC(year, month + 1, 1));
  const lastDayCurrentMonth = new Date(
    firstDayNextMonth.getTime() - 1 * 24 * 60 * 60 * 1000
  );

  return lastDayCurrentMonth.getUTCDate();
}

export function calculateTimeDifference(eventDate: Date) {
  const currentDate = new Date();
  const difference = eventDate.getTime() - currentDate.getTime();
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

  return { difference, days, hours, minutes };
}

export function calculateTimeDifferenceBetweenDates(
  startDate: Date,
  endDate: Date
) {
  const difference = endDate.getTime() - startDate.getTime();
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  return { difference, days, hours, minutes };
}

export function isActiveEvent(event: Event) {
  const startDate = parseDatabaseDate(event.date);
  if (!startDate) return false;
  startDate.setHours(startDate.getHours() + 12);

  const endDate = event.endDate ? parseDatabaseDate(event.endDate) : null;
  const currentDate = new Date();

  if (!event.multiDate) {
    return currentDate < startDate;
  } else if (event.multiDate && endDate) {
    return currentDate <= endDate;
  }
}

export function dateIsInEvent(
  startDate: Date,
  endDate: Date,
  date: Date
): boolean {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1;
  const startDay = startDate.getDate();

  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth() + 1;
  const currentDay = date.getDate();

  if (
    currentYear === startYear &&
    currentMonth === startMonth &&
    currentDay === startDay
  ) {
    return true;
  }

  if (startDate && endDate) {
    if (date >= startDate && date <= endDate) {
      return true;
    }

    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth() + 1;
    const endDay = endDate.getDate();

    if (
      endYear === currentYear &&
      endMonth === currentMonth &&
      endDay === currentDay
    ) {
      return true;
    }
  }

  return false;
}

export function calculateTimeAgo(date: Date) {
  const currentDate = new Date();
  const difference = currentDate.getTime() - date.getTime();

  if (difference < 60000) {
    return "just now";
  }

  if (difference < 3600000) {
    return `${Math.floor(difference / 60000)} minutes ago`;
  }

  if (difference < 86400000) {
    return `${Math.floor(difference / 3600000)} hours ago`;
  }

  return formatDate(date);
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date): Date {
  const next = new Date(d);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

export function addMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60000);
}

export function minutesBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 60000);
}

export function humanDurationShortBetween(a: Date, b: Date): string {
  const { days, hours, minutes } = calculateTimeDifferenceBetweenDates(a, b);
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  return parts.length ? parts.join(" ") : "0m";
}
