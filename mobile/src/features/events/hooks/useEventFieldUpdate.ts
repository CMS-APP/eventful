import { useCallback, useState } from "react";

import { updateEventInDatabase } from "@/services/firebase/firebaseEventFunctions";
import { Event } from "@/types/Event";

type EventStringField = "food" | "drink" | "decor" | "outfit" | "notes";

export function useEventFieldUpdate(
  initialEvent: Event,
  fieldName: EventStringField
) {
  const [event, setEvent] = useState<Event>(initialEvent);

  const setEventField = useCallback(
    async (text: string | null) => {
      const updatedEvent = {
        ...event,
        [fieldName]: text ?? ""
      };

      setEvent(updatedEvent);
      await updateEventInDatabase(updatedEvent);
    },
    [event, fieldName]
  );

  return { event, setEventField };
}
