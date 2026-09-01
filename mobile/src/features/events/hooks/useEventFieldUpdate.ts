import { useCallback, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";

import { trackEventUpdated } from "@/services/analytics/events";
import { getEventInfo, updateEventInDatabase } from "@/services/firebase/event";
import { Event } from "@/types/Event";

type EventStringField = "food" | "drink" | "decor" | "outfit" | "notes";

export function useEventFieldUpdate(
  initialEvent: Event,
  fieldName: EventStringField
) {
  const [event, setEvent] = useState<Event>(initialEvent);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      getEventInfo(initialEvent).then((freshEvent) => {
        if (freshEvent && !cancelled) {
          setEvent(freshEvent);
        }
      });

      return () => {
        cancelled = true;
      };
    }, [initialEvent])
  );

  const setEventField = useCallback(
    async (text: string | null) => {
      const updatedEvent = {
        ...event,
        [fieldName]: text ?? ""
      };

      setEvent(updatedEvent);
      await updateEventInDatabase(updatedEvent);
      trackEventUpdated();
    },
    [event, fieldName]
  );

  return { event, setEventField };
}
