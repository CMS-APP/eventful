import { useCallback, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList } from "@/features/app/navigationTypes";
import { getEventInfo } from "@/services/firebase/firebaseEventFunctions";
import { Event } from "@/types/Event";
import { AppError } from "@/utils/error";

export function useEventEdit(
  originalEvent: Event,
  navigation: StackNavigationProp<AllStackParamList>
) {
  const [event, setEvent] = useState<Event>(originalEvent);

  const fetchData = useCallback(async () => {
    const eventData = await getEventInfo(event);
    if (eventData) {
      setEvent(eventData);
    } else {
      new AppError(new Error("Event not found"), "Error fetching event", true);
    }
  }, [event]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData, navigation])
  );

  return { event };
}
