import React, { useCallback, useEffect, useMemo, useState } from "react";

import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { EventsStackParamList } from "@/app/navigation";
import { colors } from "@/design-system/tokens/colors";
import {
  TIMELINE_ACTIONS,
  TIMELINE_TEXT_LIST
} from "@/features/events/constants";
import { trackEventTimelineItemToggled } from "@/services/analytics/events";
import { Event } from "@/types/Event";

import { TimelineBottom } from "./components/timeline/TimelineBottom";
import { TimelineButton } from "./components/timeline/TimelineButton";
import { TimelineDivider } from "./components/timeline/TimelineDivider";
import { TimelineTop } from "./components/timeline/TimelineTop";

interface EventTimelineEditProps {
  event: Event;
  setEvent: React.Dispatch<React.SetStateAction<Event>>;
}

export function EventTimelineEdit({ event, setEvent }: EventTimelineEditProps) {
  const navigation =
    useNavigation() as StackNavigationProp<EventsStackParamList>;
  const [timelineList, setTimelineList] = useState<boolean[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const calculatePercentageComplete = useCallback((list: boolean[]) => {
    const completed = list.filter((item: boolean) => item).length;
    return Math.round((completed / TIMELINE_TEXT_LIST.length) * 100);
  }, []);

  const percentageComplete = useMemo(
    () => calculatePercentageComplete(timelineList),
    [timelineList, calculatePercentageComplete]
  );

  const [prevEventTimelineList, setPrevEventTimelineList] = useState(
    event.timelineList
  );
  if (event.timelineList !== prevEventTimelineList) {
    setPrevEventTimelineList(event.timelineList);
    setTimelineList(
      event.timelineList && event.timelineList.length > 0
        ? event.timelineList
        : Array(TIMELINE_TEXT_LIST.length).fill(false)
    );
    setIsInitialized(true);
  }

  useEffect(() => {
    if (!isInitialized) return;
    setEvent((prevEvent: Event) => ({
      ...prevEvent,
      timelineList: timelineList as unknown as boolean[]
    }));
  }, [timelineList, isInitialized, setEvent]);

  const updateList = useCallback(
    (index: number) => {
      const updatedList = [...timelineList];
      updatedList[index] = !updatedList[index];
      setTimelineList(updatedList);
      trackEventTimelineItemToggled(updatedList[index]);
    },
    [timelineList]
  );

  const navigateToAction = useCallback(
    (index: number) => {
      const action = TIMELINE_ACTIONS[index];
      if (!action) return;

      navigation.reset({
        index: 2,
        routes: [
          { name: "EventsList" },
          { name: "EventEdit", params: { event } },
          { name: action.screen as any, params: { event, ...action.params } }
        ]
      });
    },
    [navigation, event]
  );

  return (
    <View style={styles.container}>
      {timelineList.map((_, index) => (
        <View key={`timeline-${index}`} style={styles.itemContainer}>
          {index === 0 && (
            <TimelineTop percentageComplete={percentageComplete} />
          )}

          <TimelineButton
            index={index}
            updateList={updateList}
            textList={TIMELINE_TEXT_LIST}
            timelineList={timelineList}
            onNavigate={
              TIMELINE_ACTIONS[index]
                ? () => navigateToAction(index)
                : undefined
            }
          />

          {index !== timelineList.length - 1 && <TimelineDivider />}
          {index === timelineList.length - 1 && <TimelineBottom />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryTint2,
    flex: 1,
    paddingHorizontal: 16
  },
  itemContainer: {
    alignItems: "center",
    gap: 12
  }
});
