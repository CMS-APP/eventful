import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";

import { getEventsFromDatabase } from "@/services/firebase/event";
import { getInvitedEvents } from "@/services/firebase/invite";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";

export function useCalenderEvents() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [allInvitedEvents, setAllInvitedEvents] = useState<Event[]>([]);
  const userId = useSelector((state: UserState) => state.uid);

  const fetchData = useCallback(async () => {
    const { upcomingEvents, pastEvents } = await getEventsFromDatabase(userId);
    const allEvents = [...upcomingEvents, ...pastEvents];
    const invitedEvents = await getInvitedEvents(userId);
    setAllEvents(allEvents);
    setAllInvitedEvents(invitedEvents);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  return { allEvents, allInvitedEvents };
}
