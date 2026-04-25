import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/components/text/Text";
import {
  AppStackParamList,
  EventsStackParamList
} from "@/features/app/navigationTypes";
import { getInviteFromDatabase } from "@/services/firebase/firebaseInviteFunctions";
import { getUserInfo } from "@/services/firebase/firebaseUserFunctions";
import { UserState } from "@/store/UserSlice";
import { colors } from "@/styles/colors";
import { textFormatter } from "@/styles/fonts";
import { globalStyles } from "@/styles/globalStyles";
import { Event } from "@/types/Event";
import { formatDate, formatTime } from "@/utils/date";
import { haptics } from "@/utils/haptics";
import { getHitSlop } from "@/utils/hitSlop";
import { log } from "@/utils/logging";

interface EventsListItemProps {
  index: number;
  event: Event;
  isUpcoming: boolean;
  isDecline: boolean;
  isGrid: boolean;
}

export function EventsListItem({
  index,
  event,
  isUpcoming,
  isDecline,
  isGrid
}: EventsListItemProps) {
  const userId = useSelector((state: UserState) => state.uid);
  const [host, setHost] = useState("");
  const light = !isUpcoming && !isDecline && event.userId !== userId;
  const navigation = useNavigation() as StackNavigationProp<AppStackParamList>;
  const navEvents =
    useNavigation() as StackNavigationProp<EventsStackParamList>;

  const getBackgroundColor = useCallback(() => {
    if (isUpcoming)
      return event.userId === userId ? colors.primary : colors.secondary;
    return isDecline
      ? colors.secondary
      : event.userId === userId
        ? colors.primaryTint
        : colors.lightGray;
  }, [isUpcoming, isDecline, event.userId, userId]);

  const getTextColor = useCallback(() => {
    return light ? colors.black : colors.white;
  }, [light]);

  const onPress = useCallback(async () => {
    haptics.soft();
    log(`Event: ${JSON.stringify(event, null, 2)}`, "debug");

    if (event.userId === userId) {
      navEvents.navigate("EventEdit", { event });
    } else if (isUpcoming || isDecline) {
      const userData = await getUserInfo(event.userId);
      const invite = await getInviteFromDatabase(event, userId);

      if (userData && invite) {
        (navigation as StackNavigationProp<AppStackParamList>).navigate(
          "EventInvite",
          {
            invite: invite,
            event,
            host: { ...userData }
          }
        );
      }
    } else {
      Alert.alert("Past Event", "This event has already passed", [
        { text: "OK" }
      ]);
    }
  }, [event, userId, navigation, isUpcoming, isDecline]);

  async function fetchHostInfo() {
    if (event.userId === userId) {
      setHost("You");
    } else {
      const hostDocData = await getUserInfo(event.userId);
      if (hostDocData) {
        setHost(hostDocData.name + " (" + hostDocData.username + ")");
      } else {
        setHost("");
      }
    }
  }

  useEffect(() => {
    fetchHostInfo();
  }, [event, isUpcoming, userId, isDecline]);

  return (
    <TouchableOpacity onPress={onPress} hitSlop={getHitSlop("large")}>
      <View
        style={[
          styles.eventContainer,
          { backgroundColor: getBackgroundColor() },
          isGrid && styles.gridContainer
        ]}
      >
        <Text type="header" color={getTextColor()} numberOfLines={2}>
          {textFormatter(event.name.trim(), 50, "Event")}
        </Text>
        <View style={[styles.detailsContainer, isGrid && styles.gridDetails]}>
          <View style={styles.detailRow}>
            <FontAwesome5 name="user" size={16} color={getTextColor()} />
            <View style={styles.hostContainer}>
              <Text type="body" color={getTextColor()} numberOfLines={1}>
                Host: {host}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome5
              name="calendar-alt"
              size={16}
              color={getTextColor()}
            />
            <Text type="body" style={{ color: getTextColor() }}>
              {formatDate(event.date)}
            </Text>
          </View>
          {event.multiDate && event.endDate && (
            <View style={styles.detailRow}>
              <FontAwesome5
                name="chevron-right"
                size={16}
                color={getTextColor()}
              />
              <Text type="body" style={{ color: getTextColor() }}>
                {formatDate(event.endDate)}
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <FontAwesome5 name="clock" size={16} color={getTextColor()} />
            <Text type="body" style={{ color: getTextColor() }}>
              {formatTime(event.date)}
              {event.multiDate && event.endDate
                ? " - " + formatTime(event.endDate)
                : ""}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  detailsContainer: {
    gap: 8,
    marginTop: 8
  },
  eventContainer: {
    ...globalStyles.largeWidget,
    alignItems: "flex-start",
    width: "100%"
  },
  gridContainer: {
    height: "100%",
    justifyContent: "flex-start"
  },
  gridDetails: {
    flex: 1,
    justifyContent: "flex-start"
  },
  hostContainer: {
    alignItems: "flex-start",
    gap: 0
  }
});
