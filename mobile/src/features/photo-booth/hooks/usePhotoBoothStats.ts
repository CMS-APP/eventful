import { useCallback, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";

import { getEvents } from "@/services/photo-booth/events";
import { calculateTimeAgo, parseDatabaseDate } from "@/utils/date";

type PhotoBoothStats = {
  photosTaken: number;
  inTheCloud: number;
  events: number;
  lastSessionLabel: string | null;
};

const DEFAULT_STATS: PhotoBoothStats = {
  photosTaken: 0,
  inTheCloud: 0,
  events: 0,
  lastSessionLabel: null
};

export function usePhotoBoothStats(userId: string) {
  const [stats, setStats] = useState<PhotoBoothStats>(DEFAULT_STATS);

  const loadStats = useCallback(async () => {
    if (!userId) return;

    try {
      const events = await getEvents(userId);

      let photosTaken = 0;
      let inTheCloud = 0;
      let lastDate: Date | null = null;

      for (const event of events) {
        photosTaken += event.photos.length;
        inTheCloud += event.photos.filter(
          (photo) => photo.type === "cloud" || photo.type === "both"
        ).length;

        const eventDate = parseDatabaseDate(event.date);
        if (eventDate && (!lastDate || eventDate > lastDate)) {
          lastDate = eventDate;
        }
      }

      setStats({
        photosTaken,
        inTheCloud,
        events: events.length,
        lastSessionLabel: lastDate ? calculateTimeAgo(lastDate) : null
      });
    } catch {
      setStats(DEFAULT_STATS);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  return stats;
}
