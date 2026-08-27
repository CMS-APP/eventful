import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList } from "@/app/navigation";
import { getSortedInvites } from "@/services/firebase/firebaseEventFunctions";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";

export function useEventInvites(
  navigation: StackNavigationProp<AllStackParamList>
) {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const userId = useSelector((state: UserState) => state.uid);

  const fetchData = useCallback(async () => {
    const { upcomingEvents, pastEvents } = await getSortedInvites(userId);
    setUpcomingEvents(upcomingEvents);
    setPastEvents(pastEvents);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData, navigation])
  );

  return { upcomingEvents, pastEvents };
}
