import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList } from "@/features/app/navigationTypes";
import { getEventsFromDatabase } from "@/services/firebase/firebaseEventFunctions";
import { getInvitedEvents } from "@/services/firebase/firebaseInviteFunctions";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";

export function useCalenderEvents() {
  const navigation = useNavigation() as StackNavigationProp<AllStackParamList>;
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
    }, [fetchData, navigation])
  );

  return { allEvents, allInvitedEvents };
}
