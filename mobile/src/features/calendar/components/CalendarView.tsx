import { useSelector } from "react-redux";

import { useEffect, useState } from "react";

import { Alert, StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AppStackParamList } from "@/features/app/navigationTypes";
import { getInviteFromDatabase } from "@/services/firebase/firebaseInviteFunctions";
import { getUserInfo } from "@/services/firebase/firebaseUserFunctions";
import { UserState } from "@/store/UserSlice";
import { colors } from "@/styles/colors";
import { CalendarDate } from "@/types/CalendarDate";
import { Event } from "@/types/Event";
import { calculateEventActiveDays, getCalendarWeeks } from "@/utils/calendar";
import { dateIsInEvent, isActiveEvent, parseDatabaseDate } from "@/utils/date";
import { haptics } from "@/utils/haptics";
import { navigateToEventEdit } from "@/utils/navigationHelpers";

import { CalendarDay } from "./CalendarDay";
import { CalendarDayHeader } from "./CalendarDayHeader";
import { CalendarHeader } from "./CalendarHeader";

interface CalendarViewProps {
  currentMonth: number;
  currentYear: number;
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  allEvents: Event[];
  allInvitedEvents: Event[];
}

export function CalendarView({
  currentMonth,
  currentYear,
  setCurrentMonth,
  setCurrentYear,
  allEvents,
  allInvitedEvents
}: CalendarViewProps) {
  const [calendarWeeks, setCalendarWeeks] = useState<CalendarDate[][]>([]);
  const [activeEventDays, setActiveEventDays] = useState<boolean[]>(
    Array(42).fill(false)
  );
  const [activeInviteDays, setActiveInviteDays] = useState<boolean[]>(
    Array(42).fill(false)
  );
  const userId = useSelector((state: UserState) => state.uid);
  const navigation = useNavigation() as StackNavigationProp<AppStackParamList>;

  useEffect(() => {
    const weeks = getCalendarWeeks(currentMonth, currentYear);

    setCalendarWeeks(weeks);
    const activeEventDays = calculateEventActiveDays(
      allEvents,
      currentMonth,
      currentYear
    );
    setActiveEventDays(activeEventDays);
    const activeInviteDays = calculateEventActiveDays(
      allInvitedEvents,
      currentMonth,
      currentYear
    );
    setActiveInviteDays(activeInviteDays);
  }, [currentMonth, currentYear, allEvents, allInvitedEvents]);

  function onDayPress(date: Date, type: string) {
    if (type === "previous") {
      monthChange(-1);
      return;
    } else if (type === "next") {
      monthChange(1);
      return;
    }

    // Find all events for the selected date
    const selectedEvents = allEvents.filter((event: Event) => {
      const eventDate = parseDatabaseDate(event.date);
      const endDate = event.endDate ? parseDatabaseDate(event.endDate) : null;
      return dateIsInEvent(eventDate, endDate, date);
    });

    const selectedInvites = allInvitedEvents.filter((event: Event) => {
      const eventDate = parseDatabaseDate(event.date);
      const endDate = event.endDate ? parseDatabaseDate(event.endDate) : null;
      return dateIsInEvent(eventDate, endDate, date);
    });

    if (selectedEvents.length + selectedInvites.length > 1) {
      Alert.alert(
        "Multiple Events",
        "There are multiple events on this date. Please select a specific event below.",
        [{ text: "OK" }]
      );
      return;
    }

    if (selectedEvents.length === 1) {
      navigateToEvent(selectedEvents[0]);
    } else if (selectedInvites.length === 1) {
      navigateToEvent(selectedInvites[0]);
    }
  }

  async function navigateToEvent(event: Event) {
    haptics.soft();
    if (event.userId === userId) {
      navigateToEventEdit(event);
      return;
    }

    const userDetails = await getUserInfo(event.userId);
    if (isActiveEvent(event)) {
      const invite = await getInviteFromDatabase(event, userId);
      if (invite && userDetails) {
        navigation.navigate("EventInvite", {
          invite,
          event,
          host: userDetails
        });
      } else {
        Alert.alert("Invite Not Found", "This invite was not found", [
          { text: "OK" }
        ]);
      }
    } else if (userDetails) {
      Alert.alert("Past Event", "This event has already passed", [
        { text: "OK" }
      ]);
    }
  }

  function monthChange(direction: number) {
    if (direction === 1) {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  }

  function refresh() {
    setCurrentMonth(new Date().getMonth());
    setCurrentYear(new Date().getFullYear());
  }

  return (
    <View style={styles.container}>
      <CalendarHeader
        refresh={refresh}
        currentMonth={currentMonth}
        currentYear={currentYear}
        monthChange={monthChange}
      />

      <View style={styles.daysContainer}>
        <CalendarDayHeader />

        {calendarWeeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((dateObj: CalendarDate, dayIndex: number) => (
              <CalendarDay
                key={weekIndex * 7 + dayIndex}
                dateObj={dateObj}
                index={weekIndex * 7 + dayIndex}
                activeEventDays={activeEventDays}
                activeInviteDays={activeInviteDays}
                onPress={onDayPress}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.white,
    flex: 1
  },
  daysContainer: {
    alignItems: "center",
    paddingHorizontal: 12
  },
  weekRow: {
    flexDirection: "row",
    gap: 1,
    marginBottom: 6
  }
});
