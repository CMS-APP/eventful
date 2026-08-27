import { useSelector } from "react-redux";

import { useCallback } from "react";

import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome5 } from "@expo/vector-icons";

import { AppStackParamList } from "@/app/navigationTypes";
import { UserPicture } from "@/components/views/UserPicture";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { getUserInfo } from "@/services/firebase/firebaseUserFunctions";
import { UserState } from "@/store/UserSlice";
import { EventInvite } from "@/types/EventInvite";
import { User } from "@/types/User";
import { parseDatabaseDate } from "@/utils/date";
import { haptics } from "@/utils/haptics";
import { getHitSlop } from "@/utils/hitSlop";
import { log } from "@/utils/logging";

interface ContactInviteItemProps {
  eventInvite: EventInvite;
}

export function ContactInviteItem({ eventInvite }: ContactInviteItemProps) {
  const event = eventInvite.event;
  const invite = eventInvite.invite;
  const response = invite.response;
  const userId = useSelector((state: UserState) => state.uid);
  const navigation = useNavigation() as StackNavigationProp<AppStackParamList>;

  const viewEvent = useCallback(async () => {
    if (!event) {
      return;
    }

    log("Viewing event", "info");
    const host = (await getUserInfo(event.userId)) as User;
    haptics.soft();

    if (host) {
      navigation.navigate("EventInvite", {
        invite: { ...invite, response },
        event,
        host
      });
    } else {
      Alert.alert("Error", "Host not found");
    }
  }, [event, invite, response]);

  if (!event) {
    return null;
  }

  let invitedList = event.invited.filter((uid: string) => uid !== userId);
  const invitedPics = invitedList.slice(0, 4);
  const remainder = invitedList.length - invitedPics.length;

  const date = parseDatabaseDate(event.date);

  const dateString = date.toLocaleString("en-UK", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <TouchableOpacity onPress={viewEvent} hitSlop={getHitSlop("medium")}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <UserPicture uid={event.userId} size={50} />
          <View style={styles.iconsContainer}>
            <FontAwesome5
              name={response === "accept" ? "check-circle" : "check"}
              size={16}
              color={response === "accept" ? colors.primary : colors.gray}
            />
            <FontAwesome5
              name={
                response === "maybe" || response === "pending"
                  ? "question-circle"
                  : "question"
              }
              size={16}
              color={
                response === "maybe" || response === "pending"
                  ? colors.secondary
                  : colors.gray
              }
            />
            <FontAwesome5
              name={response === "decline" ? "times-circle" : "times"}
              size={16}
              color={response === "decline" ? colors.tertiary : colors.gray}
            />
          </View>
        </View>

        <View>
          <Text type="subHeader" style={styles.eventName}>
            {event.name.trim() || "Event"}
          </Text>
          <Text type="body">{dateString}</Text>
        </View>

        {invitedPics.length > 0 && (
          <View>
            <Text type="body">Going</Text>
            <View style={styles.invitedPicsRow}>
              {invitedPics.map((user: string, index: number) => {
                return <UserPicture uid={user} key={user} size={30} />;
              })}

              {remainder > 0 && (
                <View style={styles.remainderContainer}>
                  <Text type="body" style={styles.remainderText}>
                    +{remainder}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightGray,
    borderRadius: 24,
    gap: 6,
    padding: 12
  },
  eventName: {
    textAlign: "left"
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row"
  },
  iconsContainer: {
    gap: 2.5,
    marginLeft: 6
  },
  invitedPicsRow: {
    flexDirection: "row",
    gap: 6
  },
  remainderContainer: {
    alignItems: "center",
    backgroundColor: colors.primaryTint,
    borderRadius: 12,
    height: 30,
    justifyContent: "center",
    width: 30
  },
  remainderText: {
    color: colors.white
  }
});
