import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome5 } from "@expo/vector-icons";

import { AppStackParamList, EventsStackParamList } from "@/app/navigation";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { textFormatter } from "@/design-system/tokens/fonts";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { getInviteFromDatabase } from "@/services/firebase/invite";
import { getUserInfo } from "@/services/firebase/user";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";
import { formatTime, parseDatabaseDate } from "@/utils/date";
import { haptics } from "@/utils/haptics";

import { EventDateBadge } from "./EventDateBadge";

interface EventsListItemProps {
  index: number;
  event: Event;
  isUpcoming: boolean;
  isDecline: boolean;
}

export function EventsListItem({
  event,
  isUpcoming,
  isDecline
}: EventsListItemProps) {
  const userId = useSelector((state: UserState) => state.uid);
  const [host, setHost] = useState("");
  const isOwner = event.userId === userId;
  const navigation = useNavigation() as StackNavigationProp<AppStackParamList>;
  const navEvents =
    useNavigation() as StackNavigationProp<EventsStackParamList>;

  const onPress = useCallback(async () => {
    haptics.soft();

    if (isOwner) {
      navEvents.navigate("EventEdit", { event });
    } else if (isUpcoming || isDecline) {
      const userData = await getUserInfo(event.userId);
      const invite = await getInviteFromDatabase(event, userId);

      if (userData && invite) {
        navigation.navigate("EventInvite", {
          invite: invite,
          event,
          host: { ...userData }
        });
      }
    } else {
      Alert.alert("Past Event", "This event has already passed", [
        { text: "OK" }
      ]);
    }
  }, [event, userId, navigation, navEvents, isUpcoming, isDecline, isOwner]);

  async function fetchHostInfo() {
    if (isOwner) {
      setHost("You");
    } else {
      const hostDocData = await getUserInfo(event.userId);
      setHost(hostDocData ? hostDocData.name : "");
    }
  }

  useEffect(() => {
    if (userId) {
      fetchHostInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, userId]);

  const daysDuration =
    event.multiDate && event.endDate
      ? Math.round(
          (parseDatabaseDate(event.endDate).getTime() -
            parseDatabaseDate(event.date).getTime()) /
            86400000
        ) + 1
      : null;

  return (
    <TouchableOpacity onPress={onPress} hitSlop={getHitSlop("large")}>
      <View style={styles.eventContainer}>
        <EventDateBadge
          date={event.date}
          endDate={event.endDate}
          multiDate={event.multiDate}
          color={isOwner ? colors.primary : colors.secondary}
        />

        <View style={styles.contentContainer}>
          <Text type="subHeader" color={colors.black} numberOfLines={1}>
            {textFormatter(event.name.trim(), 50, "Event")}
          </Text>
          <View style={styles.detailRow}>
            <FontAwesome5 name="user" size={12} color={colors.gray} />
            <Text type="caption" color={colors.black} numberOfLines={1}>
              {host}
            </Text>
            <FontAwesome5 name="clock" size={12} color={colors.gray} />
            <Text type="caption" color={colors.black}>
              {formatTime(event.date)}
              {event.multiDate && event.endDate
                ? ` → ${formatTime(event.endDate)}`
                : ""}
            </Text>
          </View>
          {daysDuration && (
            <Text type="caption" color={colors.black}>
              {daysDuration} DAY{daysDuration > 1 ? "S" : ""}
            </Text>
          )}
        </View>

        <FontAwesome5 name="chevron-right" size={16} color={colors.gray} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    gap: 6,
    minWidth: 0
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  eventContainer: {
    ...card.medium,
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    padding: 12,
    width: "100%"
  }
});
