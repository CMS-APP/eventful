import { useState } from "react";

import { StyleSheet, View } from "react-native";

import { useAppDimensions } from "@/app/hooks/useAppDimensions";
import { colors } from "@/design-system/tokens/colors";

import { useCalenderEvents } from "../hooks/useCalenderEvents";
import { CalendarView } from "./CalendarView";
import { EventsView } from "./EventsView";

export function Calendar() {
  const { allEvents, allInvitedEvents } = useCalenderEvents();
  const height = useAppDimensions().screenHeight;
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  return (
    <View style={styles.container}>
      <CalendarView
        currentMonth={currentMonth}
        currentYear={currentYear}
        setCurrentMonth={setCurrentMonth}
        setCurrentYear={setCurrentYear}
        allEvents={allEvents}
        allInvitedEvents={allInvitedEvents}
      />

      <EventsView
        allEvents={allEvents}
        allInvitedEvents={allInvitedEvents}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />

      <View
        style={[
          styles.animatedView,
          {
            bottom: -height,
            height: height
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  animatedView: {
    backgroundColor: colors.primary,
    left: 0,
    position: "absolute",
    right: 0,
    width: "100%"
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 16
  }
});
