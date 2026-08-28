import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList } from "@/app/navigation";
import { getAllEvents } from "@/services/firebase/event";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";

export function useEventList(
  navigation: StackNavigationProp<AllStackParamList>
) {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [declineEvents, setDeclineEvents] = useState<Event[]>([]);
  const userId = useSelector((state: UserState) => state.uid);

  const fetchData = useCallback(async () => {
    const {
      upcomingEvents: allUpcomingEvents,
      pastEvents: allPastEvents,
      declineEvents: allDeclineEvents
    } = await getAllEvents(userId);

    setUpcomingEvents(allUpcomingEvents);
    setPastEvents(allPastEvents);
    setDeclineEvents(allDeclineEvents);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  return { upcomingEvents, pastEvents, declineEvents };
}
