import { useCallback, useEffect, useState } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome5 } from "@expo/vector-icons";

import { AccountStackParamList } from "@/app/navigation";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import type {
  DeleteGuestManual,
  SetResponseManual
} from "@/features/events/components/guest-list/EventInvitesRSVPUserList";
import { ProfilePicture } from "@/features/profile/components/ProfilePicture";
import { trackInviteResponseChanged } from "@/services/analytics/events";
import { updateEventInDatabase } from "@/services/firebase/event";
import {
  checkInvitedToEvent,
  deleteEventLinkResponse,
  deleteInviteFromDatabase,
  updateEventLinkResponse
} from "@/services/firebase/invite";
import { AlertOptions } from "@/types/AlertOptions";
import { Event } from "@/types/Event";
import { Invite } from "@/types/Invite";
import { User } from "@/types/User";
import { showOptionsAlert } from "@/utils/alertModal";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

const inviteTypeLabels: Record<string, string> = {
  app: "In-App Friend",
  link: "Via Link",
  manual: "Added Manually"
};

const inviteTypeColors: Record<string, string> = {
  app: colors.primary,
  link: colors.primaryTint,
  manual: colors.primaryTint2
};

interface EventInviteUserItemProps {
  user: User;
  invite: Invite;
  event: Event;
  refreshUsers: () => void;
  deleteGuestManual: DeleteGuestManual;
  setResponseManual: SetResponseManual;
}

export function EventInviteUserItem({
  user,
  invite,
  event,
  refreshUsers,
  deleteGuestManual,
  setResponseManual
}: EventInviteUserItemProps) {
  const [inviteId, setInviteId] = useState<string | null>(null);
  const navigation =
    useNavigation() as StackNavigationProp<AccountStackParamList>;
  const appUser = invite.type === "app";

  const getInviteId = useCallback(async () => {
    const invite = await checkInvitedToEvent(event, user.uid);
    if (invite) {
      setInviteId(invite.id);
    }
  }, [user, event]);

  useEffect(() => {
    if (!user || !appUser) return;

    getInviteId();
  }, [user, appUser, event, getInviteId]);

  const handlePress = useCallback(() => {
    if (appUser) {
      navigation.navigate("Profile", {
        screen: "ProfileView",
        params: { user, type: invite.type ?? "app" }
      });
    }
  }, [appUser, navigation, user, invite.type]);

  const deleteGuest = useCallback(async () => {
    if (invite.type === "app") {
      try {
        event.invited = event.invited.filter(
          (invited: string) => invited !== user.uid
        );
        await updateEventInDatabase(event);
        await deleteInviteFromDatabase(inviteId ?? "");
      } catch (error) {
        log(`Error Removing User: ${error}`, "error");
        showErrorToast("Error Removing User");
      }
    } else if (invite.type === "link") {
      await deleteEventLinkResponse(invite.id);
    } else if (invite.type === "manual") {
      await deleteGuestManual({ user, invite });
    }

    if (refreshUsers) {
      refreshUsers();
    }
  }, [invite, event, user, inviteId, deleteGuestManual, refreshUsers]);

  const moveToResponse = useCallback(
    async (response: string) => {
      if (invite.type === "link") {
        await updateEventLinkResponse(invite.id, response);
      } else if (invite.type === "manual") {
        await setResponseManual({ user, invite }, response);
      }
      trackInviteResponseChanged(response);
      if (refreshUsers) {
        refreshUsers();
      }
    },
    [setResponseManual, user, invite, refreshUsers]
  );

  const onEllipsisPress = useCallback(() => {
    if (appUser) {
      showOptionsAlert(
        "Remove User",
        "Are you sure you want to remove this user from the event?",
        [
          {
            text: "Remove User",
            style: "destructive",
            onPress: deleteGuest
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
    } else {
      const allResponses = ["accept", "maybe", "decline"];
      const newResponses = allResponses.filter(
        (response: string) => response !== invite.response
      );

      let allOptions: AlertOptions[] = [];
      newResponses.forEach((response: string) => {
        allOptions.push({
          text: "Move to " + response,
          onPress: () => {
            moveToResponse(response);
          }
        });
      });

      allOptions.push({
        text: "Cancel",
        style: "cancel",
        onPress: () => {}
      });

      allOptions.push({
        text: "Remove User",
        style: "destructive",
        onPress: deleteGuest
      });

      showOptionsAlert("User Options", "Select an option", allOptions);
    }
  }, [appUser, invite.response, moveToResponse, deleteGuest]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        disabled={!appUser}
        style={styles.touchableContainer}
        onPress={handlePress}
        hitSlop={getHitSlop("medium")}
      >
        <View style={styles.userRow}>
          <ProfilePicture
            user={user}
            size={40}
            placeholderColor={inviteTypeColors[invite.type ?? ""]}
          />
          <View style={styles.userInfo}>
            <Text type="subHeader" style={styles.userName}>
              {user.name}
            </Text>
            <Text type="body" color={colors.gray} style={styles.userName}>
              {inviteTypeLabels[invite.type ?? ""] ?? invite.type}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onEllipsisPress}
        hitSlop={getHitSlop("medium")}
      >
        <View style={styles.ellipsisButton}>
          <FontAwesome5 name="ellipsis-h" size={18} color={colors.black} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...card.small,
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    padding: 8
  },
  ellipsisButton: {
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  touchableContainer: {
    flex: 1
  },
  userInfo: {
    flex: 1
  },
  userName: {
    textAlign: "left"
  },
  userRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 12
  }
});
