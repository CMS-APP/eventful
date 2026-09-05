import { Itinerary } from "@/types/Itinerary";
import {
  addDays,
  addMinutes,
  endOfDay,
  minutesBetween,
  parseDatabaseDate,
  sameDay
} from "@/utils/date";

export type ItineraryTimelineBlock =
  | { kind: "day"; day: Date; key: string }
  | {
      kind: "activity";
      activity: Itinerary;
      start: Date;
      end: Date;
      key: string;
    }
  | { kind: "free"; start: Date; end: Date; key: string; hint?: string };

const MIN_GAP_MINUTES = 10;

export function buildItineraryTimelineBlocks(params: {
  eventStart: Date;
  eventEnd: Date | null;
  itinerary: Itinerary[];
}): {
  blocks: ItineraryTimelineBlock[];
  overlaps: Set<string>;
} {
  const { eventStart, eventEnd, itinerary } = params;

  const sorted = itinerary
    .slice()
    .sort(
      (a, b) =>
        parseDatabaseDate(a.startTime).getTime() -
        parseDatabaseDate(b.startTime).getTime()
    );

  const overlaps = new Set<string>();
  const blocks: ItineraryTimelineBlock[] = [];
  let lastDay: Date | null = null;

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    const aStart = parseDatabaseDate(a.startTime);
    const aEnd = addMinutes(aStart, a.durationMinutes || 60);
    const bStart = parseDatabaseDate(b.startTime);
    if (aEnd > bStart) {
      overlaps.add(a.id);
      overlaps.add(b.id);
    }
  }

  const pushDayHeader = (d: Date) => {
    if (lastDay && sameDay(lastDay, d)) return;
    const key = `day-${d.toISOString().slice(0, 10)}`;
    blocks.push({ kind: "day", day: d, key });
    lastDay = d;
  };

  const addGapChunks = (from: Date, to: Date) => {
    let cur = from;
    while (cur < to) {
      const chunkEnd = new Date(
        Math.min(endOfDay(cur).getTime(), to.getTime())
      );
      pushDayHeader(cur);
      if (minutesBetween(cur, chunkEnd) >= MIN_GAP_MINUTES) {
        blocks.push({
          kind: "free",
          start: cur,
          end: chunkEnd,
          key: `free-${cur.toISOString()}-${chunkEnd.toISOString()}`
        });
      }
      cur = addDays(cur, 1);
    }
  };

  if (!sorted.length) {
    if (eventEnd && eventEnd > eventStart) {
      pushDayHeader(eventStart);
      blocks.push({
        kind: "free",
        start: eventStart,
        end: eventEnd,
        key: `free-empty-${eventStart.toISOString()}-${eventEnd.toISOString()}`,
        hint: "Your event is currently empty — tap to add your first moment."
      });
    }
    return { blocks, overlaps };
  }

  let cursor = eventStart;
  for (const activity of sorted) {
    const start = parseDatabaseDate(activity.startTime);
    const end = addMinutes(start, activity.durationMinutes || 60);

    if (start > cursor) {
      addGapChunks(cursor, start);
    }

    pushDayHeader(start);
    blocks.push({
      kind: "activity",
      activity,
      start,
      end,
      key: `activity-${activity.id}`
    });

    cursor = new Date(Math.max(cursor.getTime(), end.getTime()));
  }

  if (eventEnd && eventEnd > cursor) {
    pushDayHeader(cursor);
    addGapChunks(cursor, eventEnd);
  }

  return { blocks, overlaps };
}
