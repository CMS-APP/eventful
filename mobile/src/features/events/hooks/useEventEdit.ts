import { useCallback, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList } from "@/app/navigation";
import { getEventInfo } from "@/services/firebase/event";
import { Event } from "@/types/Event";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

export function useEventEdit(
  originalEvent: Event,
  navigation: StackNavigationProp<AllStackParamList>
) {
  const [event, setEvent] = useState<Event>(originalEvent);

  const fetchData = useCallback(async () => {
    const eventData = await getEventInfo(originalEvent);
    if (eventData) {
      setEvent(eventData);
    } else {
      log("Error fetching event: Event not found", "error");
      showErrorToast("Error Loading Event");
    }
  }, [originalEvent]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  return { event };
}
