import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { padding } from "@/design-system/tokens/padding";
import { AccountStackParamList } from "@/features/app/navigationTypes";
import { ProfilePicture } from "@/features/profile/components/ProfilePicture";
import { updateEventInDatabase } from "@/services/firebase/firebaseEventFunctions";
import {
  checkInvitedToEvent,
  deleteInviteFromDatabase,
  sendInvite
} from "@/services/firebase/firebaseInviteFunctions";
import { deleteUpdateNotification } from "@/services/firebase/firebaseNotification";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";
import { User } from "@/types/User";
import { AppError } from "@/utils/error";
import { getHitSlop } from "@/utils/hitSlop";
import { log } from "@/utils/logging";

interface EventInviteGuestItemProps {
  user: User;
  event: Event;
  invitedList: string[];
  refreshInvites: () => void;
}

export function EventInviteGuestItem({
  user,
  event,
  invitedList,
  refreshInvites
}: EventInviteGuestItemProps) {
  const guestId = user.uid;
  const userId = useSelector((state: UserState) => state.uid);
  const name = useSelector((state: UserState) => state.name);
  const username = useSelector((state: UserState) => state.username);
  const [inviteId, setInviteId] = useState<string | null>(null);
  const navigation =
    useNavigation() as StackNavigationProp<AccountStackParamList>;
  const [alreadyInvited, setAlreadyInvited] = useState(
    invitedList.includes(guestId)
  );

  const removeUserFromEvent = useCallback(async () => {
    try {
      log("Removing user from event", "info");
      event.invited = event.invited.filter(
        (invited: string) => invited !== guestId
      );
      await updateEventInDatabase(event);
      setAlreadyInvited(false);
      await deleteInviteFromDatabase(inviteId ?? "");
      await deleteUpdateNotification(userId, guestId, event.id);
      refreshInvites();
    } catch (error) {
      new AppError(error, "Error removing user from event", true);
    }
  }, [event, guestId, inviteId, userId]);

  const removeUserAlert = useCallback(() => {
    Alert.alert(
      "Remove User",
      "Are you sure you want to remove this user from the event?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: removeUserFromEvent
        }
      ],
      { cancelable: true }
    );
  }, [removeUserFromEvent]);

  const inviteUser = useCallback(async () => {
    if (alreadyInvited) {
      removeUserAlert();
    } else {
      setAlreadyInvited(true);
      const { inviteId } = await sendInvite(
        userId,
        name,
        username,
        user,
        event
      );
      setInviteId(inviteId);
      refreshInvites();
    }
  }, [
    alreadyInvited,
    userId,
    name,
    username,
    user,
    event,
    removeUserAlert,
    refreshInvites
  ]);

  const handlePress = useCallback(() => {
    navigation.navigate("Profile", {
      screen: "ProfileView",
      params: { user, type: "user" }
    });
  }, [user]);

  useEffect(() => {
    const getInviteId = async () => {
      const invite = await checkInvitedToEvent(event, guestId);
      if (invite) {
        setAlreadyInvited(true);
        setInviteId(invite.id);
      } else {
        setAlreadyInvited(false);
      }
    };

    getInviteId();
  }, [event, guestId]);

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={getHitSlop("medium")}>
      <View style={[padding.mediumWidget, styles.container]}>
        <View style={styles.userRow}>
          <ProfilePicture size={40} user={user} />
          <View style={styles.userInfo}>
            <Text type="body" style={styles.userName}>
              {user.name}
            </Text>
            <Text type="body" italic style={styles.username}>
              {user.username}
            </Text>
          </View>
          <TouchableOpacity onPress={inviteUser} hitSlop={getHitSlop("medium")}>
            <View style={[padding.smallWidget, styles.inviteButton]}>
              <Text type="body" color="white">
                {alreadyInvited ? "Remove" : "Invite"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightGray,
    width: "100%"
  },
  inviteButton: {
    backgroundColor: colors.primary
  },
  userInfo: {
    flex: 1
  },
  userName: {
    textTransform: "capitalize"
  },
  userRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  username: {
    color: colors.gray,
    textTransform: "lowercase"
  }
});
