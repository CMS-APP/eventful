import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AccountStackParamList } from "@/app/navigation";
import { Button } from "@/design-system/components/buttons/Button";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { padding } from "@/design-system/tokens/padding";
import { InviteGuest } from "@/features/events/hooks/useEventInviteFollowing";
import { ProfilePicture } from "@/features/profile/components/ProfilePicture";
import { updateEventInDatabase } from "@/services/firebase/event";
import {
  deleteInviteFromDatabase,
  sendInvite
} from "@/services/firebase/invite";
import { deleteUpdateNotification } from "@/services/firebase/notifications";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";
import { showOptionsAlert } from "@/utils/alertModal";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

interface EventInviteGuestItemProps {
  guest: InviteGuest;
  event: Event;
  refreshInvites: () => void;
}

export function EventInviteGuestItem({
  guest,
  event,
  refreshInvites
}: EventInviteGuestItemProps) {
  const { user } = guest;
  const guestId = user.uid;
  const userId = useSelector((state: UserState) => state.uid);
  const name = useSelector((state: UserState) => state.name);
  const username = useSelector((state: UserState) => state.username);
  const navigation =
    useNavigation() as StackNavigationProp<AccountStackParamList>;
  const [invited, setInvited] = useState(guest.invited);
  const [inviteId, setInviteId] = useState(guest.inviteId);
  const [processing, setProcessing] = useState(false);

  const removeUserFromEvent = useCallback(async () => {
    setProcessing(true);
    try {
      event.invited = event.invited.filter(
        (invited: string) => invited !== guestId
      );
      await updateEventInDatabase(event);
      setInvited(false);
      await deleteInviteFromDatabase(inviteId ?? "");
      await deleteUpdateNotification(userId, guestId, event.id);
      refreshInvites();
    } catch (error) {
      log(`Error Removing User: ${error}`, "error");
      showErrorToast("Error Removing User");
    } finally {
      setProcessing(false);
    }
  }, [event, guestId, inviteId, userId, refreshInvites]);

  const removeUserAlert = useCallback(() => {
    showOptionsAlert(
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
      ]
    );
  }, [removeUserFromEvent]);

  const inviteUser = useCallback(async () => {
    if (invited) {
      removeUserAlert();
      return;
    }

    setProcessing(true);
    setInvited(true);
    try {
      const { inviteId } = await sendInvite(
        userId,
        name,
        username,
        user,
        event
      );
      setInviteId(inviteId);
      refreshInvites();
    } finally {
      setProcessing(false);
    }
  }, [
    invited,
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
  }, [user, navigation]);

  return (
    <TouchableOpacity
      style={styles.touchable}
      onPress={handlePress}
      hitSlop={getHitSlop("medium")}
    >
      <View style={[padding.mediumWidget, styles.container]}>
        <View style={styles.userRow}>
          <ProfilePicture size={36} user={user} />
          <View style={styles.userInfo}>
            <Text type="body" style={styles.userName}>
              {user.name}
            </Text>
            <Text type="body" italic style={styles.username}>
              {user.username}
            </Text>
          </View>

          <Button
            text={invited ? "Remove" : "Invite"}
            leadingIcon={invited ? "user-times" : "user-plus"}
            onPress={inviteUser}
            color={invited ? colors.primaryTint : colors.secondary}
            textColor={colors.white}
            size="small"
            disabled={processing}
            loading={processing}
          />
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
  touchable: {
    width: "100%"
  },
  userInfo: {
    flex: 1
  },
  userName: {
    textTransform: "capitalize"
  },
  userRow: {
    alignItems: "center",
    alignSelf: "stretch",
    flexDirection: "row",
    gap: 12
  },
  username: {
    color: colors.gray,
    textTransform: "lowercase"
  }
});
