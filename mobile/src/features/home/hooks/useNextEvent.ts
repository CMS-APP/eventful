import { useSelector } from "react-redux";

import { useCallback, useRef, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";

import { getNextEvent } from "@/services/firebase/event";
import { getEventResponses } from "@/services/firebase/invite";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";
import { UserInvite } from "@/types/UserInvite";
import { isValidUserId } from "@/utils/userId";

export function useNextEvent(event: Event | null) {
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [percentageComplete, setPercentageComplete] = useState(0);
  const [accepted, setAccepted] = useState<UserInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedOnce = useRef(false);
  const userId = useSelector((state: UserState) => state.uid);

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

  const fetchData = useCallback(async () => {
    if (!isValidUserId(userId)) {
      setLoading(false);
      return;
    }
    if (!hasLoadedOnce.current) setLoading(true);
    const nextEvent = event || (await getNextEvent(userId));
    setNextEvent(nextEvent);
    setPercentageComplete(calculatePercentageComplete(nextEvent));
    const responses = await getEventResponses(nextEvent);
    setAccepted(responses);
    setLoading(false);
    hasLoadedOnce.current = true;
  }, [userId, event, calculatePercentageComplete]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  return { nextEvent, percentageComplete, accepted, loading };
}
