import { useCallback, useEffect, useState } from "react";

import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { padding } from "@/design-system/tokens/padding";
import { AccountStackParamList } from "@/features/app/navigationTypes";
import { syncUserPicture } from "@/services/cache";
import { updateEventInDatabase } from "@/services/firebase/firebaseEventFunctions";
import {
  checkInvitedToEvent,
  deleteEventLinkResponse,
  deleteInviteFromDatabase,
  updateEventLinkResponse
} from "@/services/firebase/firebaseInviteFunctions";
import { AlertOptions } from "@/types/AlertOptions";
import { Event } from "@/types/Event";
import { Invite } from "@/types/Invite";
import { User } from "@/types/User";
import { UserInvite } from "@/types/UserInvite";
import { AppError } from "@/utils/error";
import { getHitSlop } from "@/utils/hitSlop";
import { log } from "@/utils/logging";

interface EventInviteUserItemProps {
  user: User;
  invite: Invite;
  event: Event;
  refreshUsers: () => void;
  deleteGuestManual: (user: UserInvite) => void;
  setResponseManual: (user: UserInvite, response: string) => void;
}

export function EventInviteUserItem({
  user,
  invite,
  event,
  refreshUsers,
  deleteGuestManual,
  setResponseManual
}: EventInviteUserItemProps) {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [inviteId, setInviteId] = useState<string | null>(null);
  const navigation =
    useNavigation() as StackNavigationProp<AccountStackParamList>;
  const appUser = invite.type === "app";

  const getInviteId = useCallback(async () => {
    const invite = await checkInvitedToEvent(event, user.uid);
    if (invite) {
      setInviteId(invite.id);
    } else {
      log("User is not invited to the event, inviteId is null", "warn");
    }
  }, [user, event]);

  const fetchUserImage = useCallback(async () => {
    const imageUri = await syncUserPicture(user);
    setUserImage(imageUri ?? null);
  }, [user]);

  // Fetch user image
  useEffect(() => {
    if (!user || !appUser) return;

    getInviteId();
    fetchUserImage();
  }, [user, appUser, event, getInviteId, fetchUserImage]);

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
        log("Removing user from event", "info");
        event.invited = event.invited.filter(
          (invited: string) => invited !== user.uid
        );
        await updateEventInDatabase(event);
        await deleteInviteFromDatabase(inviteId ?? "");
        log("User removed from event", "info");
      } catch (error) {
        new AppError(error, "Error removing user from event", true);
      }
    } else if (invite.type === "link") {
      await deleteEventLinkResponse(invite.id);
    } else if (invite.type === "manual") {
      deleteGuestManual({ user, invite });
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
        setResponseManual({ user, invite }, response);
      }
      if (refreshUsers) {
        refreshUsers();
      }
    },
    [setResponseManual, user, invite, refreshUsers]
  );

  const onEllipsisPress = useCallback(() => {
    if (appUser) {
      Alert.alert(
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
        ],
        { cancelable: true }
      );
    } else {
      const allResponses = ["accept", "maybe", "decline"];

      // Remove the user's response from the list

      const newResponses = allResponses.filter(
        (response: string) => response !== invite.response
      );

      let allOptions: AlertOptions[] = [];
      // Show the alert with the new responses
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

      Alert.alert("User Options", "Select an option", allOptions, {
        cancelable: true
      });
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
          {userImage ? (
            <Image source={{ uri: userImage }} style={styles.userImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <FontAwesome5 name="user" size={20} color={colors.black} />
            </View>
          )}
          <View style={[padding.smallWidget, styles.userInfo]}>
            <Text type="subHeader" style={styles.userName}>
              {user.name}
            </Text>
            <Text type="body" style={styles.inviteType}>
              {invite.type}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onEllipsisPress}
        hitSlop={getHitSlop("medium")}
      >
        <View style={styles.ellipsisButton}>
          <FontAwesome5 name="ellipsis-h" size={24} color={colors.black} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 12
  },
  ellipsisButton: {
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  inviteType: {
    color: colors.black
  },
  placeholderImage: {
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 24,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  touchableContainer: {
    flex: 1
  },
  userImage: {
    borderRadius: 24,
    height: 40,
    width: 40
  },
  userInfo: {
    alignItems: "flex-start",
    backgroundColor: colors.lightGray,
    flex: 1,
    paddingHorizontal: 12
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
