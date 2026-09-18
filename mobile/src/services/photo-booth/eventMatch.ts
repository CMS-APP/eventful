import { getEventsFromDatabase } from "@/services/firebase/event";
import { Event } from "@/types/Event";
import { parseDatabaseDate } from "@/utils/date";
import { log } from "@/utils/logging";

const MATCH_WINDOW_MS = 12 * 60 * 60 * 1000;

export async function findHostedEventForNow(
  userId: string
): Promise<Event | null> {
  try {
    const { upcomingEvents, pastEvents } = await getEventsFromDatabase(userId);
    const now = Date.now();

    const candidates = [...upcomingEvents, ...pastEvents]
      .map((event) => ({
        event,
        time: parseDatabaseDate(event.date)?.getTime()
      }))
      .filter(
        (candidate): candidate is { event: Event; time: number } =>
          candidate.time !== undefined &&
          Math.abs(candidate.time - now) <= MATCH_WINDOW_MS
      );

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => Math.abs(a.time - now) - Math.abs(b.time - now));

    return candidates[0].event;
  } catch (error) {
    log(
      `Error matching hosted event for photo booth session: ${error}`,
      "error"
    );
    return null;
  }
}
