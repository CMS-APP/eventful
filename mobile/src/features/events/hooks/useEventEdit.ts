import { useCallback, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList } from "@/app/navigationTypes";
import { getEventInfo } from "@/services/firebase/firebaseEventFunctions";
import { Event } from "@/types/Event";
import { showErrorNotification } from "@/utils/appNotifications";
import { log } from "@/utils/logging";

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
      showErrorNotification("Error Loading Event");
    }
  }, [originalEvent]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  return { event };
}
