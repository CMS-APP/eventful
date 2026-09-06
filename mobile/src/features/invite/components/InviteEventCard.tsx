import { ActivityIndicator } from "react-native-paper";
import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AppStackParamList } from "@/app/navigation";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { padding } from "@/design-system/tokens/padding";
import { ProfilePicture } from "@/features/profile/components/ProfilePicture";
import { getInviteFromDatabase, sendInvite } from "@/services/firebase/invite";
import { getUserInfo } from "@/services/firebase/user";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";
import { Invite } from "@/types/Invite";
import { User } from "@/types/User";
import { showOptionsAlert } from "@/utils/alertModal";
import { formatDate, formatTime, parseDatabaseDate } from "@/utils/date";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";
import { isValidUserId } from "@/utils/userId";

import { InviteEventCardResponse } from "./InviteEventCardResponse";
import { InviteProfilePictures } from "./InviteProfilePictures";

interface InviteEventCardProps {
  event: Event;
  user?: User | null;
  disabled?: boolean;
}
export function InviteEventCard({
  event,
  user,
  disabled = false
}: InviteEventCardProps) {
  const navigation = useNavigation() as StackNavigationProp<AppStackParamList>;
  const [host, setHost] = useState<User | null>(null);
  const userId = useSelector((state: UserState) => state.uid);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const startDate = parseDatabaseDate(event.date);
  const startDateString = formatDate(startDate);
  const startTimeString = formatTime(startDate);

  let endDateString = "";
  let endTimeString = "";
  if (event.multiDate) {
    const endDate = parseDatabaseDate(event.endDate);
    endDateString = formatDate(endDate);
    endTimeString = formatTime(endDate);
  }

  const fetchHost = useCallback(async () => {
    const host = await getUserInfo(event.userId);
    setHost(host);
  }, [event]);

  const fetchInvite = useCallback(async () => {
    if (!isValidUserId(userId)) return;

    const invite = await getInviteFromDatabase(event, userId);
    setInvite(invite);
  }, [event, userId]);

  useEffect(() => {
    fetchHost();
    fetchInvite();
  }, [fetchHost, fetchInvite]);

  const handleInvite = useCallback(async () => {
    try {
      const { refresh } = await sendInvite(
        host?.uid || "",
        host?.name || "",
        host?.username || "",
        user as User,
        event as Event
      );
      if (refresh) {
        setRefreshKey((prev: number) => prev + 1);
      }
    } catch (error) {
      log(`Error Inviting User: ${error}`, "error");
      showErrorToast("Error Inviting User");
    }
  }, [host?.uid, host?.name, host?.username, user, event]);

  const inviteToEventAlert = useCallback(() => {
    showOptionsAlert(
      "Invite to event",
      `Are you sure you want to invite ${user?.name} to this event?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Invite",
          onPress: async () => {
            await handleInvite();
          }
        }
      ]
    );
  }, [user, handleInvite]);

  const alreadyInvitedAlert = useCallback(() => {
    Alert.alert(
      "Already Invited",
      `${user?.name} is already invited to this event.`,
      [{ text: "OK", style: "cancel" }]
    );
  }, [user?.name]);

  const onPress = useCallback(() => {
    if (userId !== host?.uid) {
      if (invite) {
        navigation.navigate("EventInvite", {
          invite,
          event,
          host: host as User
        });
      }
      return;
    }

    if (!invite) {
      inviteToEventAlert();
    } else {
      alreadyInvitedAlert();
    }
  }, [
    userId,
    invite,
    navigation,
    event,
    host,
    inviteToEventAlert,
    alreadyInvitedAlert
  ]);

  if (!host) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.container,
        disabled ? styles.containerDisabled : styles.containerEnabled
      ]}
      hitSlop={getHitSlop("large")}
    >
      <View style={styles.contentRow}>
        <View style={styles.contentContainer}>
          {invite && host && userId === host.uid && (
            <View style={styles.invitedBadge}>
              <Text type="body" color="white">
                Already Invited
              </Text>
            </View>
          )}
          <View style={styles.profileRow}>
            <ProfilePicture user={host} size={50} />
            <InviteProfilePictures key={refreshKey} event={event} />
          </View>
          <View style={styles.eventInfo}>
            <Text type="subHeader">{event.name.trim() || "Event"}</Text>
            <Text type="body">
              {startDateString}
              {event.multiDate ? " - " + endDateString : ""}
            </Text>
            <Text type="body">
              {startTimeString}
              {event.multiDate ? " - " + endTimeString : ""}
            </Text>
          </View>
        </View>
        {invite && <InviteEventCardResponse invite={invite} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    ...padding.largeWidget,
    ...card.medium,
    gap: 12
  },
  containerDisabled: {
    opacity: 0.5
  },
  containerEnabled: {
    opacity: 1
  },
  contentContainer: {
    flex: 1,
    gap: 12
  },
  contentRow: {
    alignItems: "center",
    flexDirection: "row"
  },
  eventInfo: {
    alignItems: "flex-start"
  },
  invitedBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  profileRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12
  }
});
