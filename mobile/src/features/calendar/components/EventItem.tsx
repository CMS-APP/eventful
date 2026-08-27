import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import {
  AppStackParamList,
  MainStackParamList
} from "@/features/app/navigationTypes";
import { getInviteFromDatabase } from "@/services/firebase/firebaseInviteFunctions";
import { getUserInfo } from "@/services/firebase/firebaseUserFunctions";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";
import { User } from "@/types/User";
import { isActiveEvent, parseDatabaseDate } from "@/utils/date";
import { haptics } from "@/utils/haptics";
import { getHitSlop } from "@/utils/hitSlop";
import { log } from "@/utils/logging";

interface EventItemProps {
  index: number;
  event: Event;
}

export function EventItem({ index, event }: EventItemProps) {
  const userId = useSelector((state: UserState) => state.uid);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const navigationEvents =
    useNavigation() as StackNavigationProp<MainStackParamList>;
  const navigationApp =
    useNavigation() as StackNavigationProp<AppStackParamList>;

  const fetchUserDetails = useCallback(async () => {
    log("Fetching user details", "info");
    const userDetails = await getUserInfo(event.userId);
    setUserDetails(userDetails);
  }, [event.userId]);

  useEffect(() => {
    if (userId && event.userId !== userId) {
      fetchUserDetails();
    }
  }, [event, userId]);

  async function navigateToEvent() {
    haptics.soft();
    log("Navigating to event", "info");
    const userDetails = await getUserInfo(event.userId);
    if (event.userId === userId) {
      navigationEvents.reset({
        index: 0,
        routes: [{ name: "Events" }]
      });

      setTimeout(() => {
        navigationEvents.navigate("Events", {
          screen: "EventEdit",
          params: { event }
        });
      }, 100);
    } else if (event.userId !== userId && isActiveEvent(event)) {
      const invite = await getInviteFromDatabase(event, userId);
      if (invite && userDetails) {
        navigationApp.navigate("EventInvite", {
          invite,
          event,
          host: userDetails
        });
      } else {
        Alert.alert("Invite Not Found", "This invite was not found", [
          { text: "OK" }
        ]);
      }
    } else if (event.userId !== userId && userDetails) {
      Alert.alert("Past Event", "This event has already passed", [
        { text: "OK" }
      ]);
    }
  }

  function getDateString() {
    const startDate = parseDatabaseDate(event.date);
    const day = startDate.getDate();

    if (event.endDate) {
      const endDate = parseDatabaseDate(event.endDate);
      const endDay = endDate.getDate();

      if (day === endDay) {
        return `${day}`;
      } else {
        return `${day} - ${endDay}`;
      }
    } else {
      return `${day}`;
    }
  }

  return (
    <TouchableOpacity
      key={index}
      onPress={navigateToEvent}
      hitSlop={getHitSlop("medium")}
    >
      <View style={styles.eventContainer}>
        <Text
          type="header"
          color={colors.secondary}
          style={
            event.endDate
              ? styles.eventDayTextWithEndDate
              : styles.eventDayTextDefault
          }
        >
          {getDateString()}
        </Text>
        <View>
          <Text type="body" style={styles.eventNameText} numberOfLines={1}>
            {event.name.trim() || "Event"}
          </Text>
          {event.userId !== userId && userDetails && (
            <Text type="body" italic style={styles.hostInfoText}>
              {userDetails.name} ({userDetails.username})
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  eventContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16
  },
  eventDayTextDefault: {
    fontSize: 24
  },
  eventDayTextWithEndDate: {
    fontSize: 24
  },
  eventNameText: {
    color: colors.white,
    flexWrap: "wrap",
    fontSize: 14,
    paddingRight: 60
  },
  hostInfoText: {
    color: colors.gray
  }
});
