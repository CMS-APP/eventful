import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { MainStackParamList } from "@/features/app/navigationTypes";
import { getNextEvent } from "@/services/firebase/firebaseEventFunctions";
import { getEventResponses } from "@/services/firebase/firebaseInviteFunctions";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";
import { UserInvite } from "@/types/UserInvite";

export function useNextEvent(event: Event | null) {
  const navigation = useNavigation() as StackNavigationProp<MainStackParamList>;
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [percentageComplete, setPercentageComplete] = useState(0);
  const [accepted, setAccepted] = useState<UserInvite[]>([]);
  const userId = useSelector((state: UserState) => state.uid);

  const fetchData = useCallback(async () => {
    const nextEvent = event || (await getNextEvent(userId));
    setNextEvent(nextEvent);
    setPercentageComplete(calculatePercentageComplete(nextEvent));
    const responses = await getEventResponses(nextEvent);
    setAccepted(responses);
  }, [userId, event]);

  const calculatePercentageComplete = useCallback((event: Event) => {
    if (!event?.timelineList?.length) {
      return 0;
    }
    const total = event.timelineList.length;
    const complete = event.timelineList.filter(
      (value: boolean) => value
    ).length;
    return (complete / total) * 100;
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData, navigation])
  );

  return { nextEvent, percentageComplete, accepted };
}
