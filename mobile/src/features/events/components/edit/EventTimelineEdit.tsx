import React, { useCallback, useEffect, useRef, useState } from "react";

import { StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";
import { TIMELINE_TEXT_LIST } from "@/features/events/constants";
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
  const [timelineList, setTimelineList] = useState<boolean[]>([]);
  const [percentageComplete, setPercentageComplete] = useState(0);

  const isInitializedRef = useRef(false);

  const calculatePercentageComplete = useCallback((list: boolean[]) => {
    const completed = list.filter((item: boolean) => item).length;
    return Math.round((completed / TIMELINE_TEXT_LIST.length) * 100);
  }, []);

  useEffect(() => {
    if (timelineList !== null && isInitializedRef.current) {
      setEvent((prevEvent: Event) => ({
        ...prevEvent,
        timelineList: timelineList as unknown as boolean[]
      }));
      setPercentageComplete(calculatePercentageComplete(timelineList));
    }
  }, [timelineList, setEvent, calculatePercentageComplete]);

  useEffect(() => {
    const newTimelineList =
      event.timelineList && event.timelineList.length > 0
        ? event.timelineList
        : Array(TIMELINE_TEXT_LIST.length).fill(false);

    setTimelineList(newTimelineList);
    setPercentageComplete(calculatePercentageComplete(newTimelineList));
    isInitializedRef.current = true;
  }, [event.timelineList, calculatePercentageComplete]);

  const updateList = useCallback(
    (index: number) => {
      const updatedList = [...timelineList];
      updatedList[index] = !updatedList[index];
      setTimelineList(updatedList);
    },
    [timelineList]
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
    paddingHorizontal: 24
  },
  itemContainer: {
    alignItems: "center",
    gap: 12
  }
});
